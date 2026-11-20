'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const evidence=path.resolve('test-results/photo-collage-smoke');
const url=pathToFileURL(path.resolve(__dirname,'../dist/index.html')).href;
const fixturesCount=19;

async function fixtures(page,count=fixturesCount){
  const images=await page.evaluate(count=>Array.from({length:count},(_,i)=>{
    const c=document.createElement('canvas');c.width=480;c.height=320;
    const ctx=c.getContext('2d');const fill=(color,x=0,y=0,w=480,h=320)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
    const circle=(color,x,y,r)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()};
    if(i%6===0){fill('#5cbed0');fill('#1d7894',0,105,480,110);fill('#e5cc8b',0,215,480,105);ctx.strokeStyle='#fff0cf';ctx.lineWidth=7;ctx.beginPath();ctx.arc(240,135,65,.12,Math.PI-.12);ctx.stroke()}
    else if(i%6===1){fill('#874b36');circle('#f6dfbc',240,160,128);circle('#cb593d',240,160,84);circle('#f6dfbc',240,160,48);circle('#f1b95e',240,160,22)}
    else if(i%6===2){fill('#245f43');circle('#eed17b',435,70,47);ctx.fillStyle='#d2e5d7';ctx.beginPath();ctx.moveTo(0,260);ctx.lineTo(105,92);ctx.lineTo(232,246);ctx.lineTo(360,80);ctx.lineTo(480,200);ctx.lineTo(480,320);ctx.lineTo(0,320);ctx.fill()}
    else if(i%6===3){fill('#385676');for(let j=0;j<8;j++){const h=115+(j*43)%170;fill('#d4e0e7',j*60+8,320-h,43,h);for(let k=0;k<8;k++)fill('#f5df94',j*60+16,320-h+14+k*23,6,9)}}
    else if(i%6===4){fill('#255c3b');for(let j=0;j<8;j++){const x=j*66+15;fill('#675039',x,195,11,125);ctx.fillStyle=j%2?'#528d4e':'#3b7c45';ctx.beginPath();ctx.moveTo(x-35,250);ctx.lineTo(x+5,38+(j%3)*25);ctx.lineTo(x+47,250);ctx.closePath();ctx.fill()}}
    else{fill('#6c5179');circle('#e4bd9b',250,115,83);ctx.strokeStyle='#714b47';ctx.lineWidth=5;ctx.beginPath();ctx.arc(250,158,38,.15,Math.PI-.15);ctx.stroke();fill('#d6d8df',180,225,140,95)}
    
    return c.toDataURL('image/png').split(',')[1];
  }),count);
  return images.map((base64,i)=>({name:'sample-'+String(i+1).padStart(2,'0')+'.png',mimeType:'image/png',buffer:Buffer.from(base64,'base64')}));
}
async function countPhotos(page,count){
  await page.waitForFunction(expected=>document.querySelectorAll('#photoGrid .photo-card').length===expected,count,{timeout:30000});
}
async function enterLanguage(page,language){
  if(await page.locator('html').getAttribute('lang')!==language)await page.locator('#languageButton').click();
  assert.equal(await page.locator('html').getAttribute('lang'),language);
}
async function takeScreenshots(browser){
  for(const [width,height,kind] of [[1440,1120,''],[390,844,'-mobile']]){
    const context=await browser.newContext({viewport:{width,height},locale:'ja',acceptDownloads:true,reducedMotion:'reduce'});
    const page=await context.newPage();const errors=[],requests=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url())});
    try{
      await page.goto(url);const images=await fixtures(page,6);
      await page.locator('#fileInput').setInputFiles(images);await countPhotos(page,6);
      // Show the compact photo list in README phone screenshots; desktop shows the collage editor.
      // Omit transient success toast from the documentation screenshots.
      await page.locator('#appToast').evaluate(el=>{el.style.display='none'});
      for(const language of ['ja','en']){
        await enterLanguage(page,language);
        const name='screenshot'+kind+(language==='en'?'-en':'')+'.png';
        await page.screenshot({path:path.join(evidence,name),animations:'disabled'});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,name+': overflow');
      }
      assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
    }finally{await context.close()}
  }
}
async function runEditingAndSave(browser){
  const context=await browser.newContext({viewport:{width:1280,height:900},locale:'ja',acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
  try{
    await page.goto(url);const images=await fixtures(page,3);
    await page.locator('#fileInput').setInputFiles(images.slice(0,2));await countPhotos(page,2);
    await page.locator('[data-format="png"]').click();
    await page.evaluate(()=>{
      const actual=window.createImageBitmap;
      if(typeof actual!=='function')throw new Error('Chromium bitmap decoder missing');
      window.createImageBitmap=async (...args)=>{await new Promise(resolve=>setTimeout(resolve,350));return actual(...args)};
    });
    const downloading=page.waitForEvent('download',{timeout:45000});
    await page.locator('#exportButton').click();
    await page.waitForFunction(()=>document.body.dataset.exporting==='true',{timeout:10000});
    assert.equal(await page.locator('#exportButton').isDisabled(),true);
    assert.equal(await page.locator('#layoutPage').evaluate(el=>el.inert),true);
    assert.equal(await page.locator('.export-grid').evaluate(el=>el.inert),true);
    await page.locator('#photoGrid .danger-icon-button').first().evaluate(el=>el.click());
    assert.equal(await page.locator('#photoGrid .photo-card').count(),2,'remove during export must be blocked');
    const download=await downloading;assert.match(download.suggestedFilename(),/\.png$/);
    const location=await download.path();const bytes=fs.readFileSync(location);
    assert(bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')));
    assert(bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0&&bytes.length>1000);
    await page.waitForFunction(()=>document.body.dataset.exporting==='false');
    assert.equal(await page.locator('#layoutPage').evaluate(el=>el.inert),false);
    assert.equal(await page.locator('#exportResult').isVisible(),true);
    await page.locator('#gapRange').evaluate(el=>{el.value='14';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
    assert.equal(await page.locator('#exportResult').isVisible(),false,'old save result must clear after edits');
    await page.locator('#fileInput').setInputFiles({name:'damaged.jpg',mimeType:'image/jpeg',buffer:Buffer.from('corrupt')});
    await page.locator('#failedFiles').waitFor({state:'visible'});
    assert.match(await page.locator('#statusText').innerText(),/読み込/);
    await enterLanguage(page,'en');assert.match(await page.locator('#statusText').innerText(),/could not/i);
    assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  }finally{await context.close()}
}
async function runCapacity(browser){
  const context=await browser.newContext({viewport:{width:390,height:844},locale:'ja',acceptDownloads:true});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(url);
    const images=await fixtures(page);
    await page.locator('#fileInput').setInputFiles(images);await countPhotos(page,19);
    await page.locator('#fileInput').setInputFiles([
      {name:'broken.jpg',mimeType:'image/jpeg',buffer:Buffer.from('invalid')},
      {name:'valid-last.png',mimeType:'image/png',buffer:images[0].buffer},
      {name:'skipped.png',mimeType:'image/png',buffer:images[1].buffer}
    ]);
    await countPhotos(page,20);
    assert.equal(await page.locator('#failedFiles li').count(),1);
    assert.match(await page.locator('#statusText').innerText(),/残り1枚/);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]);
  }finally{await context.close()}
}
async function runMobileWorkflow(browser){
  const context=await browser.newContext({viewport:{width:320,height:740},locale:'ja',hasTouch:true,acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url())});
  try{
    await page.goto(url);
    assert.equal(await page.locator('#heroTitle').isVisible(),false,'mobile hero title hidden');
    assert.equal(await page.locator('.privacy-badge').isVisible(),false,'mobile privacy badge hidden');
    assert.equal(await page.locator('.input-note').count(),0,'unnecessary session notice removed');
    assert.equal((await page.locator('#chooseButton span').innerText()).trim(),'写真を選択');
    assert.equal(await page.locator('#addMoreButton').count(),0);
    assert.equal(await page.locator('.input-panel .panel-head').isVisible(),false,'mobile picker must not repeat a section heading');
    assert.equal(await page.locator('.mobile-drop-label').isVisible(),false,'mobile Add photos label must be hidden');
    const pickerStyle=await page.locator('#fileFallbackButton').evaluate(el=>{
      const css=getComputedStyle(el),bounds=el.getBoundingClientRect();
      return {borderWidth:css.borderTopWidth,decoration:css.textDecorationLine,
        background:css.backgroundColor,height:bounds.height,width:bounds.width};
    });
    assert.equal(pickerStyle.borderWidth,'0px','secondary file picker should not have a card-like outline');
    assert.match(pickerStyle.decoration,/underline/,'secondary file picker should look like a text link');
    assert(pickerStyle.height>=44,'file picker must keep a smartphone-sized tap target');
    const pickerLayout=async()=>page.evaluate(()=>{
      const main=document.getElementById('chooseButton').getBoundingClientRect();
      const link=document.getElementById('fileFallbackButton').getBoundingClientRect();
      const drop=document.getElementById('dropZone');
      return {mainBottom:main.bottom,linkTop:link.top,mainCenter:main.left+main.width/2,
        linkCenter:link.left+link.width/2,dropBorder:getComputedStyle(drop).borderTopStyle};
    });
    const emptyPicker=await pickerLayout();
    assert.equal(await page.locator('.drop-zone-icon').isVisible(),true,'empty mobile picker keeps the desktop-style photo icon');
    assert.equal(emptyPicker.dropBorder,'dashed','empty mobile picker keeps the subtle drop-area outline');
    assert(emptyPicker.linkTop>=emptyPicker.mainBottom+6,'file link sits below the primary button');
    assert(Math.abs(emptyPicker.mainCenter-emptyPicker.linkCenter)<=2,'mobile picker controls are centered, not side by side');
    const emptyHeight=await page.locator('.input-panel').evaluate(el=>el.getBoundingClientRect().height);
    const images=await fixtures(page,5);
    await page.locator('#fileInput').setInputFiles(images.slice(0,4));await countPhotos(page,4);
    const loadedHeight=await page.locator('.input-panel').evaluate(el=>el.getBoundingClientRect().height);
    assert.equal((await page.locator('#chooseButton span').innerText()).trim(),'写真を追加');
    assert(loadedHeight<emptyHeight&&loadedHeight<=160,`photo upload bar should become compact after loading: ${loadedHeight} vs ${emptyHeight}`);
    const loadedPicker=await pickerLayout();
    assert(loadedPicker.linkTop>=loadedPicker.mainBottom+6,'file link remains below Add photos after importing');
    assert(Math.abs(loadedPicker.mainCenter-loadedPicker.linkCenter)<=2,'loaded mobile picker remains centered');
    assert.equal(await page.locator('.drop-zone-icon').isVisible(),false,'icon is hidden after importing to keep the bar compact');
    assert.equal(await page.locator('.mobile-drop-label').isVisible(),false,'duplicate label remains hidden after importing');
    assert.equal(await page.locator('.input-panel .panel-head').isVisible(),false,'mobile heading remains hidden after importing');
    const gridColumns=await page.locator('#photoGrid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
    assert.equal(gridColumns,2,'even 320px wide phone must show two photo columns');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('#appToast').evaluate(el=>{el.style.display='none'});
    await page.screenshot({path:path.join(evidence,'mobile-photos-ja.png'),animations:'disabled'});
    const initial=await page.locator('#photoGrid .photo-card').evaluateAll(els=>els.map(el=>el.dataset.photoId));
    const drag=page.locator('#photoGrid .photo-card').first().locator('.drag-handle');
    const target=page.locator('#photoGrid .photo-card').nth(3);
    await drag.scrollIntoViewIfNeeded();
    const from=await drag.boundingBox(),to=await target.boundingBox();
    assert(from&&to,'drag elements must be visible');
    await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();
    await page.mouse.move(to.x+to.width*.8,to.y+to.height*.7,{steps:12});
    const mid=await page.locator('#photoGrid .photo-card').evaluateAll(els=>els.map(el=>el.dataset.photoId));
    assert.notDeepEqual(mid,initial,'cards must move before releasing drag');
    assert.equal(await page.locator('.photo-reorder-ghost').count(),1);
    await page.screenshot({path:path.join(evidence,'mobile-photos-drag.png'),animations:'disabled'});
    await page.mouse.up();
    const after=await page.locator('#photoGrid .photo-card').evaluateAll(els=>els.map(el=>el.dataset.photoId));
    assert.deepEqual(after,mid,'drag release must commit live card order');
    assert.equal(await page.locator('.photo-reorder-ghost').count(),0,'ghost must be cleaned up');
    assert.equal(await page.locator('#historyMenuButton').count(),0,'mobile History control must be removed entirely');
    assert.equal(await page.locator('#historyToolbar').isVisible(),false,'desktop history controls must be hidden on phone');
    assert.equal(await page.locator('#appMobileBottomBar .app-mobile-bottom-item').count(),4,'exactly four mobile navigation actions');
    const deletedName=await page.locator('#photoGrid .photo-card').first().locator('.photo-name').innerText();
    const remove=page.locator('#photoGrid .photo-card').first().locator('.danger-icon-button');
    await remove.click();assert.equal(await page.locator('#removePhotoDialog').isVisible(),true);
    assert.equal(await page.locator('#photoGrid .photo-card').count(),4);
    await page.locator('#cancelRemovePhotoButton').click();
    assert.equal(await page.locator('#removePhotoDialog').isVisible(),false);
    assert.equal(await page.locator('#photoGrid .photo-card').count(),4,'cancel must preserve photo');
    await remove.click();
    assert.equal(await page.locator('#removePhotoDescription').textContent().then(t=>t.includes(deletedName)),true);
    await page.locator('#cancelRemovePhotoButton').click();
    await page.locator('#languageButton').click();
    assert.equal((await page.locator('#chooseButton span').innerText()).trim(),'Add photos','added-photo label must translate to English');
    await remove.click();
    assert.match(await page.locator('#removePhotoDescription').textContent(),/Remove/);
    await page.locator('#confirmRemovePhotoButton').click();await countPhotos(page,3);
    assert.equal(await page.locator('#appToastAction').isVisible(),false,'delete toast cannot expose Undo on mobile');
    assert.equal(await page.locator('#historyToolbar').isVisible(),false,'no history popup after deleting');
    // The text link must still open the native file picker after importing.
    const fileChooserPromise=page.waitForEvent('filechooser');
    await page.locator('#fileFallbackButton').click();
    const fileChooser=await fileChooserPromise;
    await fileChooser.setFiles(images.slice(4));await countPhotos(page,4);
    await page.evaluate(async()=>{
      const canvas=document.createElement('canvas');canvas.width=160;canvas.height=100;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#16624f';ctx.fillRect(0,0,160,100);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      const transfer=new DataTransfer();transfer.items.add(new File([blob],'dropped-after-import.png',{type:'image/png'}));
      document.getElementById('dropZone').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));
    });
    await countPhotos(page,5);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.locator('#appMobileBottomBar .app-mobile-bottom-item').count(),4,'four workflow pages only');
    assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  }finally{await context.close()}
}

