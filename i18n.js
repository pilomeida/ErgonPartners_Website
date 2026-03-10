/* ── ERGON PARTNERS — i18n Engine ───────────────────────────────── */
(function () {
  'use strict';

  var DEFAULT_LANG = 'pt';
  var STORAGE_KEY  = 'ergon-lang';
  var SUPPORTED    = ['pt', 'es', 'en'];

  /* ── Public API (used by form JS for dynamic strings) ───────── */
  window.I18n = {
    lang: DEFAULT_LANG,
    t: function (key) {
      var lang = window.I18n.lang;
      var dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
      if (dict[key] !== undefined) return dict[key];
      return (TRANSLATIONS[DEFAULT_LANG][key] || key);
    }
  };

  /* ── Detect preferred language ──────────────────────────────── */
  function detectLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) >= 0) return stored;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  /* ── Apply all translations to the current document ─────────── */
  function applyLang(lang) {
    window.I18n.lang = lang;
    document.documentElement.lang = lang;

    /* Update <title> via data-page-title-key on <html> */
    var titleKey = document.documentElement.getAttribute('data-page-title-key');
    if (titleKey) {
      var t = window.I18n.t(titleKey);
      if (t) document.title = t;
    }

    /* textContent targets */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = window.I18n.t(el.getAttribute('data-i18n'));
      if (val) el.textContent = val;
    });

    /* innerHTML targets (elements containing <br>, <em>, etc.) */
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var val = window.I18n.t(el.getAttribute('data-i18n-html'));
      if (val) el.innerHTML = val;
    });

    /* Sync lang button active state */
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('lang-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    /* Update dropdown current label */
    document.querySelectorAll('.lang-drop-cur').forEach(function (el) {
      el.textContent = lang.toUpperCase();
    });
  }

  /* ── Switch language and persist ────────────────────────────── */
  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    applyLang(lang);
    closeDropdown();
  }
  window.I18n.setLang = setLang;

  /* ── Dropdown toggle ─────────────────────────────────────────── */
  function closeDropdown() {
    document.querySelectorAll('.lang-sw').forEach(function (sw) {
      sw.classList.remove('open');
      var list = sw.querySelector('.lang-drop-list');
      var btn  = sw.querySelector('.lang-drop-btn');
      if (list) list.hidden = true;
      if (btn)  btn.setAttribute('aria-expanded', 'false');
    });
  }

  function bindDropdown() {
    document.querySelectorAll('.lang-drop-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var sw   = btn.closest('.lang-sw');
        var list = sw.querySelector('.lang-drop-list');
        var isOpen = !list.hidden;
        closeDropdown();
        if (!isOpen) {
          list.hidden = false;
          sw.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* Close on outside click */
    document.addEventListener('click', closeDropdown);
  }

  /* ── Bind all lang buttons ───────────────────────────────────── */
  function bindButtons() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
  }

  /* ── Init on DOM ready ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    bindDropdown();
    bindButtons();
    applyLang(detectLang());
  });

})();
