#!/usr/bin/env node
// Quick proof-of-concept, sibling to voiceover-trial.mjs: synthesizes a demo-*.md script's narration via
// Microsoft Edge's free online neural TTS service (the same backend behind Edge's "Read aloud" feature).
// This is the only reachable path to voices like Andrew/Ava/Ryan ("Natural"/HD voices) — their on-device
// counterparts are packaged as isolated MSIX apps whose COM voice engine is scoped to Narrator's own app
// identity and cannot be activated from an unpackaged process (confirmed via registry/AppX inspection).
// The cloud voices are the same models, reachable over a plain (undocumented, reverse-engineered) WebSocket
// API. Narration text is sent to a Microsoft endpoint over the network.
// NOT time-synced, no video muxing — audio-only trial. ffmpeg required on PATH (for cue concatenation only).
// Usage: node scripts/demo/edge-tts-trial.mjs <script.md> <voiceShortName>
// e.g.:  node scripts/demo/edge-tts-trial.mjs scripts/demo/demo-category-builds.md en-US-AndrewMultilingualNeural

import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import WebSocket from 'ws';
import { CHROMIUM_MAJOR_VERSION, SEC_MS_GEC_VERSION, TRUSTED_CLIENT_TOKEN, generateSecMsGec, muidCookie } from './edgeTtsDrm.mjs';

const [, , scriptArg, voiceArg] = process.argv;
const voiceName = voiceArg || 'en-US-AndrewMultilingualNeural';

function fail(message) {
  console.error(message);
  exit(1);
}

if (!scriptArg) {
  fail('Usage: node scripts/demo/edge-tts-trial.mjs <script.md> <voiceShortName>');
}

try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
} catch {
  fail('ffmpeg not found on PATH.');
}

const scriptPath = path.resolve(scriptArg);
if (!existsSync(scriptPath)) fail(`Script not found: ${scriptPath}`);

function extractCues(mdText) {
  const cues = [];
  let current = [];
  const flush = () => {
    if (current.length) cues.push(current.join(' ').replace(/\s+/g, ' ').trim());
    current = [];
  };
  for (const line of mdText.split(/\r?\n/)) {
    const match = /^>\s?(.*)$/.exec(line);
    if (match) {
      current.push(match[1]);
    } else {
      flush();
    }
  }
  flush();
  return cues.filter(Boolean);
}

const cues = extractCues(readFileSync(scriptPath, 'utf-8'));
if (!cues.length) fail('No narration (blockquote) paragraphs found in script.');
console.log(`Found ${cues.length} narration cue(s) in ${path.basename(scriptPath)}.`);

const OUTPUT_DIR = path.resolve('demo-output/voiceover-trial');
const audioDir = path.join(OUTPUT_DIR, 'cues-edge');
mkdirSync(audioDir, { recursive: true });

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

async function synthesizeCue(ws, text, voice) {
  const requestId = connectId();
  const chunks = [];

  const donePromise = new Promise((resolve, reject) => {
    const onMessage = (data, isBinary) => {
      if (isBinary) {
        const headerLength = data.readUInt16BE(0);
        chunks.push(data.subarray(2 + headerLength));
        return;
      }
      const text = data.toString('utf-8');
      if (text.includes(`X-RequestId:${requestId}`) && text.includes('Path:turn.end')) {
        ws.off('message', onMessage);
        ws.off('error', onError);
        resolve();
      }
    };
    const onError = (err) => {
      ws.off('message', onMessage);
      reject(err);
    };
    ws.on('message', onMessage);
    ws.on('error', onError);
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

async function main() {
  const secMsGec = generateSecMsGec();
  const wsUrl =
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}&ConnectionId=${connectId()}`;

  console.log(`Connecting to Edge TTS (voice: ${voiceName})...`);
  const ws = new WebSocket(wsUrl, {
    headers: {
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      Cookie: muidCookie(),
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

  const cuePaths = [];
  for (let i = 0; i < cues.length; i++) {
    console.log(`  Cue ${i + 1}/${cues.length}...`);
    const audio = await synthesizeCue(ws, cues[i], voiceName);
    const cuePath = path.join(audioDir, `cue-${String(i + 1).padStart(2, '0')}.mp3`);
    writeFileSync(cuePath, audio);
    cuePaths.push(cuePath);
  }

  ws.close();

  const toFfmpegPath = (p) => p.replace(/\\/g, '/');
  const silencePath = path.join(OUTPUT_DIR, 'silence-edge.wav');
  execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.6', silencePath], { stdio: 'ignore' });

  const listPath = path.join(OUTPUT_DIR, 'concat-list-edge.txt');
  const listLines = [];
  cuePaths.forEach((p, i) => {
    listLines.push(`file '${toFfmpegPath(p)}'`);
    if (i < cuePaths.length - 1) listLines.push(`file '${toFfmpegPath(silencePath)}'`);
  });
  writeFileSync(listPath, listLines.join('\n'), 'utf-8');

  const slug = voiceName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  const voiceoverPath = path.join(OUTPUT_DIR, `voiceover-edge-${slug}.wav`);
  console.log('Concatenating narration clips (with 0.6s gaps between cues)...');
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-ar', '24000', '-ac', '1', voiceoverPath], {
    stdio: 'inherit',
  });

  console.log(`\nVoiceover written to ${voiceoverPath}`);
}

main().catch((err) => fail(`Edge TTS failed: ${err.stack || err}`));
