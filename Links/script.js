(function () {
  'use strict';

  const THP_LINKS = [
    { url: 'https://thehtmlproject.com', label: 'Main Site', newest: true },
    { url: 'https://thp.pages.dev', label: 'Cloudflare Pages' },
    { url: 'https://thehtmlproject.pages.dev', label: 'Cloudflare Backup' },
    { url: 'https://thehtmlproject.netlify.app', label: 'Netlify' },
    { url: 'https://thehtmlproject.vercel.app', label: 'Vercel' }
  ];

  const newestLinkText = document.getElementById('newestLinkText');
  const visitNewestBtn = document.getElementById('visitNewestBtn');
  const copyNewestBtn = document.getElementById('copyNewestBtn');
  const copyIcon = document.getElementById('copyIcon');
  const copyBtnText = document.getElementById('copyBtnText');
  const linksList = document.getElementById('linksList');
  const toastEl = document.getElementById('toast');

  function getNewestLink() {
    const newest = THP_LINKS.find(l => l.newest);
    return newest || THP_LINKS[0];
  }

  function init() {
    const newest = getNewestLink();

    if (newestLinkText) {
      newestLinkText.textContent = newest.url;
    }
    if (visitNewestBtn) {
      visitNewestBtn.href = newest.url;
    }

    renderLinksList();

    if (copyNewestBtn) {
      copyNewestBtn.addEventListener('click', () => copyToClipboard(newest.url, true));
    }
  }

  function renderLinksList() {
    if (!linksList) return;

    linksList.innerHTML = '';

    THP_LINKS.forEach((link) => {
      const li = document.createElement('li');
      li.className = 'link-item' + (link.newest ? ' newest' : '');

      li.innerHTML = `
        <span class="link-url">${escapeHtml(link.url)}</span>
        ${link.newest ? '<span class="link-badge">Newest</span>' : ''}
        <div class="link-item-actions">
          <button class="icon-btn copy-btn" aria-label="Copy link" title="Copy link" data-url="${escapeHtml(link.url)}">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
          <a class="icon-btn" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit link" title="Visit link">
            <span class="material-symbols-outlined">open_in_new</span>
          </a>
        </div>
      `;

      linksList.appendChild(li);
    });

    linksList.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const url = this.getAttribute('data-url');
        copyToClipboard(url, false);
      });
    });
  }

  async function copyToClipboard(text, isMainButton) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Link copied to clipboard!');

      if (isMainButton && copyIcon && copyBtnText) {
        const originalIcon = copyIcon.textContent;
        const originalText = copyBtnText.textContent;
        copyIcon.textContent = 'check';
        copyBtnText.textContent = 'Copied!';

        setTimeout(() => {
          copyIcon.textContent = originalIcon;
          copyBtnText.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Link copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy link');
    }
    document.body.removeChild(textarea);
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2500);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
