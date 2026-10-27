'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{test}=require('node:test');
const source=fs.readFileSync(path.join(__dirname,'..','src/index.template.html'),'utf8');
function block(a,b){const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j)}
function element(value=''){return {value,checked:false,textContent:'',dataset:{},attrs:{},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return []}}}
const T=new Function('return ('+block('    const T=','\n    const els=').replace('    const T=','').trim().replace(/;$/,'')+')')();
test('language switch preserves every uncommitted numeric/text draft and active gesture state',()=>{
 const state={lang:'en',layoutCandidates:[],photos:[],outputFilename:'trip.png',customLongSide:2160,customRatioWidth:4,customRatioHeight:3,selectedPhotoId:'p1',exporting:true,generation:9};
 const els={languageButton:element(),customLongSide:element('3'),customRatioWidth:element(''),customRatioHeight:element('9'),outputFilename:element('trip.png'),backgroundHex:element('#ff'),layoutOptions:element(),moreLayoutsButton:element(),resetDescription:element(),retentionStatus:element(),languageNotice:element(),exportProgress:element(),photoGrid:element()};
 const inputs=[els.customLongSide,els.customRatioWidth,els.customRatioHeight,els.outputFilename,els.backgroundHex];const before=inputs.map(x=>x.value),stateBefore=structuredClone(state);
 const document={documentElement:{},title:'',querySelector(){return element()},querySelectorAll(s){return s==='input,textarea,select'?inputs:[]}};
 const apply=new Function('state','T','els','document',`const UI={text(){return 'session'},setSaveStatus(){}};let languageSessionOnly=false,statusMessage=null,toastMessage=null,lastExport=null;const translatedMessages=new Map();function tr(k){return T[state.lang][k]||k}function renderPhotos(){}function renderLayoutChoices(){}function renderAdjustPanel(){}function renderFinishPanel(){els.customRatioWidth.value='4';els.customRatioHeight.value='3';els.backgroundHex.value='#ffffff'}function renderExportPanel(){els.customLongSide.value='2160';els.outputFilename.value=state.outputFilename}function renderFailedFiles(){}function refreshPhotoLanguage(){}function renderLocalizedMessages(){}function renderResetDescription(){}${source.includes('    function captureLanguageInputs(')?block('    function captureLanguageInputs(', '    function setPhase('):block('    function applyLanguage()', '    function setPhase(')}return applyLanguage;`)(state,T,els,document);
 apply();assert.deepEqual(inputs.map(x=>x.value),before);assert.deepEqual(state,stateBefore);
});

