import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const url=process.env.SITE_URL||'http://127.0.0.1:4173/Escape/';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});const page=await context.newPage();const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failed.push(r.url());});
 await page.goto(url);await page.waitForLoadState('networkidle');await page.getByRole('button',{name:'작전 시작'}).click();await expect(page.locator('#menu section')).toHaveCount(0,{timeout:15000});
 if(mobile){await page.getByRole('button',{name:'앉기 전환'}).tap();await page.getByRole('button',{name:'공격',exact:true}).tap();}
 else{await page.keyboard.down('KeyS');await page.keyboard.down('Shift');await page.mouse.click(650,300);await page.keyboard.up('Shift');}
 await expect(page.locator('footer strong')).toHaveText('05',{timeout:20000});
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name));assert.ok(resources.some(r=>r.includes('/Escape/sprites/player.png')),'sprite uses project base');assert.ok(resources.some(r=>r.includes('/Escape/environment/materials.png')),'environment uses project base');
 for(const file of ['audio/radio.mp3','audio/player-shot.mp3','audio/enemy-shot.mp3','audio/reload.mp3']){const response=await context.request.get(new URL(file,url).href);assert.equal(response.status(),200,file);assert.ok((await response.body()).length>1000);}
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await context.close();
}console.log('PASS: production /Escape/ site on desktop and touch, sprites/environment/audio paths, firing, no failed assets');}finally{await browser.close();}
