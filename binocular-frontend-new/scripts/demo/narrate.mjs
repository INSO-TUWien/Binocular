#!/usr/bin/env node
// Production narration pipeline for demo-*.md scripts — the "real per-cue duration-synced recording
// pipeline" that edge-tts-trial.mjs / voiceover-trial.mjs (audio-only, NOT time-synced) exist to
// audition voices ahead of. For each narration cue this synthesizes real TTS audio via Edge's cloud
// neural voices (giving each em dash its own short spoken pause) and muxes the narration onto an
// already-recorded demo video — no burned-in subtitles; a duration-accurate .srt is still written
// alongside as an unburned sidecar (e.g. for a YouTube caption upload). ffmpeg/ffprobe required on PATH.
//
// Usage:
//   node scripts/demo/narrate.mjs synth <script.md> [voice]
//     Synthesizes every narration cue, caches the audio + a manifest (with measured per-cue and
//     total durations) under demo-output/narration/<slug>__<voice>/. Re-run is a no-op if the cue
//     text hasn't changed since the cache was written. Prints the total narration duration — use
//     this to compare against a recorded video's duration before deciding on pacing.
//
//   node scripts/demo/narrate.mjs finalize <script.md> <video> [voice] [outPath]
//     Runs synth (reusing the cache when possible), muxes the narration onto <video>, writes a
//     sidecar .srt next to it, and writes an H.264 .mp4 to outPath (default:
//     demo-output/narrated/<slug>.mp4).

import { execFileSync } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import crypto from 'node:crypto';
import WebSocket from 'ws';

const DEFAULT_VOICE = 'en-GB-RyanNeural';
const GAP_SEC = 0.4;

function fail(message) {
  console.error(message);
  exit(1);
}

function ensureTool(bin) {
  try {
    execFileSync(bin, ['-version'], { stdio: 'ignore' });
  } catch {
    fail(`${bin} not found on PATH.`);
  }
}

// Narration lives in blockquote (`> `) paragraphs; stage directions (`**[cue: ...]**`) are skipped.
// Consecutive `>` lines are one cue; a blank line (or any non-`>` line) ends it. Each cue also
// records the nearest preceding `## Section (~Ns)` heading it falls under (estimate suffix
// stripped) — purely so synth() can report real per-section durations later; cues before any
// heading get section: null, reported as "(untitled)".
function extractCues(mdText) {
  const cues = [];
  let current = [];
  let section = null;
  const flush = () => {
    if (current.length) cues.push({ text: current.join(' ').replace(/\s+/g, ' ').trim(), section });
    current = [];
  };
  for (const line of mdText.split(/\r?\n/)) {
    const heading = /^##\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      section = heading[1].replace(/\s*\([^)]*\d[^)]*\)\s*$/, '').trim();
      continue;
    }
    const match = /^>\s?(.*)$/.exec(line);
    if (match) current.push(match[1]);
    else flush();
  }
  flush();
  return cues.filter((c) => c.text);
}

// Groups the manifest's per-cue durations by their `## Section` heading and prints an approximate
// on-timeline runtime per section (cue speech + the fixed GAP_SEC gap between cues within it) — so
// after editing a cue you can immediately see which section's runtime moved, and compare it against
// that section's hand-written `(~Ns)` estimate in the .md, instead of hand-summing beat() calls or
// re-reading every cue's durationSec. Purely a print; doesn't change synthesis, muxing, or the .md.
function printSectionTotals(manifest) {
  const order = [];
  const totals = new Map();
  for (const cue of manifest.cues) {
    const key = cue.section ?? '(untitled)';
    if (!totals.has(key)) {
      totals.set(key, { durationSec: 0, count: 0 });
      order.push(key);
    }
    const entry = totals.get(key);
    entry.durationSec += cue.durationSec;
    entry.count += 1;
  }
  if (order.length <= 1) return;
  console.log('  per-section runtime (cue speech + inter-cue gaps, approximating the actual timeline):');
  for (const key of order) {
    const { durationSec, count } = totals.get(key);
    const sectionSec = durationSec + GAP_SEC * Math.max(0, count - 1);
    console.log(`    ${key}: ~${sectionSec.toFixed(1)}s (${count} cue${count === 1 ? '' : 's'})`);
  }
}

// ─── Edge TTS client (same undocumented WebSocket API as edge-tts-trial.mjs) ────────────────────

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const CHROMIUM_MAJOR_VERSION = '143';
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;
const WIN_EPOCH = 11644473600;

