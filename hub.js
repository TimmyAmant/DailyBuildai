// hub.js — DailyBuildAI main hub logic

const BUILDS_JSON = './builds.json';
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Category → gradient map for card thumbnails
const CATEGORY_GRADIENTS = {
  'Generative Art':   ['#1a0533', '#4c1d95', '#7c3aed'],
  'Mini Game':        ['#0c1a0e', '#14532d', '#16a34a'],
  'Interactive Tool': ['#0c1228', '#1e3a8a', '#3b82f6'],
  'Landing Page':     ['#1a0a00', '#7c2d12', '#ea580c'],
  'Ambient Experience': ['#080818', '#1e1b4b', '#4338ca'],
  'Data Visualization': ['#001a1a', '#134e4a', '#0d9488'],
  'Typography Play':  ['#1a001a', '#6b21a8', '#c026d3'],
  'CSS Art':          ['#1a0010', '#9f1239', '#e11d48'],
  'Browser Toy':      ['#181200', '#78350f', '#d97706'],
  'Digital Experiment': ['#0a0a0a', '#1c1c3a', '#6366f1'],
};

function getCategoryGradient(category) {
  const g = CATEGORY_GRADIENTS[category] || ['#0e0e1c', '#1e1e3a', '#6366f1'];
  return `linear-gradient(135deg, ${g[0]}, ${g[1]}, ${g[2]})`;
}

function getCategoryEmoji(category) {
  const map = {
    'Generative Art': '✦',
    'Mini Game': '◉',
    'Interactive Tool': '⊕',
    'Landing Page': '▣',
    'Ambient Experience': '◈',
    'Data Visualization': '◎',
    'Typography Play': 'Aa',
    'CSS Art': '◇',
    'Browser Toy': '⊚',
    'Digital Experiment': '◆',
  };
  return map[category] || '◆';
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildCard(build, isToday) {
  const a = document.createElement('a');
  a.className = 'build-card' + (isToday ? ' is-today' : '');
  a.href = build.path;
  a.target = '_blank';
  a.rel = 'noopener';

  const gradient = getCategoryGradient(build.category);
  const emoji = getCategoryEmoji(build.category);

  a.innerHTML = `
    <div class="card-thumb" style="background: ${gradient}">
      <span>${emoji}</span>
    </div>
    <div class="card-body">
      <div class="card-title">${build.title}</div>
      ${build.description ? `<div class="card-desc">${build.description}</div>` : ''}
      <div class="card-footer">
        <span class="card-category">${build.category}</span>
        <span class="card-date">${formatDate(build.date)}</span>
      </div>
    </div>
  `;
  return a;
}

async function init() {
  let data;
  try {
    const res = await fetch(BUILDS_JSON + '?v=' + Date.now());
    data = await res.json();
  } catch (e) {
    console.error('Could not load builds.json:', e);
    document.getElementById('buildsGrid').innerHTML =
      '<div class="empty-state">No builds found. Run the builder to create today\'s site.</div>';
    return;
  }

  const builds = (data.builds || []).slice().reverse(); // newest first

  // Update build counter
  const counter = document.getElementById('buildCounter');
  counter.textContent = `${builds.length} build${builds.length !== 1 ? 's' : ''}`;

  // ── Hero (latest build) ──────────────────────────
  if (builds.length > 0) {
    const latest = builds[0];
    const isToday = latest.date === TODAY;

    document.getElementById('heroTitle').textContent = latest.title;
    document.getElementById('heroCategory').textContent = latest.category;
    document.getElementById('heroDate').textContent = formatDate(latest.date);
    document.getElementById('heroDesc').textContent = latest.description || '';
    document.getElementById('heroLink').href = latest.path;
    document.getElementById('chromeUrl').textContent =
      window.location.host + latest.path;

    const iframe = document.getElementById('heroIframe');
    const loading = document.getElementById('iframeLoading');

    iframe.addEventListener('load', () => {
      loading.classList.add('hidden');
    });
    iframe.src = latest.path;

    // If not today's build, note it
    if (!isToday) {
      document.querySelector('.hero-label').innerHTML =
        `<span class="dot-pulse" style="background:var(--text3)"></span> LATEST BUILD`;
    }
  } else {
    document.getElementById('heroTitle').textContent = 'No builds yet';
    document.getElementById('iframeLoading').querySelector('span').textContent =
      'Run the builder to create the first build!';
  }

  // ── Archive grid ─────────────────────────────────
  const grid = document.getElementById('buildsGrid');
  grid.innerHTML = '';

  if (builds.length === 0) {
    grid.innerHTML = '<div class="empty-state">No builds in the archive yet.</div>';
    return;
  }

  builds.forEach(build => {
    const isToday = build.date === TODAY;
    grid.appendChild(buildCard(build, isToday));
  });
}

document.addEventListener('DOMContentLoaded', init);
