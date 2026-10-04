'use strict';

// Execute the app's actual import/history functions with controlled decode and
// canvas boundaries. Deferred promises make cancellation races deterministic.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '..', 'src/index.template.html'), 'utf8');
function block(a, b) { const start = source.indexOf(a), end = source.indexOf(b, start); assert(start >= 0 && end > start, a); return source.slice(start, end); }
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return {promise, resolve, reject}; }
async function ticks() { for (let i = 0; i < 15; i++) await Promise.resolve(); }
const file = name => ({name, type: 'image/jpeg'});
function harness({manualEncode = false} = {}) {
  const state = {photos: [], generation: 0, failedFiles: [], phase: 'empty', selectedPhotoId: '', selectedLayoutId: '', layoutCandidates: [], layoutPage: 0, canvasRatioKey: '4:3', canvasAspect: 4/3, customRatioWidth: 4, customRatioHeight: 3, gap: 8, outerMargin: 8, cornerRadius: 0, background: '#ffffff', transparentBackground: false, exportFormat: 'jpeg', exportLongSideKey: '2160', customLongSide: 2160, exportQuality: 90, outputFilename: 'photo-collage', exporting: false};
  const photoObjectUrls = new Set(), revoked = [], calls = [], pending = [], encodes = [], disposed = [], statuses = [], toasts = [], mobileNavigation = {page: 'save'};
  let id = 0;
  const document = {body: {dataset: {}}, activeElement: null, createElement(type) {
    if (type === 'canvas') return {width: 0, height: 0, getContext() { return {fillRect() {}, drawImage() {}}; }, toBlob(callback) { manualEncode ? encodes.push(callback) : callback({type: 'image/jpeg', size: 1}); }};
    return {textContent: ''};
  }};
  function element() { const values = new Set(); return {textContent: '', value: '', disabled: false, hidden: false, children: [], classList: {values, add: x => values.add(x), remove: x => values.delete(x), toggle(x, on) { on ? values.add(x) : values.delete(x); }}, replaceChildren() { this.children = []; }, append(n) { this.children.push(n); }, focus() { document.activeElement = this; }}; }
  const els = Object.fromEntries(['loadingProgress', 'fileInput', 'loadingState', 'emptyState', 'readyArea', 'failedFiles', 'failedFilesList', 'chooseButton', 'addMoreButton', 'cancelImportButton', 'undoButton', 'redoButton', 'resetButton', 'exportResult', 'exportProgress'].map(k => [k, element()]));
  const URL = {createObjectURL() { return 'blob:thumbnail-' + (++id); }, revokeObjectURL(url) { revoked.push(url); }};
  const decodeImageSource = async f => { calls.push(f.name); const d = deferred(); pending.push({name: f.name, ...d}); await d.promise; return {width: 100, height: 100, image: {}, dispose() { disposed.push(f.name); }}; };
  const pagehideCode = source.split('\n').find(line => line.includes("addEventListener('pagehide'"));
  assert(pagehideCode);
  const code = pagehideCode + '\n' + block('    function captureHistoryState(){', '    function sourceDimensions(') + block('    function setPhase(', '    function setStatus(') + block('    function validType(', '    function selectedPhoto(') + block('    function renderFailedFiles(', '    function renderPhotos(') + block('    function updateView(){', '    function openPicker(');
  const api = new Function('state', 'photoObjectUrls', 'els', 'document', 'URL', 'decodeImageSource', 'window', 'crypto', 'DOMException', 'statuses', 'mobileNavigation', `
    let pagehide;const blobUrls=new Set();function addEventListener(type,handler){if(type==='pagehide')pagehide=handler}
    const HISTORY_LIMIT=50,undoStack=[],redoStack=[],historyGestures=new Map(),previewImageCache=new Map();
    let historyApplying=false,historyRevision=0,initialHistorySignature='',importJob=null;
    const mobileBottomBar={showPage(key){mobileNavigation.page=key}};
    function tr(k, vars={}){return k+JSON.stringify(vars)}
    function setStatus(message,tone){statuses.push({message,tone})}
    function hideToast(){} function renderFinishPanel(){} function renderPhotos(){renderFailedFiles()}
    function renderAdjustPanel(){} function renderExportPanel(){} function syncMobileNavigation(){}
    function rebuildLayouts(){return Promise.resolve()}
    function yieldToUi(){return Promise.resolve()}
    function isResourcePressureError(error){return error?.name==='RangeError'}
    ${code}
    initialHistorySignature=historySignature(captureHistoryState());
    return {pagehide,eventPagehide:event=>pagehide(event),addFiles,cancelImport:typeof cancelImport==='function'?cancelImport:undefined,resetEditor,undoHistory,redoHistory,cleanupUnusedPhotoResources,undoStack,redoStack,captureHistoryState,historySignature,getJob:()=>importJob};
  `)(state, photoObjectUrls, els, document, URL, decodeImageSource, {AppToast: {show(v) { toasts.push(v); }}}, {randomUUID: () => String(++id)}, DOMException, statuses, mobileNavigation);
  return {...api, mobileNavigation, state, photoObjectUrls, els, document, calls, pending, encodes, disposed, revoked, statuses, toasts, resolve(name) { const p = pending.find(x => x.name === name && !x.done); p.done = true; p.resolve(); }, reject(name, error = new Error('corrupt')) { const p = pending.find(x => x.name === name && !x.done); p.done = true; p.reject(error); }};
}
async function seed(h) { const promise = h.addFiles([file('old-a.jpg'), file('old-b.jpg')]); h.resolve('old-a.jpg'); await ticks(); h.resolve('old-b.jpg'); await promise; h.els.exportResult.textContent = 'previous export'; h.els.exportResult.classList.add('show'); }

