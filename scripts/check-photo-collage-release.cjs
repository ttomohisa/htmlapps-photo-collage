'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'index.template.html'), 'utf8');
const config = JSON.parse(fs.readFileSync(path.join(root, 'app.config.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function block(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert(start >= 0, 'Missing marker: ' + startMarker);
  assert(end > start, 'Missing end marker after: ' + startMarker);
  return source.slice(start, end);
}

assert(config.version === '1.0.0', 'app.config.json version must be 1.0.0.');
assert(source.includes('v1.0.0'), 'UI version must be v1.0.0.');

const scriptMatch = source.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
assert(scriptMatch, 'Application script block is missing.');
new Function(scriptMatch[1]);

const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert(duplicateIds.length === 0, 'Duplicate element IDs: ' + duplicateIds.join(', '));

assert((source.match(/__APP_ICON_DATA_URI__/g) || []).length === 2, 'Canonical app icon placeholder must appear exactly twice.');
assert((source.match(/id="outputFilename"/g) || []).length === 1, 'outputFilename must appear exactly once.');
assert(source.includes("connect-src 'none'"), "CSP must keep connect-src 'none'.");
assert(source.includes('class="icon-button header-icon-button" id="helpButton"'), 'Header help button must follow the current template header pattern.');
assert(source.includes("privacyBadge:'完全ローカル処理'"), 'Japanese local-processing badge is missing.');
assert(source.includes("privacyBadge:'Fully local processing'"), 'English local-processing badge is missing.');
assert(source.includes("canvasRatioKey:'4:3',canvasAspect:4/3"), 'Default canvas ratio must be 4:3.');
assert(source.includes("state.canvasRatioKey='4:3';state.canvasAspect=4/3"), 'Reset must return to 4:3.');
assert(source.includes('id="failedFiles"') && source.includes('id="failedFilesList"'), 'Failed-file UI is missing.');
assert(!source.includes('\\n    .photo-actions'), 'Malformed literal \\n remains in photo action CSS.');
assert(!/\b(?:src|href)\s*=\s*["']https?:\/\//i.test(source), 'External runtime src/href detected.');

const readmeEn = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const readmeJa = fs.readFileSync(path.join(root, 'README.ja.md'), 'utf8');
const screenshotRequirements = [
  {name: 'screenshot.png', minWidth: 1000, minHeight: 700, readme: readmeJa},
  {name: 'screenshot-en.png', minWidth: 1000, minHeight: 700, readme: readmeEn},
  {name: 'screenshot-mobile.png', minWidth: 360, minHeight: 700, readme: readmeJa},
  {name: 'screenshot-mobile-en.png', minWidth: 360, minHeight: 700, readme: readmeEn}
];
function pngDimensions(buffer) {
  const signature = '89504e470d0a1a0a';
  assert(buffer.length >= 24 && buffer.subarray(0, 8).toString('hex') === signature, 'Release screenshot must be a PNG.');
  return {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)};
}
for (const requirement of screenshotRequirements) {
  const relative = 'assets/' + requirement.name;
  const full = path.join(root, relative);
  assert(fs.existsSync(full), 'Missing release screenshot: ' + relative);
  const bytes = fs.readFileSync(full);
  assert(bytes.length > 10000, 'Release screenshot is unexpectedly small: ' + relative);
  const dimensions = pngDimensions(bytes);
  assert(dimensions.width >= requirement.minWidth && dimensions.height >= requirement.minHeight,
    'Release screenshot dimensions are too small: ' + relative + ' (' + dimensions.width + 'x' + dimensions.height + ')');
  assert(requirement.readme.includes(relative), 'README does not reference release screenshot: ' + relative);
}
assert(readmeEn.includes('https://ttomohisa.github.io/htmlapps-photo-collage/'), 'English README live demo URL is missing.');
assert(readmeJa.includes('https://ttomohisa.github.io/htmlapps-photo-collage/'), 'Japanese README live demo URL is missing.');
assert(readmeEn.includes('check-photo-collage-release.cjs') && readmeJa.includes('check-photo-collage-release.cjs'),
  'Stable release regression command must appear in both READMEs.');

const translationStart = source.indexOf('    const T=');
const translationEnd = source.indexOf('\n    const els=', translationStart);
assert(translationStart >= 0 && translationEnd > translationStart, 'Translation object markers are missing.');
const translationExpression = source.slice(translationStart + '    const T='.length, translationEnd).trim().replace(/;$/, '');
const translations = new Function('return (' + translationExpression + ');')();
const jaKeys = Object.keys(translations.ja).sort();
const enKeys = Object.keys(translations.en).sort();
assert(JSON.stringify(jaKeys) === JSON.stringify(enKeys), 'Japanese and English translation keys differ.');

const layoutCode = block('    function generatePartitions(', '    function getSelectedLayout()');
const layoutApi = new Function(layoutCode + '; return {generateLayouts};')();

let standardLayoutCases = 0;
for (const aspect of [1, 4/5, 9/16, 16/9, 3/2, 4/3, 0.1, 10]) {
  for (let count = 2; count <= 20; count += 1) {
    const photos = Array.from({length: count}, (_, index) => ({
      aspect: [0.52, 0.67, 0.8, 1, 1.25, 1.5, 1.78, 2.2][index % 8],
      hero: false
    }));
    const layouts = layoutApi.generateLayouts(photos, aspect);
    assert(layouts.length > 0, 'No layout generated for aspect=' + aspect + ', count=' + count);
    assert(layouts.every(layout => layout.cells.length === count), 'Layout cell count mismatch.');
    standardLayoutCases += 1;
  }
}

let extremeLayoutCases = 0;
for (const canvasAspect of [0.1, 1, 10]) {
  for (const base of [
    [0.01, 0.02, 0.03, 0.05, 0.1, 0.2],
    [5, 10, 20, 33, 50, 100],
    [0.01, 100, 0.03, 50, 0.1, 20, 1, 1.5]
  ]) {
    for (const count of [2, 3, 5, 8, 12, 20]) {
      const photos = Array.from({length: count}, (_, index) => ({aspect: base[index % base.length], hero: false}));
      const layouts = layoutApi.generateLayouts(photos, canvasAspect);
      assert(layouts.length > 0, 'Extreme layout generation failed.');
      for (const layout of layouts) {
        assert(Number.isFinite(layout.score), 'Extreme layout score is not finite.');
        assert(layout.cells.length === count, 'Extreme layout cell count mismatch.');
        for (const cell of layout.cells) {
          const total = cell.x + cell.y + cell.w + cell.h;
          assert(Number.isFinite(total), 'Extreme layout cell has non-finite geometry.');
          assert(cell.x >= 0 && cell.y >= 0 && cell.w > 0 && cell.h > 0, 'Extreme layout cell has invalid geometry.');
          assert(cell.x + cell.w <= 1.000001 && cell.y + cell.h <= 1.000001, 'Extreme layout cell exceeds normalized bounds.');
        }
      }
      extremeLayoutCases += 1;
    }
  }
}

const candidateCounts = [];
for (let count = 2; count <= 20; count += 1) {
  const photos = Array.from({length: count}, (_, index) => ({
    aspect: [0.56, 0.75, 1, 1.33, 1.5, 1.78][index % 6],
    hero: false
  }));
  const layouts = layoutApi.generateLayouts(photos, 4/3);
  candidateCounts.push(layouts.length);
  if (count >= 4) assert(layouts.length > 6, 'More-layout pages are expected for count=' + count);
}

const validTypeCode = block('    function validType(', '    function makeId()');
const validType = new Function(validTypeCode + '; return validType;')();
for (const [file, expected] of [
  [{name: 'photo.JPG', type: ''}, true],
  [{name: 'resume.webp', type: 'application/octet-stream'}, true],
  [{name: 'x.jpeg', type: 'image/jpg'}, true],
  [{name: 'x.jpeg', type: 'image/pjpeg'}, true],
  [{name: 'x.png', type: 'image/x-png'}, true],
  [{name: 'x.bin', type: 'application/octet-stream'}, false],
  [{name: 'x.jpg', type: 'text/plain'}, false],
  [{name: 'whatever', type: 'image/jpeg'}, true]
]) {
  assert(validType(file) === expected, 'File type regression failed for ' + JSON.stringify(file));
}

const dimensionCode = block('    function maxLongSideForAspect(', '    function sanitizeFilename(');
const dimensionApi = new Function(
  "const state={canvasAspect:1,exportLongSideKey:'custom',customLongSide:8192};" +
  dimensionCode +
  '; return {state,outputDimensions,maxLongSideForAspect};'
)();
for (const aspect of [0.1, 0.2, 9/16, 0.8, 1, 1.5, 16/9, 5, 10]) {
  dimensionApi.state.canvasAspect = aspect;
  dimensionApi.state.customLongSide = 8192;
  const dimensions = dimensionApi.outputDimensions();
  assert(Math.max(dimensions.width, dimensions.height) <= 8192, '8192px edge limit exceeded.');
  assert(dimensions.width * dimensions.height <= 32000000, '32MP limit exceeded.');
}

const moveCode = block('    function movePhotoNear(', '    function clearPhotoReorderVisuals()');
const moveApi = new Function(
  "const state={photos:[{id:'a'},{id:'b'},{id:'c'},{id:'d'}],generation:0};" +
  'function captureHistoryState(){return {photos:state.photos.map(item=>({...item}))}}' +
  'function commitHistory(){} function updateView(){}' +
  moveCode +
  '; return {state,movePhotoNear};'
)();
moveApi.movePhotoNear('b', 'd');
assert(moveApi.state.photos.map(item => item.id).join('') === 'acdb', 'Forward drag reorder regression failed.');
moveApi.state.photos = [{id:'a'},{id:'b'},{id:'c'},{id:'d'}];
moveApi.movePhotoNear('d', 'b');
assert(moveApi.state.photos.map(item => item.id).join('') === 'adbc', 'Backward drag reorder regression failed.');

const historyCode = block('    function captureHistoryState(){', '    function currentPhotoIds()');
const historyResult = new Function(
  "const state={photos:[],selectedPhotoId:'',selectedLayoutId:'',generation:0,layoutCandidates:[],layoutPage:0,cropDrag:null,dragPhotoId:'',pointerReorder:null,failedFiles:[],canvasRatioKey:'4:3',canvasAspect:4/3,customRatioWidth:4,customRatioHeight:3,gap:8,outerMargin:8,cornerRadius:0,background:'#ffffff',transparentBackground:false,exportFormat:'jpeg',exportLongSideKey:'2160',customLongSide:2160,exportQuality:90,outputFilename:'photo-collage',exporting:false};" +
  "const HISTORY_LIMIT=50,undoStack=[],redoStack=[],historyGestures=new Map();let historyApplying=false,historyRevision=0,initialHistorySignature='';" +
  "const els={undoButton:{disabled:true},redoButton:{disabled:true},resetButton:{disabled:true},exportResult:{classList:{remove(){}},textContent:''},exportProgress:{classList:{remove(){}},textContent:''}};" +
  "const window={AppToast:{show(){}}};function tr(k){return k}function setStatus(){}function hideToast(){}function updateView(){}function renderFinishPanel(){}function cleanupUnusedPhotoResources(){}" +
  historyCode +
  "initialHistorySignature=historySignature(captureHistoryState());" +
  "for(let i=0;i<60;i++){const before=captureHistoryState();state.gap=i;commitHistory(before)}" +
  "if(undoStack.length!==50)throw new Error('History limit regression failed');" +
  "const last=state.gap;undoHistory();if(state.gap===last)throw new Error('Undo regression failed');redoHistory();if(state.gap!==last)throw new Error('Redo regression failed');" +
  "state.photos=[{id:'p1',file:{name:'a.jpg'},name:'a.jpg',width:100,height:100,aspect:1,thumbUrl:'blob:a',cropX:.5,cropY:.5,zoom:1,fit:'fill',hero:false}];state.selectedPhotoId='p1';" +
  "resetEditor();if(state.photos.length!==0)throw new Error('Reset regression failed');undoHistory();if(state.photos.length!==1)throw new Error('Reset undo regression failed');" +
  "return {undo:undoStack.length,redo:redoStack.length};"
)();

const staleVersions = source.match(/v0\.(?:[1-8])(?:\.\d+)?/g) || [];
assert(staleVersions.length === 0, 'Stale pre-v1.0 UI version text remains: ' + [...new Set(staleVersions)].join(', '));

assert((source.match(/class="app-mobile-page/g) || []).length === 4, 'Expected exactly four mobile pages.');
assert((source.match(/class="app-mobile-bottom-item/g) || []).length === 4, 'Expected exactly four mobile navigation items.');

console.log('[OK] Photo Collage release regression passed.');
console.log('[OK] Standard layout cases:', standardLayoutCases);
console.log('[OK] Extreme layout cases:', extremeLayoutCases);
console.log('[OK] Candidate counts 2..20:', candidateCounts.join(','));
console.log('[OK] Translation keys:', jaKeys.length);
console.log('[OK] History stacks:', JSON.stringify(historyResult));