const UI=require('../components/ui-conventions.js');
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}}
function richElement(){const e=element(),classes=new Set();return Object.assign(e,{style:{},hidden:false,disabled:false,handlers:{},children:[],classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle(k,on){on?classes.add(k):classes.delete(k)},contains:k=>classes.has(k)},querySelector(){return this.label||(this.label=element())},addEventListener(k,fn){this.handlers[k]=fn},focus(){this.focused=true},append(x){this.children.push(x)},remove(){}})}
function exportHarness(){
 const state=new Function('UI',source.split('\n').find(x=>x.includes('    const state='))+';return state;')(UI);state.lang='en';
 state.photos=[{id:'a',name:'a.jpg',file:{name:'a.jpg'},cropX:.2,cropY:.5,zoom:1.3,fit:'fill',hero:false},{id:'b',name:'b.jpg',file:{name:'b.jpg'},cropX:.5,cropY:.5,zoom:1,fit:'fit',hero:false}];state.selectedPhotoId='a';
 const els=Object.fromEntries(['formatGrid','resolutionGrid','customResolutionRow','customLongSide','exportDimensions','qualityField','qualityRange','qualityValue','filenameExtension','outputFilename','exportButton','exportScope','exportPrerequisite','exportResult','chooseButton','addMoreButton','exportProgress','statusStrip','statusText','retentionStatus','languageNotice','languageButton','photoGrid','layoutOptions','moreLayoutsButton','resetDescription','ratioGrid','customRatioRow','customRatioWidth','customRatioHeight','gapRange','gapValue','marginRange','marginValue','radiusRange','radiusValue','backgroundColor','backgroundHex','transparentBackground'].map(k=>[k,richElement()]));els.outputFilename.value='旅行.png.jpg';
 const requests=[],encodes=[],downloads=[],draws=[],disposed=[],canvases=[],toasts=[],timers=[],urls=[];
 const document={documentElement:{},querySelector(){return richElement()},querySelectorAll(){return []},body:{append(){}},createElement(type){if(type==='a'){const a=richElement();a.click=()=>downloads.push(a.download);return a}const c={width:1,height:1,toDataURL:()=> 'data:image/webp',getContext:()=>({clearRect(){},fillRect(){}}),toBlob(callback,mime,quality){encodes.push({callback,mime,quality,width:c.width,height:c.height})}};canvases.push(c);return c}};
 const api=new Function('state','els','document','UI','T','requests','encodes','draws','disposed','toasts','timers','urls',`
 let importJob=null,lastExport=null,statusMessage=null,toastMessage=null,languageSessionOnly=false;const translatedMessages=new Map();
 const window={AppToast:{show(x){toasts.push(x)}}};const console={error(){}};const URL={createObjectURL(blob){urls.push(blob);return 'blob:download'},revokeObjectURL(){}};function setTimeout(fn){timers.push(fn)}
 function renderAdjustPanel(){}function renderFailedFiles(){}function updateHistoryControls(){}function yieldToUi(){return Promise.resolve()}function isResourcePressureError(e){return e.name==='RangeError'}
 function getSelectedLayout(){return {cells:[{x:0,y:0,w:.5,h:1},{x:.5,y:0,w:.5,h:1}]}}
 function decodeImageSource(file){const d={file};d.promise=new Promise((resolve,reject)=>{d.resolve=()=>resolve({image:file,dispose(){disposed.push(file.name)}});d.reject=reject});requests.push(d);return d.promise}
 function drawPhoto(ctx,image,photo,...geometry){draws.push({image,photo,geometry})}
 ${block('    function captureHistoryState(){','    function updateHistoryControls(')}
 ${block('    function tr(','    function captureLanguageInputs(')}
 ${block('    function renderFinishPanel(){','    function setCanvasRatio(')}
 ${block('    function captureLanguageInputs(','    function setPhase(')}
 ${block('    function setStatus(','    function validType(')}
 ${block('    const exportFormats=','    function setExportFormat(')}
 ${block('    function loadSourceImage(','    function loadPreviewImage(')}
 return {exportImage,applyLanguage,renderExportPanel,renderExportResult,renderExportScope,captureHistoryState,exportStateSignature,setStatus,getLast:()=>lastExport,setImport:v=>importJob=v,setLanguage:l=>state.lang=l,getStatus:()=>statusMessage,getImport:()=>importJob};
 `)(state,els,document,UI,T,requests,encodes,draws,disposed,toasts,timers,urls);
 return {...api,state,els,document,requests,encodes,downloads,draws,disposed,canvases,toasts,timers,urls};
}
async function ticks(){for(let i=0;i<12;i++)await Promise.resolve()}
async function finishExport(h){h.requests.at(-1).resolve();await ticks();h.requests.at(-1).resolve();await ticks();h.encodes.at(-1).callback({size:2048,type:h.encodes.at(-1).mime});await ticks()}

test('export unavailable/busy states use native disabled and visible prerequisites',()=>{
 const h=exportHarness();h.state.photos=[];h.renderExportPanel();assert.equal(h.els.exportButton.disabled,true);assert.match(h.els.exportPrerequisite.textContent,/two photos/);
 h.state.photos=[{},{}];h.setImport({generation:1});h.renderExportPanel();assert.equal(h.els.exportButton.disabled,true);assert.match(h.els.exportPrerequisite.textContent,/cancel.*import/);
 h.setImport(null);h.state.exporting=true;h.renderExportPanel();assert.equal(h.els.exportButton.attrs['data-bk-state'],'busy');assert.equal(h.els.exportButton.disabled,true);assert.match(h.els.exportPrerequisite.textContent,/Please wait/);
 h.state.exporting=false;h.renderExportPanel();assert.equal(h.els.exportButton.disabled,false);assert.equal(h.els.exportButton.attrs['data-bk-state'],'ready');
});