async function runDesktopEditorLayout(browser){
  const context=await browser.newContext({viewport:{width:1360,height:860},locale:'ja',acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(url);
    assert.equal(await page.locator('#addMoreButton').count(),0,'no duplicate Add Photos action in photo list');
    assert.equal((await page.locator('#chooseButton span').innerText()).trim(),'写真を選択','initial import label');
    const images=await fixtures(page,5);
    await page.locator('#fileInput').setInputFiles(images);
    await countPhotos(page,5);
    assert.equal((await page.locator('#chooseButton span').innerText()).trim(),'写真を追加','button label changes after first import');
    await page.waitForFunction(()=>document.querySelector('#layoutPicker:not([hidden])'));
    const desktop=await page.evaluate(()=>{
      const rect=id=>document.getElementById(id).getBoundingClientRect(),a=rect('adjustPanel'),b=rect('layoutPicker'),c=rect('finishPanel'),d=rect('exportPanel'),p=rect('previewStage'),h=document.querySelector('.header-inner').getBoundingClientRect(),main=rect('workspace'),head=document.querySelector('.header-inner');
      const headerContentX=h.left+parseFloat(getComputedStyle(head).paddingLeft);
      const mainEl=document.querySelector('.main'),mainContentX=mainEl.getBoundingClientRect().left+parseFloat(getComputedStyle(mainEl).paddingLeft);
      return {editLeft:[a.left,b.left,c.left],editRight:[a.right,b.right,c.right],previewLeft:p.left,previewBottom:p.bottom,exportTop:d.top,exportLeft:d.left,exportHost:document.getElementById('desktopExportHost').contains(document.getElementById('exportPanel')),previewColumnRight:document.getElementById('content-panel')?.getBoundingClientRect().right,headerContentX,mainContentX,historyInPreview:document.querySelector('.preview-head').contains(document.getElementById('historyToolbar')),headerPosition:getComputedStyle(document.querySelector('.app-header')).position,editorHost:document.querySelector('#desktopEditorControls').contains(document.getElementById('finishPanel')),bodyOverflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.equal(desktop.editorHost,true,'desktop controls use the real moved nodes');
    assert.equal(desktop.historyInPreview,true,'desktop history toolbar belongs beside the preview title');
    assert.equal(desktop.headerPosition,'relative','global header must scroll away rather than stick');
    assert(desktop.editRight.every(right=>right<desktop.previewLeft),'photo, layout and finish controls stay left of the preview');
    assert.equal(desktop.exportHost,true,'export form is hosted below preview on desktop');
    assert(desktop.exportLeft>=desktop.previewLeft-24,'export settings align with preview column');
    assert(desktop.exportTop>desktop.previewBottom,'export settings follow the preview');
    assert(Math.abs(desktop.headerContentX-desktop.mainContentX)<2,'header and body edges must align');
    assert.equal(desktop.bodyOverflow,false,'no desktop horizontal overflow');
    const stickyInitial=await page.evaluate(()=>({
      previewTop:document.querySelector('.content-panel').getBoundingClientRect().top,
      maxPageScroll:document.documentElement.scrollHeight-innerHeight
    }));
    assert(stickyInitial.maxPageScroll>300,'desktop editor should be long enough to test sticky preview');
    await page.evaluate(()=>window.scrollTo(0,280));
    const stickyScrolled=await page.evaluate(()=>({
      top:document.querySelector('.content-panel').getBoundingClientRect().top,
      scroll:window.scrollY,
      position:getComputedStyle(document.querySelector('.content-panel')).position
    }));
    assert(stickyScrolled.scroll>200,'desktop page should scroll normally');
    assert.equal(stickyScrolled.position,'sticky','preview column follows the page');
    assert(stickyScrolled.top>=8&&stickyScrolled.top<=24,'preview must remain pinned while scrolling the left editor');
    await page.evaluate(()=>window.scrollTo(0,0));
    const thumbs=await page.locator('#layoutOptions .layout-thumb').evaluateAll(nodes=>nodes.map(node=>({display:getComputedStyle(node).display,height:node.getBoundingClientRect().height,cells:node.querySelectorAll('.layout-thumb-cell').length})));
    assert.equal(thumbs.length,6);
    assert(thumbs.every(thumb=>thumb.display==='block'&&thumb.height>32&&thumb.cells===5),'layout options must show actual image-arrangement thumbnails');
    await page.locator('#appToast').evaluate(el=>{el.style.display='none'});
    await page.locator('#finishPanel').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(evidence,'desktop-finish-refined.png'),animations:'disabled'});
    assert.equal(await page.locator('#finishPanel').evaluate(el=>getComputedStyle(el).borderLeftWidth),'0px','settings do not add nested boxed panels');
    await page.locator('#exportPanel').scrollIntoViewIfNeeded();
    const saveForm=await page.evaluate(()=>{
      const fmt=document.getElementById('formatGrid').getBoundingClientRect();
      const res=document.getElementById('resolutionGrid').getBoundingClientRect();
      const column=document.querySelector('.content-panel');
      const host=document.getElementById('desktopExportHost');
      const action=document.getElementById('exportButton').getBoundingClientRect();
      return {formatHeight:fmt.height,resolutionHeight:res.height,formatTop:fmt.top,resolutionTop:res.top,
        columnPosition:getComputedStyle(column).position,columnOverflow:getComputedStyle(column).overflowY,
        formOverflow:getComputedStyle(host).overflowY,formScrollSpace:host.scrollHeight-host.clientHeight,
        buttonWidth:action.width,pageScrollHeight:document.documentElement.scrollHeight};
    });
    assert(Math.abs(saveForm.formatHeight-saveForm.resolutionHeight)<=1,'format and resolution selectors must be the same height');
    assert(Math.abs(saveForm.formatTop-saveForm.resolutionTop)<=1,'desktop selector controls must align at the top');
    assert.equal(saveForm.columnPosition,'sticky','preview must stay pinned on desktop');
    assert.equal(saveForm.columnOverflow,'hidden','preview itself should never scroll away');
    assert.equal(saveForm.formOverflow,'auto','only the save settings can scroll inside the preview column');
    assert(saveForm.formScrollSpace>=0,'save settings retain a valid independent scroll range');
    assert(saveForm.pageScrollHeight>860,'desktop page remains normally scrollable');
    const previewBeforeSaveScroll=await page.locator('#previewStage').boundingBox();
    await page.locator('#exportButton').scrollIntoViewIfNeeded();
    const previewAfterSaveScroll=await page.locator('#previewStage').boundingBox();
    assert(Math.abs(previewAfterSaveScroll.y-previewBeforeSaveScroll.y)<=2,'scrolling the save controls must not move the preview');
    let exportRect=await page.locator('#exportButton').boundingBox();
    assert(exportRect&&exportRect.y>=0&&exportRect.y+exportRect.height<=860,'desktop Save must be fully visible');
    await page.screenshot({path:path.join(evidence,'desktop-save-refined.png'),animations:'disabled'});
    await page.setViewportSize({width:1024,height:680});
    await page.locator('#exportButton').scrollIntoViewIfNeeded();
    exportRect=await page.locator('#exportButton').boundingBox();
    assert(exportRect&&exportRect.y>=0&&exportRect.y+exportRect.height<=680,'laptop viewport must not clip Save');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'laptop viewport must not overflow horizontally');
    await page.setViewportSize({width:1024,height:560});
    const compactForm=await page.evaluate(()=>{
      const host=document.getElementById('desktopExportHost'),preview=document.getElementById('previewStage');
      return {scrollSpace:host.scrollHeight-host.clientHeight,previewY:preview.getBoundingClientRect().y};
    });
    assert(compactForm.scrollSpace>0,'short desktop viewport should scroll Save settings without moving the preview');
    await page.locator('#exportButton').scrollIntoViewIfNeeded();
    const compactSave=await page.locator('#exportButton').boundingBox();
    const compactPreview=await page.locator('#previewStage').boundingBox();
    assert(compactSave&&compactSave.y>=0&&compactSave.y+compactSave.height<=560,'short desktop must show the complete Save button');
    assert(Math.abs(compactPreview.y-compactForm.previewY)<=2,'preview must stay fixed when Save settings scroll on short desktops');
    await page.setViewportSize({width:1360,height:860});
    await page.locator('[data-ratio-key="9:16"]').click();
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'true');
    await page.setViewportSize({width:390,height:844});
    await page.waitForFunction(()=>document.querySelector('#layoutPage')?.contains(document.getElementById('adjustPanel')));
    assert.equal(await page.locator('.privacy-badge').isVisible(),false);
    assert.equal(await page.locator('#heroTitle').isVisible(),false);
    assert.equal(await page.locator('#historyMenuButton').count(),0,'no mobile history entry');
    assert.equal(await page.locator('#historyToolbar').isVisible(),false,'desktop history toolbar hidden in phone workflow');
    assert.equal(await page.locator('#appMobileBottomBar .app-mobile-bottom-item').count(),4);
    await page.locator('[data-mobile-key="finish"]').click();
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'true','viewport switch keeps settings');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no mobile horizontal overflow');
    await page.screenshot({path:path.join(evidence,'mobile-finish-refined.png'),animations:'disabled'});
    await page.locator('[data-mobile-key="save"]').click();
    assert.equal(await page.locator('#savePage').evaluate(el=>el.contains(document.getElementById('exportPanel'))),true,'mobile Save page keeps original export form');
    assert.equal(await page.locator('[data-mobile-key="save"] span').innerText(),'画像を保存','active Save tab becomes the export action');
    assert.equal(await page.locator('#exportButton').isVisible(),false,'hidden duplicate export action on mobile');
    assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(document.querySelector('.app-header')).position),'relative');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:path.join(evidence,'mobile-save-refined.png'),animations:'disabled'});
    await page.locator('[data-format="png"]').click();
    const saving=page.waitForEvent('download',{timeout:45000});
    await page.locator('[data-mobile-key="save"]').click();
    const downloaded=await saving;
    assert.match(downloaded.suggestedFilename(),/\.png$/,'footer Save action must download the selected format');
    assert((await page.locator('[data-mobile-key="save"] span').innerText()).includes('保存'),'button returns to Save image after completion');
    await page.setViewportSize({width:1360,height:860});
    await page.waitForFunction(()=>document.getElementById('desktopEditorControls').contains(document.getElementById('finishPanel')));
    assert.equal(await page.locator('#desktopExportHost').evaluate(el=>el.contains(document.getElementById('exportPanel'))),true,'desktop export host restores after resize');
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'true','settings survive restoration');
    assert.equal(await page.locator('#historyToolbar').isVisible(),true,'desktop history controls return after resize');
    await page.locator('#undoButton').click();
    assert.equal(await page.locator('[data-format="jpeg"]').getAttribute('aria-pressed'),'true','desktop Undo restores previous JPEG output format');
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'true','output format Undo must not change the canvas ratio');
    await page.locator('#undoButton').click();
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'false','second desktop Undo restores previous canvas ratio');
    await page.locator('#redoButton').click();
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'true','first Redo reapplies the canvas ratio');
    await page.locator('#redoButton').click();
    assert.equal(await page.locator('[data-format="png"]').getAttribute('aria-pressed'),'true','second Redo reapplies PNG output format');
    await page.locator('#resetButton').click();
    assert.equal(await page.locator('#resetDialog').isVisible(),true,'desktop Start over asks for confirmation');
    await page.locator('#cancelResetButton').click();
    assert.equal(await page.locator('#photoGrid .photo-card').count(),5,'cancel Reset preserves photos');
    assert.deepEqual(errors,[]);
  }finally{await context.close()}
}

