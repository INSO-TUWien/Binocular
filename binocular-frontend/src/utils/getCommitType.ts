'use strict';

export default async function (commitMessage: string) {
  const payload = commitMessage.trim() === '' ? '' : '?q=' + commitMessage.trim();
  if (!payload) {
    return [];
  }

  const res = await fetch(
    window.location.protocol + '//' + window.location.hostname + ':48763/api/getCommitType?commitMessage=' + encodeURIComponent(payload),
  );

  if (!res.ok) {
    return [];
  }
  return await res.json();
}
