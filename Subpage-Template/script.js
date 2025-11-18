document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const toggleButton = document.getElementById('darkModeToggle');
  const toggleIcon = document.getElementById('modeIcon');
  const logo = document.getElementById('site-logo');
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function setOsThemeAttr() {
    root.setAttribute('data-os-theme', media.matches ? 'dark' : 'light');
  }

  function prefersDark() {
    const pref = localStorage.getItem('theme');
    if (pref === 'dark') return true;
    if (pref === 'light') return false;
    return media.matches;
  }

  function applyTheme() {
    const pref = localStorage.getItem('theme');
    if (pref === 'dark') root.setAttribute('data-theme', 'dark');
    else if (pref === 'light') root.setAttribute('data-theme', 'light');
    else root.setAttribute('data-theme', 'auto');
    setOsThemeAttr();
    const isDark = prefersDark();
    toggleIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    if (logo) {
      logo.src = isDark
        ? 'https://assets.thehtmlproject.com/img/logodark.png'
        : 'https://assets.thehtmlproject.com/icon.jpeg';
    }
    toggleButton?.setAttribute('aria-pressed', String(isDark));
  }

  applyTheme();

  media.addEventListener('change', () => {
    if (!localStorage.getItem('theme')) applyTheme();
    else setOsThemeAttr();
  });

  toggleButton?.addEventListener('click', () => {
    const pref = localStorage.getItem('theme');
    if (pref === null) {
      localStorage.setItem('theme', prefersDark() ? 'light' : 'dark');
    } else if (pref === 'dark') {
      localStorage.setItem('theme', 'light');
    } else if (pref === 'light') {
      localStorage.removeItem('theme');
    }
    applyTheme();
  });

  const versionValue = document.getElementById('versionValue');
  const checkpointValue = document.getElementById('checkpointValue');
  const statusPill = document.getElementById('statusPill');

  const checkpoints = [
    { version: '0.7 beta', checkpoint: 'July 24', status: 'on-track' },
    { version: '0.8 beta', checkpoint: 'August 12', status: 'warning' },
    { version: '1.0 rc', checkpoint: 'September 02', status: 'on-track' },
  ];

  const today = new Date();
  const rotationIndex = today.getWeekNumber ? today.getWeekNumber() : today.getDay();
  const selection = checkpoints[rotationIndex % checkpoints.length];

  if (versionValue) versionValue.textContent = selection.version;
  if (checkpointValue) checkpointValue.textContent = selection.checkpoint;
  if (statusPill) {
    statusPill.dataset.state = selection.status;
    statusPill.textContent =
      selection.status === 'warning'
        ? 'Needs review'
        : selection.status === 'risk'
        ? 'At risk'
        : 'On track';
  }

  const timelineItems = document.querySelectorAll('.timeline-list li');
  let highlightIndex = -1;

  timelineItems.forEach((item, index) => {
    item.dataset.originalProgress = item.dataset.progress || 'future';
    item.addEventListener('mouseenter', () => highlightItem(index));
    item.addEventListener('focus', () => highlightItem(index));
  });

  function highlightItem(index) {
    timelineItems.forEach((item) => item.removeAttribute('data-highlight'));
    const item = timelineItems[index];
    if (!item) return;
    item.setAttribute('data-highlight', 'true');
    highlightIndex = index;
  }

  function highlightDefault() {
    const preferredIndex = Array.from(timelineItems).findIndex(
      (item) => item.dataset.progress === 'active'
    );
    if (preferredIndex >= 0) highlightItem(preferredIndex);
    else highlightItem(0);
  }

  highlightDefault();

  const cycleInterval = setInterval(() => {
    if (document.hidden) return;
    const nextIndex = (highlightIndex + 1) % timelineItems.length;
    highlightItem(nextIndex);
  }, 6000);

  window.addEventListener('beforeunload', () => clearInterval(cycleInterval));

  const resetBtn = document.getElementById('resetTimeline');
  resetBtn?.addEventListener('click', () => {
    timelineItems.forEach((item) => {
      item.dataset.progress = item.dataset.originalProgress;
      item.removeAttribute('data-highlight');
    });
    highlightDefault();
  });
});

// Polyfill for week number usage
Date.prototype.getWeekNumber = function () {
  const date = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return weekNo;
};
