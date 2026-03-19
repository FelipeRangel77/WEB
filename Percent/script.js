/* ===================================================
   PERCENT % — JavaScript Interactions
   Modern + Dark Mode Support
   =================================================== */

(function () {
  'use strict';

  // ---- State ----
  var bagCount = 0;

  // ---- DOM References ----
  var loader       = document.getElementById('loader');
  var nav          = document.getElementById('nav');
  var hamburger    = document.getElementById('hamburger');
  var mobileMenu   = document.getElementById('mobileMenu');
  var form         = document.getElementById('newsletterForm');
  var successMsg   = document.getElementById('newsletterSuccess');
  var toast        = document.getElementById('toast');
  var toastMessage = document.getElementById('toastMessage');
  var cartCount    = document.querySelector('.nav__cart-count');
  var themeToggle  = document.getElementById('themeToggle');

  // =====================
  // DARK MODE / THEME
  // =====================

  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem('percent-theme');
    } catch (e) {
      return null;
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('percent-theme', theme);
    } catch (e) {
      // localStorage not available
    }
  }

  // Initialize theme
  var initialTheme = getStoredTheme() || getSystemTheme();
  setTheme(initialTheme);

  // Toggle on click
  themeToggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled');
  });

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getStoredTheme()) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // =====================
  // PAGE LOADER
  // =====================

  window.addEventListener('load', function () {
    setTimeout(function () {
      loader.classList.add('is-hidden');
    }, 600);
  });

  // =====================
  // SCROLL: NAV BACKGROUND
  // =====================

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }, { passive: true });

  // =====================
  // SCROLL: REVEAL ANIMATIONS
  // =====================

  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.dataset.delay || 0;
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay * 100);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // =====================
  // MOBILE MENU
  // =====================

  hamburger.addEventListener('click', function () {
    var isOpen = mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  var mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  });

  // =====================
  // SMOOTH SCROLL
  // =====================

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = nav.offsetHeight + 20;
        var position = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: position,
          behavior: 'smooth'
        });
      }
    });
  });

  // =====================
  // TOAST
  // =====================

  var toastTimer = null;

  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2500);
  }

  // =====================
  // QUICK ADD TO BAG
  // =====================

  var quickAddButtons = document.querySelectorAll('.product__quick-add');
  quickAddButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var productName = this.closest('.product').querySelector('.product__name').textContent;
      bagCount++;
      cartCount.textContent = bagCount;
      showToast(productName + ' added to bag');

      // Button feedback
      var originalText = this.textContent;
      this.textContent = 'Added ✓';
      this.style.opacity = '0.7';
      this.style.pointerEvents = 'none';
      var self = this;
      setTimeout(function () {
        self.textContent = originalText;
        self.style.opacity = '';
        self.style.pointerEvents = '';
      }, 1400);
    });
  });

  // =====================
  // NEWSLETTER FORM
  // =====================

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.querySelector('.newsletter__input');
    if (email.value) {
      successMsg.classList.add('is-visible');
      form.style.opacity = '0.4';
      form.style.pointerEvents = 'none';
      showToast('Subscribed successfully');
    }
  });

  // =====================
  // PARALLAX (Desktop only)
  // =====================

  var heroImage = document.querySelector('.hero__image');
  if (heroImage && window.innerWidth > 768) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroImage.style.transform = 'scale(1.05) translateY(' + (scrolled * 0.12) + 'px)';
      }
    }, { passive: true });
  }

})();
