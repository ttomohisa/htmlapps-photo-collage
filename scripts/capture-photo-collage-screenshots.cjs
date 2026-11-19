'use strict';
// Screenshots are captured from the built, actual application in Chromium.
// Test photos are generated in the browser; no third-party images or requests.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const htmlPath=path.join(root,'dist','index.html');
const shots=[
  {lang:'ja',mobile:false,file:'screenshot.png'},
  {lang:'en',mobile:false,file:'screenshot-en.png'},
  {lang:'ja',mobile:true,file:'screenshot-mobile.png'},
  {lang:'en',mobile:true,file:'screenshot-mobile-en.png'}
];
function emitArtifact(key,p){
  if(process.env.BK_EXPORT_LOG_ASSETS!=='1')return;
  const base64=fs.readFileSync(p).toString('base64');
  console.log('BK_ARTIFACT_START '+key);
  for(let i=0;i<base64.length;i+=3000)console.log('BK_ARTIFACT_CHUNK '+key+' '+base64.slice(i,i+3000));
  console.log('BK_ARTIFACT_END '+key);
}
async function createFixtures(page){
  const samples=await page.evaluate(()=>{
    const palette=[
      ['#2b6572','#8bd2d6','#fde5b2'],['#9c4f39','#f8dcc3','#efa58c'],
      ['#34644d','#9cceb1','#ffe2a5'],['#3f5879','#9eb7e2','#fff0b0'],
      ['#355a49','#72a077','#c6d8a0'],['#735875','#e5b39c','#f8e1c6']
    ];
    return palette.map(([background,main,accent],i)=>{
      const canvas=document.createElement('canvas');canvas.width=650;canvas.height=480;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle=background;ctx.fillRect(0,0,650,480);
      if(i===0){ // beach
        ctx.fillStyle=main;ctx.fillRect(0,170,650,190);
        ctx.fillStyle=accent;ctx.fillRect(0,360,650,120);
        ctx.strokeStyle='#fff8d3';ctx.lineWidth=9;ctx.beginPath();ctx.arc(310,200,95,.1,Math.PI-.1);ctx.stroke();
      }else if(i===1){ // pottery
        ctx.fillStyle=accent;ctx.beginPath();ctx.arc(330,240,180,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=main;ctx.beginPath();ctx.arc(330,240,115,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=background;ctx.beginPath();ctx.arc(330,240,49,0,Math.PI*2);ctx.fill();
      }else if(i===2){ // mountains
        ctx.fillStyle=main;ctx.beginPath();ctx.moveTo(0,360);ctx.lineTo(130,150);ctx.lineTo(320,350);ctx.lineTo(520,90);ctx.lineTo(650,250);ctx.lineTo(650,480);ctx.lineTo(0,480);ctx.fill();
        ctx.fillStyle=accent;ctx.beginPath();ctx.arc(600,60,45,0,Math.PI*2);ctx.fill();
      }else if(i===3){ // city
        for(let n=0;n<8;n++){const w=55,h=85+(n*47)%230,x=n*83+8;ctx.fillStyle=main;ctx.fillRect(x,480-h,w,h);ctx.fillStyle=accent;for(let y=480-h+16;y<475;y+=33){ctx.fillRect(x+13,y,7,12);ctx.fillRect(x+35,y,7,12)}}
      }else if(i===4){ // forest
        for(let n=0;n<7;n++){const x=n*99+23,h=170+(n*47)%125;ctx.fillStyle=main;ctx.beginPath();ctx.moveTo(x,480-h);ctx.lineTo(x-52,430);ctx.lineTo(x+52,430);ctx.fill();ctx.fillStyle='#4d392b';ctx.fillRect(x-5,430,10,50)}
      }else{ // portrait silhouette
        ctx.fillStyle=main;ctx.beginPath();ctx.ellipse(310,190,130,142,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=accent;ctx.fillRect(210,305,210,175);ctx.strokeStyle=background;ctx.lineWidth=6;ctx.beginPath();ctx.arc(310,197,58,.1,Math.PI-.1);ctx.stroke();
      }
      return canvas.toDataURL('image/png').split(',')[1];
    });
  });
  return samples.map((base64,i)=>({name:'scene-'+(i+1)+'.png',mimeType:'image/png',buffer:Buffer.from(base64,'base64')}));
}
async function main(){
  assert(fs.existsSync(htmlPath),'Built HTML not found');
  const dir=path.join(root,'assets'),browser=await chromium.launch({headless:true});
  try{
    for(const {lang,mobile,file} of shots){
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1120},locale:lang,reducedMotion:'reduce',deviceScaleFactor:1,hasTouch:mobile});
      const page=await context.newPage(),errors=[],requests=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('request',r=>{if(/^https?:/i.test(r.url()))requests.push(r.url())});
      await page.goto(pathToFileURL(htmlPath).href);
      const version=await page.locator('#versionBadge').innerText();
      assert.equal(version.trim(),'v1.0.2');
      const fixtures=await createFixtures(page);
      await page.locator('#fileInput').setInputFiles(fixtures);
      await page.waitForFunction(()=>document.querySelectorAll('.photo-card').length===6&&!document.querySelector('#previewCanvas').hidden,{timeout:45000});
      if(await page.locator('html').getAttribute('lang')!==lang)await page.locator('#languageButton').click();
      if(mobile){await page.locator('[data-mobile-key="layout"]').click();await page.waitForFunction(()=>document.body.dataset.mobilePage==='layout');}
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow: '+file);
      assert.deepEqual(errors,[],'browser errors: '+file);
      assert.deepEqual(requests,[],'runtime HTTP requests: '+file);
      const filePath=path.join(dir,file);
      await page.screenshot({path:filePath,animations:'disabled'});
      const stats=fs.statSync(filePath);assert(stats.size>12000,'Screenshot unexpectedly empty: '+file);
      console.log('[OK] screenshot',file,stats.size+' bytes');
      await context.close();
    }
    emitArtifact('root-html',path.join(root,'photo-collage.html'));
    for(const shot of shots)emitArtifact(shot.file,path.join(dir,shot.file));
  }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1});