function generateSecMsGec() {
  let ticks = Date.now() / 1000 + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= 1e9 / 100;
  return crypto
    .createHash('sha256')
    .update(`${Math.floor(ticks)}${TRUSTED_CLIENT_TOKEN}`)
    .digest('hex')
    .toUpperCase();
}

const USER_AGENT =
  `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ` +
  `Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0`;

function connectId() {
  return randomUUID().replace(/-/g, '');
}

function buildSsml(text, voice) {
  return (
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
    `<voice name='${voice}'>` +
    `<prosody pitch='+0Hz' rate='+0%' volume='+0%'>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</prosody>` +
    `</voice></speak>`
  );
}

// Manual pronunciation corrections for terms Edge TTS reads wrong even though the written form is
// fine for a reader — e.g. an unwrapped camelCase identifier ("MaxBurst") read as one garbled word,
// a bare abbreviation ("KPI") that isn't reliably spelled out letter-by-letter, or a slash-separated
// list ("curved/stepped/linear") whose "/" gets vocalized as "slash". Applied to the whole cue text
// (prose included, not just backtick spans) before the backtick-specific cleanup below, so it also
// catches identifiers a script author didn't wrap in backticks. Only affects what's sent to TTS —
// the raw cue text (and therefore the .srt sidecar, via wrapForSubtitle) is untouched. Add entries
// here rather than rewording the .md when the *visible* script text should stay as-is.
const SPEECH_OVERRIDES = [
  [/\bMaxBurst\b/g, 'Max Burst'],
  [/\bMaxChangeset\b/g, 'Max Changeset'],
  [/\bAvgChangeset\b/g, 'Average Changeset'],
  [/\bAvg\b/g, 'Average'],
  [/\bMR\b/g, 'M R'],
  [/\bKPI\b/g, 'K P I'],
  [/\bGitHub\b/g, 'Github'],
  [/\bGitLab\b/g, 'Gitlab'],
  [/\bgit\b/g, 'Gitt'],
  [/\bassignee\b/gi, 'assign-E'],
  [/curved\/stepped\/linear/g, 'curved, stepped, or linear'],
  [/success\/fail/g, 'success or fail'],
  [/addition\/deletion/g, 'addition or deletion'],
  [/pull\/merge/g, 'pull or merge'],
  [/opened\/merged\/closed/g, 'opened, merged, or closed'],
];

