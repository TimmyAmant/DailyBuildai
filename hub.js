// hub.js — DailyBuildAI main hub logic

const BUILDS_JSON = './builds.json';
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const ALL_CATEGORIES = [
  'Generative Art', 'Mini Game', 'Interactive Tool', 'Landing Page',
  'Ambient Experience', 'Data Visualization', 'Typography Play',
  'CSS Art', 'Browser Toy', 'Digital Experiment',
];

// Category → gradient map for card thumbnails
const CATEGORY_GRADIENTS = {
  'Generative Art':     ['#1a0533', '#4c1d95', '#7c3aed'],
  'Mini Game':          ['#0c1a0e', '#14532d', '#16a34a'],
  'Interactive Tool':   ['#0c1228', '#1e3a8a', '#3b82f6'],
  'Landing Page':       ['#1a0a00', '#7c2d12', '#ea580c'],
  'Ambient Experience': ['#080818', '#1e1b4b', '#4338ca'],
  'Data Visualization': ['#001a1a', '#134e4a', '#0d9488'],
  'Typography Play':    ['#1a001a', '#6b21a8', '#c026d3'],
  'CSS Art':            ['#1a0010', '#9f1239', '#e11d48'],
  'Browser Toy':        ['#181200', '#78350f', '#d97706'],
  'Digital Experiment': ['#0a0a0a', '#1c1c3a', '#6366f1'],
};

const CATEGORY_EMOJIS = {
  'Generative Art': '✦', 'Mini Game': '◉', 'Interactive Tool': '⊕',
  'Landing Page': '▣', 'Ambient Experience': '◈', 'Data Visualization': '◎',
  'Typography Play': 'Aa', 'CSS Art': '◇', 'Browser Toy': '⊚',
  'Digital Experiment': '◆',
};

function getCategoryGradient(category) {
  const g = CATEGORY_GRADIENTS[category] || ['#0e0e1c', '#1e1e3a', '#6366f1'];
  return `linear-gradient(135deg, ${g[0]}, ${g[1]}, ${g[2]})`;
}

function getCategoryEmoji(category) {
  return CATEGORY_EMOJIS[category] || '◆';
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Countdown to midnight ─────────────────────────
function startCountdown() {
  const el = document.getElementById('heroCountdown');
  if (!el) return;

  function update() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    el.textContent =
      String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ── Archive card ──────────────────────────────────
function buildCard(build, isToday) {
  const a = document.createElement('a');
  a.className = 'build-card' + (isToday ? ' is-today' : '');
  a.href = build.path;

  const gradient = getCategoryGradient(build.category);
  const emoji = getCategoryEmoji(build.category);

  a.innerHTML = `
    <div class="card-thumb ${build.thumbClass || ''}" style="background: ${gradient}">
      <span>${emoji}</span>
    </div>
    <div class="card-body">
      <div class="card-title">${build.title}</div>
      ${build.description ? `<div class="card-desc">${build.description}</div>` : ''}
      <div class="card-footer">
        <span class="card-category">${build.category}</span>
        <span class="card-date">${formatDate(build.date)}</span>
      </div>
      ${build.approved ? `<div class="card-approved">👤 Human approved</div>` : ''}
    </div>
  `;
  return a;
}

// ── Main ──────────────────────────────────────────
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

  // Build counter (header)
  const counterEl = document.getElementById('buildCounter');
  if (counterEl) counterEl.textContent = `${builds.length} build${builds.length !== 1 ? 's' : ''}`;

  // Animated count-up for builds stat (homepage only)
  const statEl = document.getElementById('statBuilds');
  if (statEl) {
    const target = builds.length;
    if (target <= 1) {
      statEl.textContent = target;
    } else {
      let current = 0;
      const step = Math.max(1, Math.floor(target / 30));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        statEl.textContent = current;
        if (current >= target) clearInterval(timer);
      }, 30);
    }
  }

  // Countdown to next build (homepage only)
  startCountdown();

  if (builds.length === 0) {
    document.getElementById('buildsGrid').innerHTML =
      '<div class="empty-state">No builds in the archive yet.</div>';
    return;
  }

  // Archive grid
  const grid = document.getElementById('buildsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const isArchivePage = window.ARCHIVE_PAGE === true;
  const MAX_HOME = 10;
  const displayBuilds = isArchivePage ? builds : builds.slice(0, MAX_HOME);

  displayBuilds.forEach(build => {
    grid.appendChild(buildCard(build, build.date === TODAY));
  });

  // Show "View all" link on homepage if there are more builds
  if (!isArchivePage && builds.length > MAX_HOME) {
    const viewAll = document.createElement('a');
    viewAll.href = '/archive.html';
    viewAll.className = 'view-all-link';
    viewAll.textContent = `View all ${builds.length} builds →`;
    grid.parentNode.appendChild(viewAll);
  }
}

document.addEventListener('DOMContentLoaded', init);
