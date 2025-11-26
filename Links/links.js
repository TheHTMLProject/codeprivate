(function () {
  const listEl = document.getElementById('urls-list');
  const copyBtn = document.getElementById('copy-newest');
  const visitBtn = document.getElementById('visit-newest');
  const toast = document.getElementById('thp-toast');

  // Get the newest link from list
  let newestItem = listEl.querySelector('[data-newest]') || listEl.querySelector('li');
  let newestUrl = newestItem 
    ? newestItem.textContent.replace(/\s*<.*?>.*?<\/.*?>/g, '').replace(/\s+.*$/, '').trim()
    : null;

  // Set visit button href
  if (newestUrl) {
    visitBtn.setAttribute('href', newestUrl);
    visitBtn.classList.remove('disabled');
    visitBtn.setAttribute('aria-disabled', 'false');
  } else {
    visitBtn.classList.add('disabled');
    visitBtn.setAttribute('aria-disabled', 'true');
  }

  function showToast(msg, timeout) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), timeout || 1600);
  }

  copyBtn.addEventListener('click', function (ev) {
    ev.preventDefault();
    if (!newestUrl) {
      showToast('No link available');
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(newestUrl).then(function () {
        showToast('Copied newest link to clipboard');
      }, function () {
        showToast('Unable to copy link');
      });
    } else {
      // fallback
      let ta = document.createElement('textarea');
      ta.value = newestUrl;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Copied newest link to clipboard');
      } catch (e) {
        showToast('Unable to copy link');
      }
      document.body.removeChild(ta);
    }
  });

  // Make "Copy" button accessible with Enter and Space
  copyBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyBtn.click();
    }
  });
})();