function applySpeechOverrides(text) {
  return SPEECH_OVERRIDES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

// Narration text carries markdown formatting (`code`, *emphasis*) meant for a reader, not a speaker —
// sent as-is, the TTS voice would either vocalize the literal backtick/asterisk characters or garble a
// backtick-wrapped identifier by reading it as one run-together word. Clean it up before synthesis only
// (the raw cue text is untouched, so the .srt sidecar still shows normal markdown-free reading text via
// wrapForSubtitle — this only affects what's sent to the TTS request).
function cleanForSpeech(text) {
  return applySpeechOverrides(text)
    .replace(/`([^`]+)`/g, (_m, code) =>
      code
        .replace(/===|!==/g, ' equals ')
        .replace(/[._-]/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .replace(/\*([^*]+)\*/g, '$1');
}

// This endpoint rejects any SSML containing a <break> element outright ("SSML is invalid", verified
// empirically) — no in-band way to insert a pause. So instead, each em dash splits its cue into
// separate TTS requests, synthesized independently and spliced back together with a short silence.
function splitOnDash(cueText) {
  return cueText
    .split(/\s*—\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function synthesizeCue(ws, text, voice) {
  const requestId = connectId();
  const chunks = [];

  const donePromise = new Promise((resolve, reject) => {
    const cleanup = () => {
      ws.off('message', onMessage);
      ws.off('error', onError);
      ws.off('close', onClose);
    };
    const onMessage = (data, isBinary) => {
      if (isBinary) {
        const headerLength = data.readUInt16BE(0);
        chunks.push(data.subarray(2 + headerLength));
        return;
      }
      const text = data.toString('utf-8');
      if (text.includes(`X-RequestId:${requestId}`) && text.includes('Path:turn.end')) {
        cleanup();
        resolve();
      }
    };
    const onError = (err) => {
      cleanup();
      reject(err);
    };
    // A silent close (no 'error') would otherwise leave this promise pending forever — and once the
    // socket is gone, nothing keeps Node's event loop alive, so the process just exits with code 0
    // having produced nothing, instead of failing loudly.
    const onClose = (code, reason) => {
      cleanup();
      reject(new Error(`WebSocket closed before Path:turn.end (code=${code}, reason=${reason?.toString() || '<none>'})`));
    };
    ws.on('message', onMessage);
    ws.on('error', onError);
    ws.on('close', onClose);
  });

  const timestamp = new Date().toString();
  ws.send(
    `X-RequestId:${requestId}\r\n` +
      `Content-Type:application/ssml+xml\r\n` +
      `X-Timestamp:${timestamp}Z\r\n` +
      `Path:ssml\r\n\r\n` +
      buildSsml(text, voice),
  );

  await donePromise;
  return Buffer.concat(chunks);
}

async function openEdgeTtsSocket() {
  const secMsGec = generateSecMsGec();
  const wsUrl =
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}&ConnectionId=${connectId()}`;

  const ws = new WebSocket(wsUrl, {
    headers: {
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  ws.send(
    `X-Timestamp:${new Date().toString()}\r\n` +
      `Content-Type:application/json; charset=utf-8\r\n` +
      `Path:speech.config\r\n\r\n` +
      `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`,
  );

  return ws;
}

// Cue start times (seconds): sequential, fixed GAP_SEC gaps between cues — real video-timestamp
// matching (beat log + anchors) was tried and dropped (see finalize()'s comment for why).
const LEAD_IN_SEC = 2;

function computeCueStarts(manifest) {
  const starts = new Array(manifest.cues.length);
  let prevEnd = 0;
  manifest.cues.forEach((cue, i) => {
    const start = i === 0 ? LEAD_IN_SEC : prevEnd + GAP_SEC;
    starts[i] = start;
    prevEnd = start + cue.durationSec;
  });
  return starts;
}

// ─── Cache / manifest ─────────────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Bump MANIFEST_VERSION whenever the audio-generation approach or manifest shape changes, so cached
// audio from before the change (keyed only by the raw cue text) is correctly treated as stale.
const MANIFEST_VERSION = 1;
const DASH_GAP_SEC = 0.25;

function cuesHash(cues) {
  return createHash('sha256')
    .update(JSON.stringify({ v: MANIFEST_VERSION, cues }))
    .digest('hex')
    .slice(0, 16);
}

function cacheDirFor(scriptPath, voice) {
  const slug = slugify(path.basename(scriptPath, '.md'));
  return path.resolve('demo-output/narration', `${slug}__${slugify(voice)}`);
}

function probeDurationSec(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], {
    encoding: 'utf-8',
  });
  return parseFloat(out.trim());
}

async function synth(scriptPath, voice) {
  const cues = extractCues(readFileSync(scriptPath, 'utf-8'));
  if (!cues.length) fail(`No narration (blockquote) paragraphs found in ${scriptPath}.`);

  const dir = cacheDirFor(scriptPath, voice);
  mkdirSync(dir, { recursive: true });
  const manifestPath = path.join(dir, 'manifest.json');
  const hash = cuesHash(cues);

  if (existsSync(manifestPath)) {
    const cached = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    if (cached.hash === hash && cached.cues.every((c) => c.parts.every((p) => existsSync(p.path)))) {
      console.log(`[${path.basename(scriptPath)}] cache hit (${cues.length} cues, ${cached.totalDurationSec.toFixed(1)}s) — ${dir}`);
      printSectionTotals(cached);
      return cached;
    }
  }

  console.log(`[${path.basename(scriptPath)}] synthesizing ${cues.length} cue(s) via ${voice}...`);
  const ws = await openEdgeTtsSocket();
  const manifestCues = [];
  try {
    for (let i = 0; i < cues.length; i++) {
      const segments = splitOnDash(cues[i].text);
      const parts = [];
      for (let j = 0; j < segments.length; j++) {
        const audio = await synthesizeCue(ws, cleanForSpeech(segments[j]), voice);
        const partPath = path.join(dir, `cue-${String(i + 1).padStart(2, '0')}-${String(j + 1).padStart(2, '0')}.mp3`);
        writeFileSync(partPath, audio);
        parts.push({ path: partPath, durationSec: probeDurationSec(partPath) });
      }
      const durationSec = parts.reduce((a, p) => a + p.durationSec, 0) + DASH_GAP_SEC * Math.max(0, parts.length - 1);
      manifestCues.push({ text: cues[i].text, section: cues[i].section, parts, durationSec });
      console.log(`  cue ${i + 1}/${cues.length}: ${durationSec.toFixed(2)}s (${parts.length} part${parts.length > 1 ? 's' : ''})`);
    }
  } finally {
    ws.close();
  }

  const totalDurationSec = manifestCues.reduce((a, c) => a + c.durationSec, 0) + GAP_SEC * Math.max(0, manifestCues.length - 1);
  const manifest = { hash, voice, gapSec: GAP_SEC, dashGapSec: DASH_GAP_SEC, cues: manifestCues, totalDurationSec };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[${path.basename(scriptPath)}] total narration duration: ${totalDurationSec.toFixed(1)}s`);
  printSectionTotals(manifest);
  return manifest;
}

// ─── SRT + mux ────────────────────────────────────────────────────────────────────────────────

function srtTimestamp(totalSeconds) {
  const ms = Math.round(totalSeconds * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const msRem = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(msRem).padStart(3, '0')}`;
}

// Wraps long cues onto at most two lines (~42 chars/line, matching common subtitle convention) so a
// caption never spans the full width of a 1080p frame at once.
function wrapForSubtitle(text, maxLineLen = 60) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && (line + ' ' + word).length > maxLineLen) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