test('delayed export delivers one snapshot image with actual name/format/geometry, and language keeps encoding inputs stable',async()=>{
 const h=exportHarness(),originalFile=h.state.photos[0].file,promise=h.exportImage();assert.equal(h.requests.length,1);await h.exportImage();assert.equal(h.requests.length,1,'double submit must not decode again');
 assert.equal(h.els.exportButton.disabled,true);h.setLanguage('ja');h.applyLanguage();assert.match(h.els.exportProgress.textContent,/画像を作成/);assert.equal(h.state.outputFilename,'旅行');h.state.outputFilename='new-name';h.state.exportFormat='png';h.state.gap=35;h.state.photos[0].cropX=.9;
 await finishExport(h);await promise;
 assert.deepEqual(h.downloads,['旅行.jpg']);assert.equal(h.encodes[0].mime,'image/jpeg');assert.equal(h.encodes[0].quality,.9);assert.equal(h.encodes[0].width,2160);assert.equal(h.encodes[0].height,1620);assert.equal(h.draws[0].image,originalFile);assert.equal(h.draws[0].photo.cropX,.2);assert.deepEqual(h.disposed,['a.jpg','b.jpg']);assert.equal(h.canvases.at(-1).width,1);
 assert.match(h.els.exportResult.textContent,/旅行.jpg/);assert.match(h.els.exportResult.textContent,/JPEG/);assert.match(h.els.exportResult.textContent,/2160 × 1620/);assert.match(h.els.exportResult.textContent,/写真2枚 → 1枚/);assert.match(h.els.exportResult.textContent,/ダウンロードを開始/);assert.match(h.els.exportResult.textContent,/前回/);
});

test('completed export survives a failed retry, with persistent localized recovery and current work intact',async()=>{
 const h=exportHarness(),first=h.exportImage();await finishExport(h);await first;const before=h.captureHistoryState(),result=h.getLast();
 const failure=h.exportImage();h.requests.at(-1).reject(new RangeError('allocation failed'));await failure;
 assert.equal(h.getLast(),result);assert.deepEqual(h.captureHistoryState(),before);assert.equal(h.downloads.length,1);assert.equal(h.els.statusStrip.attrs.role,'alert');assert.match(h.els.statusText.textContent,/resolution/);assert.equal(h.els.exportButton.disabled,false);assert(h.els.exportResult.classList.contains('show'));
 h.setLanguage('ja');h.applyLanguage();const descriptor=h.getStatus();assert.equal(descriptor.key,'exportMemoryFailed');assert.equal(h.els.statusText.textContent,T.ja.exportMemoryFailed);assert.deepEqual(h.captureHistoryState(),before);
});

test('result freshness ignores selection and language, but tracks output edits and returning through Undo',async()=>{
 const h=exportHarness(),p=h.exportImage();await finishExport(h);await p;assert.doesNotMatch(h.els.exportResult.textContent,/Previous/);
 h.state.selectedPhotoId='b';h.state.lang='ja';h.renderExportResult();assert.doesNotMatch(h.els.exportResult.textContent,/前回/);
 h.state.gap=20;h.renderExportResult();assert.match(h.els.exportResult.textContent,/前回/);h.state.gap=8;h.renderExportResult();assert.doesNotMatch(h.els.exportResult.textContent,/前回/);
});

