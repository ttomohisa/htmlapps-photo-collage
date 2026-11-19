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
    const emptyHeight=await page.locator('.input-panel').evaluate(el=>el.getBoundingClientRect().height);
    const images=await fixtures(page,5);
    await page.locator('#fileInput').setInputFiles(images.slice(0,4));await countPhotos(page,4);
    const loadedHeight=await page.locator('.input-panel').evaluate(el=>el.getBoundingClientRect().height);
    assert(loadedHeight<emptyHeight&&loadedHeight<120,`drop target must shrink after import: ${loadedHeight} vs ${emptyHeight}`);
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
    assert.equal(await page.locator('#undoButton').isDisabled(),false);
    await page.locator('#undoButton').click();
    const restored=await page.locator('#photoGrid .photo-card').evaluateAll(els=>els.map(el=>el.dataset.photoId));
    assert.deepEqual(restored,initial,'reorder must undo in one step');
    const remove=page.locator('#photoGrid .photo-card').first().locator('.danger-icon-button');
    await remove.click();assert.equal(await page.locator('#removePhotoDialog').isVisible(),true);
    assert.equal(await page.locator('#photoGrid .photo-card').count(),4);
    await page.locator('#cancelRemovePhotoButton').click();
    assert.equal(await page.locator('#removePhotoDialog').isVisible(),false);
    assert.equal(await page.locator('#photoGrid .photo-card').count(),4,'cancel must preserve photo');
    await remove.click();
    assert.equal(await page.locator('#removePhotoDescription').textContent().then(t=>t.includes('sample-01.png')),true);
    await page.locator('#cancelRemovePhotoButton').click();
    await page.locator('#languageButton').click();
    await remove.click();
    assert.match(await page.locator('#removePhotoDescription').textContent(),/Remove/);
    await page.locator('#confirmRemovePhotoButton').click();await countPhotos(page,3);
    await page.locator('#undoButton').click();await countPhotos(page,4);
    // The compact bar still supports the fallback picker and direct file drops.
    await page.locator('#fileFallbackInput').setInputFiles(images.slice(4));await countPhotos(page,5);
    await page.evaluate(async()=>{
      const canvas=document.createElement('canvas');canvas.width=160;canvas.height=100;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#16624f';ctx.fillRect(0,0,160,100);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      const transfer=new DataTransfer();transfer.items.add(new File([blob],'dropped-after-import.png',{type:'image/png'}));
      document.getElementById('dropZone').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));
    });
    await countPhotos(page,6);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  }finally{await context.close()}
}

async function runDesktopEditorLayout(browser){
  const context=await browser.newContext({viewport:{width:1360,height:860},locale:'ja',acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(url);
    const images=await fixtures(page,5);
    await page.locator('#fileInput').setInputFiles(images);
    await countPhotos(page,5);
    await page.waitForFunction(()=>document.querySelector('#layoutPicker:not([hidden])'));
    const desktop=await page.evaluate(()=>{
      const rect=id=>document.getElementById(id).getBoundingClientRect(),a=rect('adjustPanel'),b=rect('layoutPicker'),c=rect('finishPanel'),d=rect('exportPanel'),p=rect('previewStage'),h=document.querySelector('.header-inner').getBoundingClientRect(),main=rect('workspace'),head=document.querySelector('.header-inner');
      const headerContentX=h.left+parseFloat(getComputedStyle(head).paddingLeft);
      const mainEl=document.querySelector('.main'),mainContentX=mainEl.getBoundingClientRect().left+parseFloat(getComputedStyle(mainEl).paddingLeft);
      return {editLeft:[a.left,b.left,c.left,d.left],editRight:[a.right,b.right,c.right,d.right],previewLeft:p.left,headerContentX,mainContentX,historyHeader:document.querySelector('.app-header').contains(document.getElementById('historyToolbar')),editorHost:document.querySelector('#desktopEditorControls').contains(document.getElementById('finishPanel')),bodyOverflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.equal(desktop.editorHost,true,'desktop controls use the real moved nodes');
    assert.equal(desktop.historyHeader,true,'history toolbar belongs in the header');
    assert(desktop.editRight.every(right=>right<desktop.previewLeft),'all editor sections are left of the preview');
    assert(Math.abs(desktop.headerContentX-desktop.mainContentX)<2,'header and body edges must align');
    assert.equal(desktop.bodyOverflow,false,'no desktop horizontal overflow');
    const before=await page.locator('#canvasRatioKey').count(); // selection remains on the existing ratio controls
    assert.equal(before,0);
    await page.locator('[data-ratio-key="9:16"]').click();
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'true');
    await page.setViewportSize({width:390,height:844});
    await page.waitForFunction(()=>document.querySelector('#layoutPage')?.contains(document.getElementById('adjustPanel')));
    assert.equal(await page.locator('.privacy-badge').isVisible(),false);
    assert.equal(await page.locator('#heroTitle').isVisible(),false);
    await page.locator('#historyMenuButton').click();
    assert.equal(await page.locator('#historyToolbar').isVisible(),true,'history actions open from the header');
    assert.equal(await page.locator('#historyMenuButton').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#historyToolbar').isVisible(),false);
    await page.locator('[data-mobile-key="finish"]').click();
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'true','viewport switch keeps settings');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no mobile horizontal overflow');
    await page.screenshot({path:path.join(evidence,'mobile-finish-refined.png'),animations:'disabled'});
    await page.locator('[data-mobile-key="save"]').click();
    await page.screenshot({path:path.join(evidence,'mobile-save-refined.png'),animations:'disabled'});
    await page.setViewportSize({width:1360,height:860});
    await page.waitForFunction(()=>document.getElementById('desktopEditorControls').contains(document.getElementById('finishPanel')));
    assert.equal(await page.locator('[data-ratio-key="9:16"]').getAttribute('aria-pressed'),'true','settings survive restoration');
    assert.deepEqual(errors,[]);
  }finally{await context.close()}
}
async function main(){
  fs.mkdirSync(evidence,{recursive:true});const browser=await chromium.launch();
  try{await takeScreenshots(browser);await runEditingAndSave(browser);await runCapacity(browser);await runMobileWorkflow(browser);await runDesktopEditorLayout(browser)}
  finally{await browser.close()}
  console.log('[OK] Real-browser Photo Collage smoke: JA/EN, desktop/mobile, import limit, edit lock, PNG download, stale result and localized errors');
  console.log('[INFO] Captured four current-UI screenshots in '+evidence);
}
main().catch(error=>{console.error(error);process.exitCode=1});
