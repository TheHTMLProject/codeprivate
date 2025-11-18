document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const toggleButton = document.getElementById('darkModeToggle');
  const toggleIcon = document.getElementById('modeIcon');
  const versionValue = document.getElementById('versionValue');
  const checkpointValue = document.getElementById('checkpointValue');
  const statusPill = document.getElementById('statusPill');
  const resetBtn = document.getElementById('resetTimeline');

  function isDark() {
    const docTheme = root.getAttribute('data-theme');
    if (docTheme === 'dark') return true;
    if (docTheme === 'light') return false;
    return root.getAttribute('data-os-theme') === 'dark';
  }

  function updateToggle() {
    if (!toggleButton || !toggleIcon) return;
    const dark = isDark();
    toggleButton.setAttribute('aria-pressed', String(dark));
    toggleIcon.textContent = dark ? 'light_mode' : 'dark_mode';
  }

  updateToggle();

  const themeObserver = new MutationObserver(updateToggle);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-os-theme'] });

  toggleButton?.addEventListener('click', () => {
    const api = window.THPTheme;
    if (api && typeof api.get === 'function' && typeof api.set === 'function') {
      const pref = api.get();
      if (pref === 'dark') api.set('light');
      else if (pref === 'light') api.set('auto');
      else api.set('dark');
    }
    updateToggle();
  });

  const checkpoints = [
    { version: '0.7 beta', checkpoint: 'July 24', status: 'on-track' },
    { version: '0.8 beta', checkpoint: 'August 12', status: 'warning' },
    { version: '1.0 rc', checkpoint: 'September 02', status: 'risk' },
    { version: '1.0', checkpoint: 'October 10', status: 'on-track' }
  ];

  function getWeekNumber(date) {
    const ref = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = ref.getUTCDay() || 7;
    ref.setUTCDate(ref.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(ref.getUTCFullYear(), 0, 1));
    return Math.ceil(((ref - yearStart) / 86400000 + 1) / 7);
  }

  const selection = checkpoints[getWeekNumber(new Date()) % checkpoints.length];
  if (versionValue) versionValue.textContent = selection.version;
  if (checkpointValue) checkpointValue.textContent = selection.checkpoint;
  if (statusPill) {
    statusPill.dataset.state = selection.status;
    const labelMap = { 'on-track': 'On track', warning: 'Needs review', risk: 'At risk' };
    statusPill.textContent = labelMap[selection.status] || 'On track';
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
    const target = timelineItems[index];
    if (!target) return;
    target.setAttribute('data-highlight', 'true');
    highlightIndex = index;
  }

  function highlightDefault() {
    const preferredIndex = Array.from(timelineItems).findIndex((item) => item.dataset.progress === 'active');
    if (preferredIndex >= 0) highlightItem(preferredIndex);
    else highlightItem(0);
  }

  highlightDefault();

  const cycleInterval = window.setInterval(() => {
    if (document.hidden || !timelineItems.length) return;
    const nextIndex = (highlightIndex + 1) % timelineItems.length;
    highlightItem(nextIndex);
  }, 6000);

  window.addEventListener('beforeunload', () => window.clearInterval(cycleInterval));

  resetBtn?.addEventListener('click', () => {
    timelineItems.forEach((item) => {
      item.dataset.progress = item.dataset.originalProgress;
      item.removeAttribute('data-highlight');
    });
    highlightDefault();
  });

  document.querySelectorAll('.main-links-grid').forEach((grid) => {
    const buttons = grid.querySelectorAll('.link-button').length;
    grid.classList.toggle('even-count', buttons % 2 === 0);
    grid.classList.toggle('odd-count', buttons % 2 === 1);
  });
});
