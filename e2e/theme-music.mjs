import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
 await context.addInitScript(()=>{const Native=window.Audio;window.Audio=function(...args){const audio=new Native(...args);if(String(args[0]).includes('below-the-rafters'))window.testMusic=audio;return audio;};window.Audio.prototype=Native.prototype;});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5173');await page.waitForLoadState('networkidle');assert.equal(await page.evaluate(()=>window.testMusic.paused),true);
 await page.screenshot({path:`test-results/menu-${mobile?'mobile':'desktop'}.png`});
 await page.getByRole('button',{name:'전쟁 스테이지 바로 시작'}).click();await expect(page.locator('#menu section')).toHaveCount(0);await page.waitForFunction(()=>window.testMusic.currentTime>.05&&!window.testMusic.paused);assert.equal(await page.evaluate(()=>window.testMusic.loop),true);assert.equal(await page.evaluate(()=>window.testMusic.volume),.22);
 await page.getByRole('button',{name:'배경음악 전환'}).click();await page.waitForFunction(()=>window.testMusic.paused);await page.getByRole('button',{name:'배경음악 전환'}).click();await page.waitForFunction(()=>!window.testMusic.paused);
 if(mobile)await page.getByRole('button',{name:'터치 일시정지'}).tap();else await page.keyboard.press('Escape');await page.getByRole('button',{name:'작전 계속하기'}).waitFor();await page.waitForFunction(()=>window.testMusic.volume===.11);await page.screenshot({path:`test-results/pause-${mobile?'mobile':'desktop'}.png`});await page.getByRole('button',{name:'작전 계속하기'}).click();
 if(mobile){for(const size of [{width:844,height:390},{width:390,height:844}]){await page.setViewportSize(size);for(const label of ['공격','재장전','앉기 전환','배경음악 전환']){const box=await page.getByRole('button',{name:label,exact:true}).boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,label+' fits');}await page.screenshot({path:`test-results/hud-${size.width}.png`});}}
 else await page.screenshot({path:'test-results/hud-desktop.png'});assert.deepEqual(errors,[]);await context.close();
}console.log('PASS: desktop/mobile themed title/pause/HUD, real BGM playback/loop/mute/menu volume, responsive button bounds');}finally{await browser.close();}
