(function () {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function safeGetTheme() {
    try {
      const v = window.localStorage.getItem('theme');
      return v === 'dark' || v === 'light' ? v : null;
    } catch {
      return null;
    }
  }

  function setTheme(nextTheme, persist) {
    if (nextTheme !== 'dark' && nextTheme !== 'light') return;
    root.dataset.theme = nextTheme;

    if (themeToggle) {
      const label = nextTheme === 'dark' ? 'Light mode' : 'Dark mode';
      themeToggle.textContent = label;
      themeToggle.setAttribute('aria-pressed', String(nextTheme === 'dark'));
    }

    if (persist) {
      try {
        window.localStorage.setItem('theme', nextTheme);
      } catch {
        // ignore
      }
    }
  }

  // Theme init
  setTheme(safeGetTheme() || getSystemTheme(), false);

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = root.dataset.theme === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });
  }

  // Active nav link
  const pageLinks = document.querySelectorAll('a[data-page]');
  if (pageLinks && pageLinks.length) {
    const parts = (location.pathname || '').split('/').filter(Boolean);
    const filename = parts[parts.length - 1] || 'index.html';
    const map = {
      'index.html': 'home',
      'services.html': 'services',
      'gallery.html': 'gallery',
      'contact.html': 'contact',
    };
    const currentPage = map[filename] || 'home';
    pageLinks.forEach(function (a) {
      a.classList.toggle('active', a.dataset.page === currentPage);
    });
  }

  // Gallery modal
  const modal = document.getElementById('galleryModal');
  const modalTitle = document.getElementById('galleryModalTitle');
  const modalDesc = document.getElementById('galleryModalDesc');
  const modalTags = document.getElementById('galleryModalTags');
  const modalVisual = document.getElementById('modalVisual');
  const closeBtn1 = document.getElementById('galleryClose');
  const closeBtn2 = document.getElementById('galleryClose2');

  let lastActiveEl = null;

  function setModalOpen(open) {
    if (!modal) return;
    modal.classList.toggle('is-open', open);
    modal.setAttribute('aria-hidden', String(!open));
  }

  function closeModal() {
    setModalOpen(false);
    if (lastActiveEl && typeof lastActiveEl.focus === 'function') lastActiveEl.focus();
  }

  function parseTags(tagsCsv) {
    if (!tagsCsv) return [];
    return String(tagsCsv)
      .split(',')
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean)
      .slice(0, 6);
  }

  function openModalFromItem(item) {
    if (!modal || !modalTitle || !modalDesc || !modalTags || !modalVisual) return;

    lastActiveEl = document.activeElement;

    const title = item.dataset.title || '';
    const desc = item.dataset.desc || '';
    const tags = parseTags(item.dataset.tags);
    const gradient = item.dataset.gradient || '';

    modalTitle.textContent = title;
    modalDesc.textContent = desc;

    // Update visual background
    modalVisual.style.backgroundImage = gradient ? gradient : '';
    modalVisual.style.backgroundSize = 'cover';
    modalVisual.style.backgroundPosition = 'center';

    // Tags
    modalTags.innerHTML = '';
    tags.forEach(function (t) {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      modalTags.appendChild(span);
    });

    setModalOpen(true);
    if (closeBtn1) closeBtn1.focus();
  }

  // Bind gallery items
  const galleryItems = document.querySelectorAll('[data-gallery-item], .gallery-item[data-title]');
  // Note: our HTML uses `.gallery-item`, keep selector broad to be safe.
  if (galleryItems && galleryItems.length) {
    galleryItems.forEach(function (btn) {
      const gradient = btn.dataset.gradient || '';
      if (gradient) btn.style.setProperty('--gallery-gradient', gradient);

      btn.addEventListener('click', function () {
        openModalFromItem(btn);
      });
    });
  }

  // Modal close
  if (modal) {
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', function () {
        closeModal();
      });
    }

    function onCloseClick(e) {
      e.preventDefault();
      closeModal();
    }

    if (closeBtn1) closeBtn1.addEventListener('click', onCloseClick);
    if (closeBtn2) closeBtn2.addEventListener('click', onCloseClick);

    // Escape + basic focus trap
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableSelector =
        'button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])';
      const focusables = Array.prototype.slice
        .call(modal.querySelectorAll(focusableSelector))
        .filter(function (el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // Contact form: validate + mailto
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const formHint = document.getElementById('formHint');

    function setError(el, msg) {
      if (!el) return;
      el.textContent = msg || '';
    }

    function clearErrors() {
      setError(nameError, '');
      setError(emailError, '');
      setError(messageError, '');
      if (formHint) formHint.textContent = '';
    }

    function isValidEmail(v) {
      // Basic (not perfect) email validation
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      const name = (nameInput && nameInput.value ? nameInput.value.trim() : '');
      const email = (emailInput && emailInput.value ? emailInput.value.trim() : '');
      const subject = (subjectInput && subjectInput.value ? subjectInput.value.trim() : '');
      const message = (messageInput && messageInput.value ? messageInput.value.trim() : '');

      let ok = true;

      if (!name || name.length < 2) {
        ok = false;
        setError(nameError, 'Digite seu nome (mín. 2 caracteres).');
      }

      if (!email || !isValidEmail(email)) {
        ok = false;
        setError(emailError, 'Digite um e-mail válido.');
      }

      if (!message || message.length < 10) {
        ok = false;
        setError(messageError, 'Sua mensagem precisa ter pelo menos 10 caracteres.');
      }

      if (!ok) return;

      const to = contactForm.dataset.mailTo || 'contato@invcentada.com';
      const subjectFinal = subject ? subject : 'Contato — invcentada (Percent %)';

      const body = [
        'Nome: ' + name,
        'E-mail: ' + email,
        '',
        message ? 'Mensagem:' : '',
        message,
      ]
        .filter(Boolean)
        .join('\n');

      const url = `mailto:${to}?subject=${encodeURIComponent(subjectFinal)}&body=${encodeURIComponent(body)}`;

      if (formHint) formHint.textContent = 'Abrindo seu e-mail...';
      window.location.href = url;
    });
  }
})();