function buildSrt(manifest, starts) {
  const blocks = manifest.cues.map((cue, i) => {
    const start = starts[i];
    const end = start + cue.durationSec;
    return `${i + 1}\n${srtTimestamp(start)} --> ${srtTimestamp(end)}\n${wrapForSubtitle(cue.text)}\n`;
  });
  return blocks.join('\n');
}

// Concatenates one cue's dash-split parts (with short DASH_GAP_SEC silence between them) into a
// single audio file. A single-part cue needs no concatenation — its own mp3 is already the whole cue.
// Always returns a normalized .wav — never the raw .mp3 directly. Mixing raw mp3 and wav files in one
// concat-demuxer list (as this used to for single-part cues) proved unreliable: ffmpeg's concat
// demuxer mis-detects durations across mixed codecs and silently truncates the final narration track
// partway through (confirmed: a 24-cue, ~470s timeline came out as an 378s narration.wav, dropping the
// last several cues entirely with no error). Converting every piece to a uniform format first avoids it.
function buildPerCueAudio(cue, dir, cueIndex, dashSilencePath, sampleRate) {
  const toFfmpegPath = (p) => p.replace(/\\/g, '/');
  if (cue.parts.length === 1) {
    const outPath = path.join(dir, `cue-${String(cueIndex + 1).padStart(2, '0')}-full.wav`);
    execFileSync('ffmpeg', ['-y', '-i', cue.parts[0].path, '-ar', String(sampleRate), '-ac', '1', outPath], { stdio: 'ignore' });
    return outPath;
  }
  const listPath = path.join(dir, `cue-${String(cueIndex + 1).padStart(2, '0')}-concat.txt`);
  const lines = [];
  cue.parts.forEach((part, j) => {
    lines.push(`file '${toFfmpegPath(part.path)}'`);
    if (j < cue.parts.length - 1) lines.push(`file '${toFfmpegPath(dashSilencePath)}'`);
  });
  writeFileSync(listPath, lines.join('\n'), 'utf-8');
  const outPath = path.join(dir, `cue-${String(cueIndex + 1).padStart(2, '0')}-full.wav`);
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-ar', String(sampleRate), '-ac', '1', outPath], {
    stdio: 'ignore',
  });
  return outPath;
}

function makeSilence(dir, name, seconds, sampleRate, channelLayout) {
  const p = path.join(dir, name);
  execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', `anullsrc=r=${sampleRate}:cl=${channelLayout}`, '-t', seconds.toFixed(3), p], {
    stdio: 'ignore',
  });
  return p;
}

// Builds the full narration track by placing each cue's audio at its computed start time — variable
// silence between cues (not a fixed gap) so the track matches real per-cue video timestamps when known.
function buildNarrationTrack(manifest, dir, starts) {
  const toFfmpegPath = (p) => p.replace(/\\/g, '/');
  const fmt = JSON.parse(
    execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-select_streams',
        'a:0',
        '-show_entries',
        'stream=sample_rate,channels',
        '-of',
        'json',
        manifest.cues[0].parts[0].path,
      ],
      { encoding: 'utf-8' },
    ),
  ).streams[0];

  const channelLayout = fmt.channels === 2 ? 'stereo' : 'mono';
  const dashSilencePath = makeSilence(dir, 'silence-dash.wav', manifest.dashGapSec, fmt.sample_rate, channelLayout);

  const listPath = path.join(dir, 'concat-list.txt');
  const listLines = [];
  let prevEnd = 0;
  manifest.cues.forEach((cue, i) => {
    const gap = starts[i] - prevEnd;
    if (gap > 0.001) {
      const gapPath = makeSilence(dir, `silence-gap-${String(i + 1).padStart(2, '0')}.wav`, gap, fmt.sample_rate, channelLayout);
      listLines.push(`file '${toFfmpegPath(gapPath)}'`);
    }
    const cueAudioPath = buildPerCueAudio(cue, dir, i, dashSilencePath, fmt.sample_rate);
    listLines.push(`file '${toFfmpegPath(cueAudioPath)}'`);
    prevEnd = starts[i] + cue.durationSec;
  });
  writeFileSync(listPath, listLines.join('\n'), 'utf-8');

  const narrationPath = path.join(dir, 'narration.wav');
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-ar', String(fmt.sample_rate), '-ac', '1', narrationPath], {
    stdio: 'inherit',
  });
  return narrationPath;
}