async function runExportFormats(browser){
  const context=await browser.newContext({viewport:{width:1200,height:880},locale:'en',acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
  try{
    await page.goto(url);
    const images=await fixtures(page,2);
    await page.locator('#fileInput').setInputFiles(images);await countPhotos(page,2);
    await page.locator('[data-long-side="1080"]').click();
    await page.locator('#outputFilename').fill('release-quality');
    for(const {key,ext} of [{key:'jpeg',ext:'jpg'},{key:'webp',ext:'webp'}]){
      await page.locator('[data-format="'+key+'"]').click();
      const wait=page.waitForEvent('download',{timeout:45000});
      await page.locator('#exportButton').click();
      const download=await wait;
      assert.equal(download.suggestedFilename(),'release-quality.'+ext);
      const bytes=fs.readFileSync(await download.path());
      assert(bytes.length>1200,key+': output not empty');
      if(key==='jpeg')assert(bytes.subarray(0,3).equals(Buffer.from('ffd8ff','hex')),'JPEG magic');
      if(key==='webp')assert.equal(bytes.toString('ascii',0,4)+':'+bytes.toString('ascii',8,12),'RIFF:WEBP','WebP magic');
      const size=await page.evaluate(async base64=>{
        const data=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
        const bitmap=await createImageBitmap(new Blob([data]));const dimensions={width:bitmap.width,height:bitmap.height};bitmap.close();return dimensions;
      },bytes.toString('base64'));
      assert.deepEqual(size,{width:1080,height:810},key+': exported image dimensions');
      await page.waitForFunction(()=>document.body.dataset.exporting==='false');
    }
    assert.deepEqual(errors,[]);
    assert.deepEqual(requests,[],'local image export must not make external HTTP requests');
  }finally{await context.close()}
}
async function runSelfExtractFile(browser){
  const selfUrl=pathToFileURL(path.resolve(__dirname,'../dist/index.self-extract.html')).href;
  const context=await browser.newContext({viewport:{width:390,height:780},locale:'ja',acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
  try{
    await page.goto(selfUrl);
    await page.locator('#fileInput').waitFor({timeout:30000});
    const images=await fixtures(page,2);
    await page.locator('#fileInput').setInputFiles(images);await countPhotos(page,2);
    assert.equal(await page.locator('#appMobileBottomBar .app-mobile-bottom-item').count(),4);
    await page.locator('[data-mobile-key="save"]').click();
    const saving=page.waitForEvent('download',{timeout:45000});
    await page.locator('[data-mobile-key="save"]').click();
    const download=await saving;
    assert.match(download.suggestedFilename(),/\.(jpg|jpeg)$/);
    const bytes=fs.readFileSync(await download.path());
    assert(bytes.subarray(0,3).equals(Buffer.from('ffd8ff','hex')),'self-extract HTML JPEG download');
    assert.deepEqual(errors,[],'self-extracting file:// should have no errors');
    assert.deepEqual(requests,[],'self-extracting file:// should have no HTTP requests');
  }finally{await context.close()}
}
async function main(){
  fs.mkdirSync(evidence,{recursive:true});const browser=await chromium.launch();
  try{await takeScreenshots(browser);await runEditingAndSave(browser);await runCapacity(browser);await runMobileWorkflow(browser);await runDesktopEditorLayout(browser);await runExportFormats(browser);await runSelfExtractFile(browser)}
  finally{await browser.close()}
  console.log('[OK] Real-browser Photo Collage smoke: JA/EN, desktop/mobile, import limit, edit lock, JPEG/PNG/WebP downloads, self-extract file://, history visibility, stale result and localized errors');
  console.log('[INFO] Captured four current-UI screenshots in '+evidence);
}
main().catch(error=>{console.error(error);process.exitCode=1});
