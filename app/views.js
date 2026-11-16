// The two pages, each a function from API data to HTML.

import { date, esc, money } from './format.js';

/** The reward as it stands now: the prize plus any entry fees paid into it. */
const pot = (b) => money(b.potUsd ?? b.rewardAmount);


const deadlineBadge = (ms) => {
  if (ms <= 0) return `<span class="deadline bad">ended</span>`;
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days <= 2) return `<span class="deadline urgent">${days}d ${hours}h left</span>`;
  if (days <= 7) return `<span class="deadline soon">${days}d ${hours}h left</span>`;
  return `<span class="deadline ok">${days}d ${hours}h left</span>`;
};

export function board(data, query = '') {
  const items = data.items.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(query.toLowerCase())
  );

  const rows = items
    .map(
      (b) => {
        const ms = new Date(b.deadline).getTime() - Date.now();
        const skills = (b.skills || []).map((s) => `<span class="skill">${esc(s)}</span>`).join('');
        return `
        <li>
          <div>
            <h3><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a></h3>
            <p>${esc(b.summary || '')}</p>
            <div class="skills">${skills}</div>
          </div>
          <div class="meta">
            <div><strong>${pot(b)}</strong></div>
            <div>${b.entryFeeUsd ? money(b.entryFeeUsd) + ' fee' : 'free'}</div>
            <div>${deadlineBadge(ms)}</div>
            <div>${b.submissionCount} ${b.submissionCount === 1 ? 'entry' : 'entries'}</div>
          </div>
        </li>`;
      }
    )
    .join('');

  const qHtml = query ? `<p>Showing results for “${esc(query)}” — <a href="#/">clear</a></p>` : '';
  return `
    <h1>Open bounties</h1>
    ${qHtml}
    <ul class="board">${rows}</ul>
    ${items.length === 0 ? '<p style="color:var(--muted)">No bounties match your search.</p>' : ''}
  `;
}

export function bounty(b) {
  const ms = new Date(b.deadline).getTime() - Date.now();
  const skills = (b.skills || []).map((s) => `<span class="skill">${esc(s)}</span>`).join('');
  return `
    <p><a href="#/">← All bounties</a></p>
    <h1>${esc(b.title)}</h1>
    <p class="summary">${esc(b.summary || '')}</p>
    <div class="hero">
      <div class="big">${pot(b)}</div>
      <div class="meta">
        <div>${b.entryFeeUsd ? `<strong>Entry fee:</strong> ${money(b.entryFeeUsd)}` : 'No entry fee'}</div>
        <div><strong>Deadline:</strong> ${date(b.deadline)}</div>
        <div class="deadline">${deadlineBadge(ms)}</div>
        <div><strong>Entries:</strong> ${b.submissionCount}</div>
        <div><strong>Category:</strong> ${esc(b.category || '—')}</div>
      </div>
    </div>
    <div class="dl">
      <dl>
        <dt>Reward</dt><dd>${pot(b)}</dd>
        <dt>Slug</dt><dd><code>${esc(b.slug)}</code></dd>
        <dt>Sponsor</dt><dd>${esc(b.sponsor?.name || 'make.fun')}</dd>
      </dl>
      <dl>
        <dt>Skills</dt><dd><div class="skills">${skills}</div></dd>
        <dt>Published</dt><dd>${date(b.publishedAt || b.deadline)}</dd>
      </dl>
    </div>
    <h2>Description</h2>
    <div class="description">${esc(b.description || '')}</div>
  `;
}