test('Output settings destination uses the real page adapter and performs zero export/download actions',()=>{
 const buttons=['photos','layout','finish','save'].map(key=>Object.assign(richElement(),{dataset:{mobileKey:key,mobilePageTarget:key+'Page'}}));const pages=Object.fromEntries(buttons.map(b=>[b.dataset.mobilePageTarget,richElement()]));
 class HTMLElement{};const root=new HTMLElement();root.querySelectorAll=()=>buttons;root.contains=()=>true;root.addEventListener=(k,fn)=>root[k]=fn;
 const document={getElementById:id=>pages[id],createElement(){return {click(){downloadCalls++}}}},window={matchMedia:()=>({matches:false})};let exportCalls=0,downloadCalls=0;
 const mount=new Function('HTMLElement','document','window','exportImage',block('    function mountMobileBottomBar(','    window.AppMobileBottomBar=')+';return mountMobileBottomBar;')(HTMLElement,document,window,()=>exportCalls++);
 const bar=mount(root,{initialPage:'photos'});const save=buttons[3];save.closest=()=>save;root.click({target:save});assert.equal(bar.currentPage(),'save');assert.equal(save.attrs['aria-current'],'page');assert.equal(pages.savePage.classList.contains('is-mobile-active'),true);assert.equal(exportCalls,0);assert.equal(downloadCalls,0);assert(!save.attrs['data-bk-state']);
 assert.equal(T.en.mobileSave,'Output settings');assert.equal(T.ja.mobileSave,'出力設定');
});

test('toast expiry pauses while the Undo action has keyboard focus',()=>{
 const els={appToast:richElement(),appToastAction:richElement(),appToastMessage:richElement()},document={activeElement:null},scheduled=[];
 const api=new Function('els','document','setTimeout','clearTimeout',`const window={};const translatedMessages=new Map();let toastMessage=null;${block('    let toastTimer=0;','    function tr(')}return {show:window.AppToast.show,expireToast};`)(els,document,fn=>{scheduled.push(fn);return scheduled.length},()=>{});
 let undone=0;api.show({message:'Removed',actionLabel:'Undo',onAction:()=>undone++});document.activeElement=els.appToastAction;scheduled[0]();assert(els.appToast.classList.contains('show'));assert.equal(typeof els.appToastAction.onclick,'function');els.appToastAction.onclick();assert.equal(undone,1);
 api.show({message:'Removed',actionLabel:'Undo',onAction:()=>undone++});document.activeElement=null;scheduled.at(-1)();assert(!els.appToast.classList.contains('show'));assert.equal(els.appToastAction.onclick,null);
});

test('explicit app language choice uses shared persistence, reports failure, and startup never writes',()=>{
 let writes=0;const state={lang:'en',photos:[{id:'a'}],generation:5},before=structuredClone(state),storage={getItem(){return 'en'},setItem(){writes++;throw Error('denied')}};
 const adapterUI={...UI,chooseLanguage:l=>UI.chooseLanguage(l,{storage,url:'file:///collage.html?lang=en',history:{replaceState(){}}})};
 const choose=new Function('state','UI',`let languageSessionOnly=false;function applyLanguage(){}${block('    function chooseAppLanguage()', '    function setPhase(')};return {chooseAppLanguage,getNotice:()=>languageSessionOnly};`)(state,adapterUI);
 assert.equal(UI.resolveLanguage({url:'file:///collage.html?lang=ja',storage,languages:['en']}),'ja');assert.equal(writes,0);choose.chooseAppLanguage();assert.equal(writes,1);assert.equal(state.lang,'ja');assert.equal(choose.getNotice(),true);assert.deepEqual(state.photos,before.photos);assert.equal(state.generation,5);
});

test('vendored component bytes match the pinned canonical lock',()=>{
 const crypto=require('node:crypto'),lock=require('../components/ui-conventions.lock.json');assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..','components/ui-conventions.lock.json'))).digest('hex'),'475cafc8e99ca845cbef919b819e1239aa66c5aec3b7fbd2690d1a64a829974e');for(const [name,hash]of Object.entries(lock.files)){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..','components',name))).digest('hex'),hash)}
});

