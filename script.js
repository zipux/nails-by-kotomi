/* ============================================================
   Nails by Kotomi — script.js
   Handles:
     - Bilingual i18n (EN / JA) via content.js
     - Sticky nav shadow on scroll
     - Mobile hamburger menu
     - Active nav link highlighting
     - Footer year
     - Gallery filter (gallery.html)
     - Lightbox (gallery.html)
     - Cal.com embed loading state (booking.html)
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ── DOM Ready ───────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    initNav();
    initFooterYear();
    setActiveNavLink();

    const pageId = document.body.id;

    if (pageId === 'page-gallery') {
      initGalleryFilters();
      initLightbox();
    }

    if (pageId === 'page-booking') {
      initCalEmbed();
    }
  });


  /* ══════════════════════════════════════════════════════════
     I18N — bilingual content switching
  ══════════════════════════════════════════════════════════ */

  function getDeep(obj, path) {
    return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
  }

  function applyLanguage(lang) {
    if (typeof CONTENT === 'undefined' || !CONTENT[lang]) return;
    const C = CONTENT[lang];

    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    $$('[data-i18n]').forEach(el => {
      const val = getDeep(C, el.dataset.i18n);
      if (val !== undefined) el.textContent = val;
    });

    $$('[data-i18n-html]').forEach(el => {
      const val = getDeep(C, el.dataset.i18nHtml);
      if (val !== undefined) el.innerHTML = val;
    });

    $$('[data-i18n-label]').forEach(el => {
      const val = getDeep(C, el.dataset.i18nLabel);
      if (val !== undefined) el.dataset.label = val;
    });
  }

  function initI18n() {
    const saved = localStorage.getItem('nbk-lang') || 'en';
    applyLanguage(saved);

    $$('.lang-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.dataset.lang || 'en';
        const next = current === 'en' ? 'ja' : 'en';
        applyLanguage(next);
        localStorage.setItem('nbk-lang', next);
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     NAV — sticky shadow + mobile toggle
  ══════════════════════════════════════════════════════════ */

  function initNav() {
    const nav       = $('#main-nav');
    const toggle    = $('#nav-toggle');
    const mobileNav = $('#nav-mobile');

    if (!nav) return;

    /* Scroll shadow */
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    /* Hamburger toggle */
    if (toggle && mobileNav) {
      toggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      });

      /* Close mobile nav when a link is tapped */
      $$('a', mobileNav).forEach(link => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('open');
          toggle.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });

      /* Close when clicking outside */
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
          mobileNav.classList.remove('open');
          toggle.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }


  /* ══════════════════════════════════════════════════════════
     ACTIVE NAV LINK — highlight current page
  ══════════════════════════════════════════════════════════ */

  function setActiveNavLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav__links a, .nav__mobile a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === current) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     FOOTER YEAR
  ══════════════════════════════════════════════════════════ */

  function initFooterYear() {
    const el = $('#footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }


  /* ══════════════════════════════════════════════════════════
     GALLERY FILTERS
  ══════════════════════════════════════════════════════════ */

  function initGalleryFilters() {
    const filterBtns = $$('.filter-btn');
    const items      = $$('.gallery-item');
    const emptyMsg   = $('#gallery-empty');

    if (!filterBtns.length || !items.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        /* Update button states */
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        /* Show / hide items */
        let visibleCount = 0;
        items.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !match);
          if (match) visibleCount++;
        });

        /* Empty state */
        if (emptyMsg) {
          emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     LIGHTBOX
  ══════════════════════════════════════════════════════════ */

  function initLightbox() {
    const lightbox   = $('#lightbox');
    const closeBtn   = $('#lightbox-close');
    const prevBtn    = $('#lightbox-prev');
    const nextBtn    = $('#lightbox-next');
    const labelEl    = $('#lightbox-label');
    const captionEl  = $('#lightbox-caption');

    if (!lightbox) return;

    /* Collect all gallery placeholders that are clickable */
    let items        = [];   // live list rebuilt on each open (filters may hide some)
    let currentIndex = 0;

    /* Build item list from currently visible placeholders */
    function getVisibleItems() {
      return $$('.gallery-item:not(.hidden) .img-placeholder');
    }

    /* Open lightbox at a given placeholder element */
    function openAt(placeholder) {
      items        = getVisibleItems();
      currentIndex = items.indexOf(placeholder);
      render();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    /* Render current item into the lightbox */
    function render() {
      const ph = items[currentIndex];
      if (!ph) return;

      const label = ph.dataset.label || ph.textContent.trim();
      if (labelEl)   labelEl.textContent   = label;
      if (captionEl) captionEl.textContent = `${currentIndex + 1} / ${items.length}`;

      /* Prev / next button visibility */
      if (prevBtn) prevBtn.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
      if (nextBtn) nextBtn.style.visibility = currentIndex < items.length - 1 ? 'visible' : 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    /* Delegate click on gallery grid */
    const grid = $('#gallery-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const ph = e.target.closest('.img-placeholder');
        if (ph) openAt(ph);
      });

      /* Keyboard: Enter / Space on focused placeholder */
      grid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const ph = e.target.closest('.img-placeholder');
          if (ph) {
            e.preventDefault();
            openAt(ph);
          }
        }
      });
    }

    /* Navigation */
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) { currentIndex--; render(); }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentIndex < items.length - 1) { currentIndex++; render(); }
      });
    }

    /* Close */
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    /* Click backdrop to close */
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    /* Keyboard navigation */
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;

      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft'  && currentIndex > 0)                  { currentIndex--; render(); }
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1)   { currentIndex++; render(); }
    });
  }


  /* ══════════════════════════════════════════════════════════
     CAL.COM EMBED — remove loading class once iframe appears
  ══════════════════════════════════════════════════════════ */

  function initCalEmbed() {
    const embed = $('#cal-embed');
    if (!embed) return;

    /* Watch for Cal.com injecting its iframe into the container */
    const observer = new MutationObserver((mutations, obs) => {
      const hasContent = embed.querySelector('iframe') || embed.children.length > 0;
      if (hasContent) {
        embed.classList.remove('loading');
        obs.disconnect();
      }
    });

    observer.observe(embed, { childList: true, subtree: true });

    /* Fallback: remove loading state after 8 s regardless */
    setTimeout(() => {
      embed.classList.remove('loading');
      observer.disconnect();
    }, 8000);
  }

})();