test('superseded batch releases completed thumbnails when the new batch all fails', async () => {
  const h = harness(), a = h.addFiles([file('a1.jpg'), file('a2.jpg')]);
  h.resolve('a1.jpg'); await ticks();
  const b = h.addFiles([file('bad-b.jpg')]); h.reject('bad-b.jpg'); await b;
  h.resolve('a2.jpg'); await a;
  assert.equal(h.state.photos.length, 0); assert.equal(h.photoObjectUrls.size, 0); assert.equal(h.revoked.length, 1); assert.equal(h.undoStack.length, 0);
});
test('obsolete errors cannot publish progress, start another decode, or clear current picker input', async () => {
  const h = harness(), a = h.addFiles([file('a1.jpg'), file('a2.jpg')]), b = h.addFiles([file('b1.jpg')]);
  h.els.fileInput.value = 'current picker'; h.reject('a1.jpg'); await ticks();
  assert.equal(h.els.loadingProgress.textContent, '1 / 1'); assert.deepEqual(h.calls, ['a1.jpg', 'b1.jpg']); assert.equal(h.els.fileInput.value, 'current picker');
  h.resolve('b1.jpg'); await Promise.all([a, b]); assert.deepEqual(h.state.photos.map(x => x.name), ['b1.jpg']);
});
test('Cancel immediately restores old collage, history, errors and export while pending decode settles later', async () => {
  const h = harness(); await seed(h); h.state.failedFiles = [{name: 'earlier-bad.jpg'}]; const before = h.historySignature(h.captureHistoryState()), history = h.undoStack.length;
  const pending = h.addFiles([file('new1.jpg'), file('new2.jpg')]); h.resolve('new1.jpg'); await ticks(); h.els.cancelImportButton.focus();
  h.cancelImport(); h.cancelImport();
  assert.equal(h.state.phase, 'ready'); assert.equal(h.getJob(), null); assert.equal(h.historySignature(h.captureHistoryState()), before); assert.equal(h.undoStack.length, history); assert.equal(h.els.exportResult.textContent, 'previous export'); assert(h.els.exportResult.classList.values.has('show')); assert.equal(h.revoked.length, 1); assert.equal(h.state.failedFiles[0].name, 'earlier-bad.jpg'); assert.equal(h.document.activeElement, h.els.addMoreButton); assert.equal(h.mobileNavigation.page, 'photos');
  h.resolve('new2.jpg'); await pending; assert.equal(h.photoObjectUrls.size, 2); assert.equal(h.revoked.length, 1);
});
test('Cancel during first decode restores empty UI and permits retry of the same file', async () => {
  const h = harness(), first = h.addFiles([file('same.jpg')]); h.els.cancelImportButton.focus(); assert.equal(h.els.fileInput.value, ''); h.cancelImport();
  assert.equal(h.state.phase, 'empty'); assert.equal(h.document.activeElement, h.els.chooseButton);
  const second = h.addFiles([file('same.jpg')]); h.pending[0].resolve(); await first; assert.equal(h.state.phase, 'loading'); h.pending[1].resolve(); await second;
  assert.equal(h.state.photos.length, 1); h.cancelImport(); assert.equal(h.state.photos.length, 1);
});
test('late thumbnail encoding after Cancel cannot allocate or commit a URL', async () => {
  const h = harness({manualEncode: true}), task = h.addFiles([file('encode.jpg')]); h.resolve('encode.jpg'); await ticks(); assert.equal(h.encodes.length, 1); h.cancelImport(); h.encodes[0]({size: 1}); await task;
  assert.equal(h.photoObjectUrls.size, 0); assert.equal(h.revoked.length, 0); assert.deepEqual(h.disposed, ['encode.jpg']);
});
test('all-failed first import exposes safe filenames in an error phase without enabling ready UI', async () => {
  const h = harness(), name = '<img src=x onerror=alert(1)>.jpg', task = h.addFiles([file(name)]); h.reject(name); await task;
  assert.equal(h.state.phase, 'error'); assert.equal(h.els.readyArea.classList.values.has('show'), false); assert(h.els.failedFiles.classList.values.has('show')); assert(h.els.failedFilesList.children[0].textContent.startsWith(name));
  const ready = source.indexOf('<div class="ready-area" id="readyArea">'), failure = source.indexOf('id="failedFiles"');
  assert(failure < ready || failure > source.indexOf('</section>\n    </section>', ready), 'failure list must be outside hidden readyArea');
});
test('all-failed add preserves existing collage and redo history and displays memory recovery', async () => {
  const h = harness(); await seed(h); const before = h.historySignature(h.captureHistoryState()); h.redoStack.push(h.captureHistoryState());
  const task = h.addFiles([file('memory.jpg')]); h.reject('memory.jpg', new RangeError('allocation failed')); await task;
  assert.equal(h.historySignature(h.captureHistoryState()), before); assert.equal(h.redoStack.length, 1); assert.equal(h.els.exportResult.textContent, 'previous export'); assert.equal(h.statuses.at(-1).message, 'inputMemoryFailed{}'); assert.equal(h.revoked.length, 0);
});
test('partial import commits only valid photos once and clears stale export details only on success', async () => {
  const h = harness(); await seed(h); const before = h.undoStack.length;
  const task = h.addFiles([file('good.jpg'), file('bad.jpg')]); assert.equal(h.els.exportResult.textContent, 'previous export'); h.resolve('good.jpg'); await ticks(); h.reject('bad.jpg'); await task;
  assert.equal(h.state.photos.length, 3); assert.equal(h.undoStack.length, before + 1); assert.equal(h.state.failedFiles[0].name, 'bad.jpg'); assert.equal(h.els.exportResult.textContent, ''); assert(!h.els.exportResult.classList.values.has('show'));
  h.undoHistory(); assert.equal(h.state.photos.length, 2); h.redoHistory(); assert.equal(h.state.photos.length, 3); assert.equal(h.revoked.length, 0);
});
test('history cleanup during an import cannot revoke staged photos', async () => {
  const h = harness(), task = h.addFiles([file('a.jpg'), file('b.jpg')]); h.resolve('a.jpg'); await ticks(); h.cleanupUnusedPhotoResources(); assert.equal(h.revoked.length, 0); h.resolve('b.jpg'); await task;
  assert.equal(h.state.photos.length, 2); assert.equal(h.photoObjectUrls.size, 2);
});
test('Undo and Reset cancel loading without allowing a late result or error to change their outcome', async () => {
  for (const action of ['undoHistory', 'resetEditor']) {
    const h = harness(); await seed(h); const task = h.addFiles([file('late.jpg')]); h[action](); const statusCount = h.statuses.length; assert.equal(h.getJob(), null); assert.equal(h.state.photos.length, 0); h.reject('late.jpg'); await task;
    assert.equal(h.state.photos.length, 0); assert.equal(h.statuses.length, statusCount); assert.equal(h.state.phase, 'empty');
  }
});
test('repeated cancelled imports release exactly their own URLs and keep old/Undo URLs', async () => {
  const h = harness(); await seed(h);
  for (let i = 0; i < 4; i++) { const task = h.addFiles([file('a' + i + '.jpg'), file('b' + i + '.jpg')]); h.resolve('a' + i + '.jpg'); await ticks(); h.cancelImport(); h.resolve('b' + i + '.jpg'); await task; }
  assert.equal(h.photoObjectUrls.size, 2); assert.equal(h.revoked.length, 4); assert.equal(new Set(h.revoked).size, 4); h.undoHistory(); h.redoHistory(); assert.equal(h.state.photos.length, 2); assert.equal(h.revoked.length, 4);
});
test('empty picker selection is a no-op, and twenty-photo capacity remains enforced', async () => {
  const h = harness(), task = h.addFiles([file('pending.jpg')]); const generation = h.state.generation; await h.addFiles([]); assert.equal(h.state.generation, generation); h.resolve('pending.jpg'); await task;
  h.state.photos = Array.from({length: 20}, (_, i) => ({...h.state.photos[0], id: String(i)})); await h.addFiles([file('overflow.jpg')]); assert.equal(h.calls.length, 1); assert.equal(h.state.photos.length, 20); assert.equal(h.toasts.at(-1).message, 'limit{"count":1}');
});
test('Cancel is a native localized button; progress is announced and mobile all-failed state stays visible', () => {
  assert.match(source, /<button[^>]*id="cancelImportButton"[^>]*type="button"[^>]*data-i18n="cancelImport"/);
  assert.match(source, /id="loadingProgress"[^>]*role="status"[^>]*aria-live="polite"/);
  const text = block('    const T=', '\n    const els=').replace('    const T=', '').trim().replace(/;$/, ''), translations = new Function('return (' + text + ')')();
  for (const key of ['cancelImport', 'importCancelled', 'helpImport']) { assert(translations.ja[key]); assert(translations.en[key]); }
  assert(source.includes("els.cancelImportButton.addEventListener('click',()=>cancelImport())"));
  assert(source.includes("cancelImport({restore:false,announce:false})"));
});


test('BFCache pagehide restores the cancelled import UI and retains reusable committed resources', async () => {
  const h = harness(); await seed(h); const task = h.addFiles([file('staged.jpg'), file('late.jpg')]); h.resolve('staged.jpg'); await ticks();
  h.eventPagehide({persisted: true}); assert.equal(h.getJob(), null); assert.equal(h.state.phase, 'ready'); assert.equal(h.photoObjectUrls.size, 2); assert.equal(h.revoked.length, 1);
  h.resolve('late.jpg'); await task; assert.equal(h.state.photos.length, 2); assert.equal(h.state.phase, 'ready'); assert.equal(h.revoked.length, 1);
});
test('nonpersisted pagehide releases staged and session thumbnail resources without late allocation', async () => {
  const h = harness(); await seed(h); const task = h.addFiles([file('staged.jpg'), file('late.jpg')]); h.resolve('staged.jpg'); await ticks();
  h.eventPagehide({persisted: false}); assert.equal(h.getJob(), null); assert.equal(h.photoObjectUrls.size, 0); assert.equal(h.revoked.length, 3);
  h.resolve('late.jpg'); await task; assert.equal(h.photoObjectUrls.size, 0); assert.equal(h.revoked.length, 3);
});