function historyHarness(){
 const state=exportHarness().state;state.gap=24;state.outputFilename='旅行 edits';state.background='#334455';const els=Object.fromEntries(['undoButton','redoButton','resetButton','exportResult','exportProgress','appToastAction','resetDialog','closeResetButton','cancelResetButton','confirmResetButton'].map(k=>[k,richElement()]));
 els.resetDialog.showModal=function(){this.open=true};els.resetDialog.close=function(){this.open=false;this.handlers.close?.()};let toast=null,hides=0;
 const api=new Function('state','els','storeToast','hide',`
 const HISTORY_LIMIT=50,undoStack=[],redoStack=[],historyGestures=new Map();let historyApplying=false,historyRevision=0,initialHistorySignature='';const window={AppToast:{show:storeToast}};
 function tr(k){return k}function setStatus(){}function renderFinishPanel(){}function updateView(){}function cleanupUnusedPhotoResources(){}function cancelImport(){}function hideToast(){hide()}
 ${block('    function captureHistoryState(){','    function currentPhotoIds(')}
 initialHistorySignature='baseline';
 function renderResetDescription(){els.resetDescription='scope'}
 ${block("    els.resetButton.addEventListener('click'",'    function editableShortcutTarget(')}
 return {captureHistoryState,resetEditor,undoHistory,redoHistory,commitHistory,undoStack,redoStack};
 `)(state,els,x=>{toast=x;els.appToastAction.onclick=x.onAction||null},()=>{toast=null;els.appToastAction.onclick=null;hides++});
 return {...api,state,els,getToast:()=>toast,hides:()=>hides};
}

test('full editor reset has count/scope, cancel-first focus, genuine Undo, and preserves original File objects',()=>{
 const h=historyHarness(),before=h.captureHistoryState(),file=before.photos[0].file;h.els.resetButton.handlers.click();assert.equal(h.els.cancelResetButton.focused,true);assert.equal(h.els.resetDialog.open,true);
 h.els.cancelResetButton.handlers.click();assert.deepEqual(h.captureHistoryState(),before);assert.equal(h.els.resetButton.focused,true);
 h.els.resetButton.handlers.click();h.els.resetDialog.handlers.click({target:h.els.resetDialog});assert.deepEqual(h.captureHistoryState(),before);
 h.resetEditor();assert.equal(h.state.photos.length,0);assert.equal(h.state.gap,8);assert.equal(h.state.outputFilename,'photo-collage');const undo=h.getToast();assert.equal(undo.actionLabel,'undoAction');undo.onAction();assert.deepEqual(h.captureHistoryState(),before);assert.equal(h.state.photos[0].file,file);h.redoHistory();assert.equal(h.state.photos.length,0);
 assert.match(T.en.resetScope,/\{count\} photos/);assert.match(T.en.resetScope,/Original files stay on disk/);assert.match(T.ja.resetScope,/写真\{count\}枚/);
});

test('stale Reset Undo action cannot undo an unrelated later edit and is removed when that edit commits',()=>{
 const h=historyHarness();h.resetEditor();const stale=h.getToast(),before=h.captureHistoryState();h.state.gap=30;h.commitHistory(before);assert.equal(h.getToast(),null);const history=h.undoStack.length;stale.onAction();assert.equal(h.state.gap,30);assert.equal(h.undoStack.length,history);assert(h.hides()>0);
});

test('language adapter preserves in-flight import identity, stage and photos while translating prerequisites',()=>{
 const h=exportHarness(),job={generation:8};h.setImport(job);h.state.phase='loading';const stateBefore=h.captureHistoryState();h.state.lang='ja';h.applyLanguage();assert.deepEqual(h.captureHistoryState(),stateBefore);assert.equal(h.state.phase,'loading');assert.equal(h.getImport(),job);assert.equal(h.els.exportButton.disabled,true);assert.equal(h.els.exportPrerequisite.textContent,T.ja.exportWaitImport);
});

test('real finish/export render adapters retain blank numeric drafts and user filenames on translation',()=>{
 const h=exportHarness();h.state.exportLongSideKey='custom';h.state.canvasRatioKey='custom';h.els.customLongSide.value='3';h.els.customRatioWidth.value='';h.els.customRatioHeight.value='9';h.els.backgroundHex.value='#ff';h.els.outputFilename.value='旅行.png';
 const inputs=[h.els.customLongSide,h.els.customRatioWidth,h.els.customRatioHeight,h.els.backgroundHex,h.els.outputFilename],values=inputs.map(x=>x.value);h.state.lang='ja';
 // The production helper obtains live fields from document.querySelectorAll.
 h.document.querySelectorAll=selector=>selector==='input,textarea,select'?inputs:[];
 h.applyLanguage();assert.deepEqual(inputs.map(x=>x.value),values);assert.equal(h.state.customLongSide,2160);assert.equal(h.state.customRatioWidth,4);
});
