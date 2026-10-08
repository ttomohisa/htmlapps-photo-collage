'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '..', 'src/index.template.html'), 'utf8');
function block(a, b) { const start = source.indexOf(a), end = source.indexOf(b, start); assert(start >= 0 && end > start, a); return source.slice(start, end); }
function element() { return {disabled: false, value: '', textContent: '', attrs: {}, handlers: {}, classList: {remove() {}, toggle() {}}, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(type, fn) { this.handlers[type] = fn; }}; }
const photo = (id, extra = {}) => ({id, file: {name: id + '.png'}, name: id + '.png', width: 600, height: 400, aspect: 1.5, thumbUrl: 'blob:' + id, cropX: .5, cropY: .5, zoom: 1, fit: 'fill', hero: false, ...extra});
function harness() {
  const state = {photos: [photo('first', {cropX: .2, cropY: .8, zoom: 2, fit: 'fit', hero: true}), photo('second')], selectedPhotoId: 'first', selectedLayoutId: 'layout-1', exporting: false, generation: 0};
  const els = Object.fromEntries(['undoButton', 'redoButton', 'resetButton', 'resetPhotoButton', 'adjustPanel', 'previewCanvas', 'selectedPhotoName', 'fillButton', 'fitButton', 'zoomRange', 'zoomValue', 'heroButton'].map(key => [key, element()]));
  const api = new Function('state', 'els', `
    const HISTORY_LIMIT=50,undoStack=[],redoStack=[],historyGestures=new Map();
    let historyApplying=false,historyRevision=0,initialHistorySignature='',importJob=null;
    const window={AppToast:{show(){}}};
    function tr(key){return key} function cleanupUnusedPhotoResources(){} function cancelImport(){}
    function hideToast(){} function setStatus(){} function renderFinishPanel(){}
    function updateView(){renderAdjustPanel()} function renderPreview(){return Promise.resolve()}
    ${block('    function captureHistoryState(){', '    function currentPhotoIds(')}
    ${block('    function selectedPhoto()', '    function selectPhoto(')}
    ${block('    function renderAdjustPanel(){', '    const ratioPresets=')}
    ${source.split('\n').find(line => line.includes("els.zoomRange.addEventListener('input'"))}
    ${block("    els.previewCanvas.addEventListener('pointermove'", '    function endCrop(')}
    initialHistorySignature=historySignature(captureHistoryState());
    return {renderAdjustPanel,resetPhotoAdjustment:typeof resetPhotoAdjustment==='function'?resetPhotoAdjustment:undefined,undoHistory,redoHistory,undoStack,redoStack,captureHistoryState};
  `)(state, els);
  return {...api, state, els};
}

// Removing the reset action or resetting the whole photo must fail these tests.
test('reset selected adjustment is one undoable change and preserves identity, order, and featured state', () => {
  const h = harness(), before = h.captureHistoryState(), firstFile = h.state.photos[0].file;
  assert.equal(typeof h.resetPhotoAdjustment, 'function');
  h.resetPhotoAdjustment();
  assert.deepEqual(h.state.photos.map(p => p.id), ['first', 'second']);
  assert.deepEqual(h.state.photos[0], {...before.photos[0], cropX: .5, cropY: .5, zoom: 1, fit: 'fill'});
  assert.equal(h.state.photos[0].file, firstFile);
  assert.deepEqual(h.state.photos[1], before.photos[1]);
  assert.equal(h.state.selectedLayoutId, 'layout-1');
  assert.equal(h.undoStack.length, 1);
  assert.equal(h.els.resetPhotoButton.disabled, true);
  h.undoHistory(); assert.deepEqual(h.captureHistoryState(), before);
  h.redoHistory(); assert.equal(h.state.photos[0].zoom, 1); assert.equal(h.state.photos[0].hero, true);
});
test('default, empty, single-photo, and exporting reset are disabled and cannot create history', () => {
  for (const mode of ['default', 'empty', 'single', 'exporting']) {
    const h = harness();
    assert.equal(typeof h.resetPhotoAdjustment, 'function');
    if (mode === 'default') h.state.selectedPhotoId = 'second';
    if (mode === 'empty') h.state.selectedPhotoId = 'missing';
    if (mode === 'single') h.state.photos.length = 1;
    if (mode === 'exporting') h.state.exporting = true;
    const before = h.captureHistoryState();
    h.renderAdjustPanel(); assert.equal(h.els.resetPhotoButton.disabled, true, mode);
    h.resetPhotoAdjustment(); assert.deepEqual(h.captureHistoryState(), before, mode); assert.equal(h.undoStack.length, 0, mode);
  }
});
test('adjusted selection enables reset; repeated reset is a no-op and keeps redo history', () => {
  const h = harness(); assert.equal(typeof h.resetPhotoAdjustment, 'function');
  h.renderAdjustPanel(); assert.equal(h.els.resetPhotoButton.disabled, false);
  h.resetPhotoAdjustment(); h.redoStack.push(h.captureHistoryState()); h.resetPhotoAdjustment();
  assert.equal(h.undoStack.length, 1); assert.equal(h.redoStack.length, 1);
});
test('zoom and pointer crop immediately enable reset without changing photo selection', () => {
  for (const gesture of ['zoom', 'crop']) {
    const h = harness(); h.state.selectedPhotoId = 'second'; h.renderAdjustPanel(); assert.equal(h.els.resetPhotoButton.disabled, true);
    if (gesture === 'zoom') { h.els.zoomRange.value = '2'; h.els.zoomRange.handlers.input(); }
    else {
      h.els.previewCanvas.width = 600; h.els.previewCanvas.height = 400; h.els.previewCanvas.getBoundingClientRect = () => ({width: 600, height: 400});
      h.state.cropDrag = {id: 'second', startX: 0, startY: 0, cropX: .5, cropY: .5, cell: {w: 300, h: 400}};
      h.els.previewCanvas.handlers.pointermove({clientX: 50, clientY: 0, preventDefault() {}});
    }
    assert.equal(h.els.resetPhotoButton.disabled, false, gesture); assert.equal(h.state.selectedPhotoId, 'second');
  }
});