async function finalize(scriptPath, videoPath, voice, outPath) {
  const manifest = await synth(scriptPath, voice);
  const dir = cacheDirFor(scriptPath, voice);
  // Real-video-timestamp matching (beat log + anchors) is deliberately NOT used here anymore — it
  // could only ever place a cue's audio at a video position that already happened to be recorded,
  // and any gap between the recorded video's real pacing and that placement became dead air with no
  // narration (confirmed: up to ~79s silences). Now that beat() durations are calculated directly
  // from each cue's own measured speech length (see scripts/demo/*.test.ts's "// Cue N" tags), the
  // simple answer is to just play narration sequentially — cue, small fixed gap, next cue — which is
  // guaranteed never to have a gap longer than GAP_SEC.
  const starts = computeCueStarts(manifest);
  console.log(`[${path.basename(scriptPath)}] sequential narration (fixed ${GAP_SEC}s gaps) — real-video-timing matching disabled`);

  const narrationPath = buildNarrationTrack(manifest, dir, starts);

  const resolvedOut = outPath ?? path.resolve('demo-output/narrated', `${slugify(path.basename(scriptPath, '.md'))}.mp4`);
  mkdirSync(path.dirname(resolvedOut), { recursive: true });

  const resolvedVideo = path.resolve(videoPath);
  const resolvedNarration = path.resolve(narrationPath);

  // Sidecar .srt (not burned in, not muxed as a track) — timed off the same real/estimated cue
  // starts as the narration track, in case it's wanted later e.g. as a YouTube caption upload.
  const srtPath = path.join(path.dirname(resolvedOut), `${slugify(path.basename(scriptPath, '.md'))}.srt`);
  writeFileSync(srtPath, buildSrt(manifest, starts), 'utf-8');

  console.log(`Muxing narration -> ${resolvedOut}`);
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      resolvedVideo,
      '-i',
      resolvedNarration,
      '-map',
      '0:v',
      '-map',
      '1:a',
      '-c:v',
      'libx264',
      '-crf',
      '18',
      '-preset',
      'slow',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      resolvedOut,
    ],
    { stdio: 'inherit' },
  );

  console.log(`Done -> ${resolvedOut}`);
  return resolvedOut;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────────────────────

async function main() {
  const [, , cmd, ...rest] = process.argv;
  ensureTool('ffmpeg');
  ensureTool('ffprobe');

  if (cmd === 'synth') {
    const [scriptArg, voiceArg] = rest;
    if (!scriptArg) fail('Usage: node scripts/demo/narrate.mjs synth <script.md> [voice]');
    const scriptPath = path.resolve(scriptArg);
    if (!existsSync(scriptPath)) fail(`Script not found: ${scriptPath}`);
    await synth(scriptPath, voiceArg || DEFAULT_VOICE);
    return;
  }

  if (cmd === 'finalize') {
    const [scriptArg, videoArg, voiceArg, outArg] = rest;
    if (!scriptArg || !videoArg) fail('Usage: node scripts/demo/narrate.mjs finalize <script.md> <video> [voice] [outPath]');
    const scriptPath = path.resolve(scriptArg);
    const videoPath = path.resolve(videoArg);
    if (!existsSync(scriptPath)) fail(`Script not found: ${scriptPath}`);
    if (!existsSync(videoPath)) fail(`Video not found: ${videoPath}`);
    await finalize(scriptPath, videoPath, voiceArg || DEFAULT_VOICE, outArg);
    return;
  }

  fail(
    'Usage:\n' +
      '  node scripts/demo/narrate.mjs synth <script.md> [voice]\n' +
      '  node scripts/demo/narrate.mjs finalize <script.md> <video> [voice] [outPath]',
  );
}

main().catch((err) => fail(`narrate.mjs failed: ${err.stack || err}`));
