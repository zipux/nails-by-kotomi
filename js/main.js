// Active nav link highlighting
(function () {
  var page = window.location.pathname.split('/').pop();
  if (!page || page === '') page = 'index.html';

  var map = {
    'index.html': 'home',
    'works.html': 'works',
    'booking.html': 'booking'
  };

  var active = map[page] || 'home';

  document.querySelectorAll('[data-page]').forEach(function (el) {
    if (el.dataset.page === active) el.classList.add('active');
  });
})();

// Mobile hamburger nav
(function () {
  var btn     = document.getElementById('hamburgerBtn');
  var overlay = document.getElementById('navOverlay');

  if (!btn || !overlay) return;

  function open() {
    btn.classList.add('is-open');
    overlay.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    btn.classList.remove('is-open');
    overlay.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    overlay.classList.contains('is-open') ? close() : open();
  });

  overlay.querySelectorAll('.overlay-link').forEach(function (link) {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
})();
