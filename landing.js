/* Лендинг updt — поведение страницы. Компоненты (меню, вкладки, аккордеон, список, тема) — из библиотеки ds/js/. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none)');

  /* ===== Сцена первого экрана: за экраном на паузе ===== */
  const scene = $('.lp-scene');
  if (scene) new IntersectionObserver((es) => scene.classList.toggle('off', !es[0].isIntersecting), { rootMargin: '64px' }).observe(scene);

  /* ===== Демо: выбор версии открывает модули до неё, новый модуль коротко подсвечивается ===== */
  const rels = $$('.lp-rel'), mods = $$('.lp-mod[data-from]'), verOut = $('[data-ver]');
  const VERS = ['1.0', '1.1', '1.2', '1.3'];
  let cur = 3;
  const flash = (el) => {
    el.classList.remove('faded'); el.classList.add('fresh');
    requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('faded'); el.classList.remove('fresh') }));
  };
  const setVer = (v, first) => {
    if (v === cur && !first) return;
    const prev = cur; cur = v;
    rels.forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === v)));
    verOut.textContent = VERS[v];
    mods.forEach((m) => {
      const from = +m.dataset.from, open = from <= v;
      m.classList.toggle('locked', !open);
      // подсветка только у модуля, который вышел именно в выбранной версии и до этого был закрыт
      if (!first && open && from === v && from > prev) setTimeout(() => flash(m), 200);
    });
  };
  setVer(3, true);
  rels.forEach((b) => b.addEventListener('click', () => { stopAuto(); setVer(+b.dataset.v) }));

  /* Один раз, когда демо видно: продукт сам проходит путь от 1.0 до 1.3. Касание ленты останавливает показ */
  let autoT = [], autoDone = false;
  const stopAuto = () => { autoT.forEach(clearTimeout); autoT = []; autoDone = true };
  const autoPlay = () => {
    if (autoDone || reduce.matches) return; autoDone = true;
    setVer(0);
    [1, 2, 3].forEach((v, i) => autoT.push(setTimeout(() => setVer(v), 1500 + i * 1500)));
  };
  $('.lp-rels')?.addEventListener('pointerdown', stopAuto);
  const demo = $('.lp-demo');
  if (demo) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { setTimeout(autoPlay, 700); o.disconnect() } }, { threshold: .6 }).observe(demo);

  /* ===== Шаги «Как работаем»: полоски заполняются при появлении ===== */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.how li').forEach((li) => io.observe(li));

  /* ===== Вкладки «Для кого»: линию и выбор ведёт inputs.js, здесь только панели ===== */
  const tabs = $('.aud .tabs');
  if (tabs) {
    const items = $$('.tab', tabs);
    const show = () => items.forEach((t) => $('#' + t.getAttribute('aria-controls')).classList.toggle('on', t.getAttribute('aria-selected') === 'true'));
    tabs.addEventListener('pick', show); show();
  }

  /* ===== Заявка: проверка полей (после ухода и при отправке), без отправки на сервер ===== */
  const form = $('#lead'), box = $('.lp-form-box');
  if (form) {
    // тексты ошибок берутся из data-атрибутов формы: у русской и английской страниц свои
    const d = form.dataset, msg = { name: d.eName || 'Введите имя', contact: d.eContact || 'Укажите Telegram или телефон', contactBad: d.eContactBad || 'Проверьте ник или номер' };
    const rules = {
      name: (v) => (v.trim() ? '' : msg.name),
      contact: (v) => (!v.trim() ? msg.contact : /^@?[\w.]{4,}$|^\+?[\d\s()-]{10,}$/.test(v.trim()) ? '' : msg.contactBad),
    };
    const check = (inp) => { const msg = rules[inp.name]?.(inp.value) || ''; window.fieldError?.(inp, msg); return !msg };
    Object.keys(rules).forEach((n) => {
      const inp = form.elements[n];
      inp.addEventListener('blur', () => { if (inp.value) check(inp) });
      inp.addEventListener('input', () => { if (inp.getAttribute('aria-invalid') === 'true') check(inp) });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).map((n) => form.elements[n]).filter((inp) => !check(inp));
      if (bad.length) { bad[0].focus(); return }
      box.classList.add('done');
      // на телефоне фокус не в поле, а на итог: клавиатура не закроет сообщение
      $('.lp-sent').focus({ preventScroll: true });
    });
    $('#lead-again').addEventListener('click', () => {
      form.reset(); box.classList.remove('done');
      if (!touch.matches) form.elements.name.focus({ preventScroll: true });
    });
  }
})();
