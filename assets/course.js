/* Общий JS курса «Геометрия 8 класс» */
(function () {
  'use strict';

  function renderKatexIfPresent() {
    if (window.renderMathInElement && document.querySelector('.math')) {
      try {
        window.renderMathInElement(document.body, {
          delimiters: [{ left: '\\(', right: '\\)', display: false }],
          throwOnError: false,
          strict: 'ignore'
        });
      } catch (e) {
        if (window.console && console.error) console.error('KaTeX render error:', e);
      }
    }
  }

  function initSearch() {
    var box = document.getElementById('course-search');
    if (!box) return;
    box.addEventListener('input', function () {
      var q = box.value.trim().toLowerCase();
      var paras = document.querySelectorAll('.para');
      for (var i = 0; i < paras.length; i++) {
        var txt = (paras[i].textContent || '').toLowerCase();
        paras[i].classList.toggle('hidden', !!q && txt.indexOf(q) === -1);
      }
    });
  }

  function initToc() {
    if (document.querySelector('details.chapter')) return;
    var headings = Array.prototype.slice.call(document.querySelectorAll('h2, .card h3'))
      .filter(function (h) { return !h.closest || !h.closest('.chapter-header'); });
    if (headings.length < 2) return;
    var toc = document.createElement('div');
    toc.className = 'toc-sidebar';
    var h3 = document.createElement('h3');
    h3.textContent = 'Содержание';
    toc.appendChild(h3);
    headings.forEach(function (h, idx) {
      h.id = h.id || ('sec-' + (idx + 1));
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.dataset.target = h.id;
      toc.appendChild(a);
    });
    document.body.appendChild(toc);
    var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
    function setActive(id) {
      links.forEach(function (a) { a.classList.toggle('active', a.dataset.target === id); });
    }
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-40% 0px -50% 0px' });
      headings.forEach(function (h) { obs.observe(h); });
    }
  }

  function initContentsSidebar() {
    var chapters = document.querySelectorAll('details.chapter');
    if (!chapters.length) return;
    var toc = document.createElement('div');
    toc.className = 'toc-sidebar';
    var h3 = document.createElement('h3');
    h3.textContent = 'Содержание';
    toc.appendChild(h3);
    var seen = {};
    chapters.forEach(function (ch) {
      var t = ch.querySelector('summary .ch-title');
      if (!t) return;
      var det = document.createElement('details');
      det.open = true;
      var sum = document.createElement('summary');
      sum.textContent = t.textContent;
      det.appendChild(sum);
      var body = document.createElement('div');
      ch.querySelectorAll('.para').forEach(function (para) {
        var a = para.querySelector('a.btn.go[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (seen[href]) return;
        seen[href] = true;
        var hh = para.querySelector('.para-head h3');
        var link = document.createElement('a');
        link.href = href;
        link.textContent = hh ? hh.textContent.replace(/\s+/g, ' ').trim() : href;
        body.appendChild(link);
      });
      det.appendChild(body);
      toc.appendChild(det);
    });
    document.body.appendChild(toc);
  }

  function initSelfCheck() {
    var core = window.CourseAnswerCore;
    if (!core) return;
    var btns = document.querySelectorAll('.check-btn');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        function run() {
          var row = btn.closest ? btn.closest('.check-row') : null;
          if (!row) return;
          var input = row.querySelector('.check-input');
          var fb = row.querySelector('.check-feedback');
          if (!input || !fb) return;
          var ok = core.checkAnswer(input.value, input.getAttribute('data-answer') || '');
          fb.classList.remove('ok', 'bad');
          fb.textContent = ok ? '✅ Верно!' : '❌ Попробуй ещё';
          fb.classList.add(ok ? 'ok' : 'bad');
        }
        btn.addEventListener('click', run);
        var input = btn.previousElementSibling;
        if (input && input.classList && input.classList.contains('check-input')) {
          input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); run(); }
          });
        }
      })(btns[i]);
    }
  }

  window.Course = {
    init: function () {
      renderKatexIfPresent();
      initSearch();
      initToc();
      initSelfCheck();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.Course.init(); });
  } else {
    window.Course.init();
  }
})();