const sanitizeFilename = new Function(block('    function sanitizeFilename(', '    function formatBytes(') + ';return sanitizeFilename;')();
// Blur and export both normalize: names must not change a second time.
test('export filename normalization is idempotent for stacked suffixes and trailing spaces', () => {
  for (const name of ['holiday.png.jpg', 'photo .png', '.png', 'report.webp.png', 'photo.jpg .png']) {
    const once = sanitizeFilename(name);
    assert.equal(sanitizeFilename(once), once, name);
    assert(once && !/[. ]$/.test(once), name);
  }
});
test('reserved filename stems are safe even with extra extensions', () => {
  for (const name of ['CON.notes.png', 'nul.backup.jpg', 'LPT1.old.webp', 'aux.png']) {
    assert(!/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(sanitizeFilename(name)), name);
  }
  assert.equal(sanitizeFilename('旅行 2026.png'), '旅行 2026');
  assert.equal(sanitizeFilename('my.photo.png'), 'my.photo');
});
test('reserved-name prefix truncation remains stable and never splits a Unicode pair', () => {
  for (const prefix of ['CON.', 'nul.', 'aux.', 'LPT1.']) {
    const once = sanitizeFilename(prefix + 'a'.repeat(94) + '.jpg.pngZZ');
    assert.equal(sanitizeFilename(once), once, prefix);
    assert(once.length <= 120);
  }
  const unicode = sanitizeFilename('a'.repeat(119) + '😀.png');
  assert(!/[\uD800-\uDBFF]$/.test(unicode), 'Do not leave a lone high surrogate at the name limit');
  assert.equal(sanitizeFilename('旅行😀.png'), '旅行😀');
});

test('language button names the destination in the current language and Help stays localized', () => {
  const T = new Function('return (' + block('    const T=', '\n    const els=').replace('    const T=', '').trim().replace(/;$/, '') + ')')();
  const help = element(), els = {languageButton: element()};
  help.dataset = {i18nTitle: 'helpTitle', i18nAriaLabel: 'helpTitle'};
  const lang = els.languageButton; lang.dataset = {i18nTitle: 'switchLanguage', i18nAriaLabel: 'switchLanguage'};
  const document = {documentElement: {}, querySelectorAll(selector) { return selector === '[data-i18n]' ? [] : [lang, help]; }};
  const state = {lang: 'ja'};
  const apply = new Function('state','T','els','document', `function tr(k){return T[state.lang][k]}function renderPhotos(){}function renderLayoutChoices(){}function renderAdjustPanel(){}function renderFinishPanel(){}function renderExportPanel(){}${block('    function applyLanguage()', '    function setPhase(')}return applyLanguage;`)(state,T,els,document);
  for (const [language, visible, label, helpLabel] of [['ja','EN','英語に切り替え','使い方と注意事項'],['en','JA','Switch to Japanese','How to use & notes']]) {
    state.lang=language;apply();assert.equal(lang.textContent,visible);assert.equal(lang.attrs['aria-label'],label);assert.equal(lang.title,label);assert.equal(help.attrs['aria-label'],helpLabel);assert.equal(help.title,helpLabel);
  }
  assert.match(source, /id="languageButton"[^>]*data-i18n-title="switchLanguage"[^>]*data-i18n-aria-label="switchLanguage"/);
  assert.match(source, /id="resetPhotoButton"[^>]*type="button"[^>]*data-i18n="resetPhoto"/);
  assert(source.includes("els.resetPhotoButton.addEventListener('click',resetPhotoAdjustment)"));
});
