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
    const c=document.createElement('canvas');c.width=240;c.height=160;
    const ctx=c.getContext('2d'),colors=['#d5a154','#287c88','#637d58','#8e6072','#345f83','#d0b2aa'];
    ctx.fillStyle=colors[i%colors.length];ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(120,80,18+(i%4)*12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#243b34';ctx.fillRect(10,10,24+i%9*7,22);
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
      if(kind)await page.locator('[data-mobile-key="layout"]').click();
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
async function main(){
  fs.mkdirSync(evidence,{recursive:true});const browser=await chromium.launch();
  try{await takeScreenshots(browser);await runEditingAndSave(browser);await runCapacity(browser)}
  finally{await browser.close()}
  console.log('[OK] Real-browser Photo Collage smoke: JA/EN, desktop/mobile, import limit, edit lock, PNG download, stale result and localized errors');
  console.log('[INFO] Captured four current-UI screenshots in '+evidence);
}
main().catch(error=>{console.error(error);process.exitCode=1});
