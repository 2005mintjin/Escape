import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:1});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5173');await page.getByRole('button',{name:'작전 시작'}).tap();
 const root=page.locator('#touch-controls');await expect(root).toBeVisible();
 await page.getByRole('button',{name:'앉기 전환'}).tap();
 // Direct touch aims without firing. Separate attack button enters the held aim stance.
 await page.touchscreen.tap(600,140);await page.getByRole('button',{name:'공격',exact:true}).tap();await expect(page.locator('footer strong')).toHaveText('05',{timeout:20000});
 await page.getByRole('button',{name:'재장전',exact:true}).tap();await expect(page.locator('footer strong')).toHaveText('06',{timeout:15000});
 await page.getByRole('button',{name:'무기 전환'}).tap();await expect(page.locator('footer small')).toHaveText('칼 · 클릭으로 기습');await page.getByRole('button',{name:'무기 전환'}).tap();
 await expect(page.getByRole('button',{name:'앉기 전환'})).toHaveAttribute('aria-pressed','true');
 const cdp=await context.newCDPSession(page);const right=await page.getByRole('button',{name:'오른쪽 이동'}).boundingBox(),run=await page.getByRole('button',{name:'달리기',exact:true}).boundingBox();
 const fingers=[{x:right.x+right.width/2,y:right.y+right.height/2,id:1},{x:run.x+run.width/2,y:run.y+run.height/2,id:2}];
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:fingers});await page.waitForTimeout(400);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.match(await page.locator('.status small').textContent(),/4.0/,'crouch blocks sprint drain');
 await page.getByRole('button',{name:'앉기 전환'}).tap();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:fingers});await page.waitForTimeout(650);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await page.getByRole('button',{name:'앉기 전환'}).tap();await expect(root.locator('.held')).toHaveCount(0);assert.doesNotMatch(await page.locator('.status small').textContent(),/4.0/,'two-finger running consumes stamina');
 await page.getByRole('button',{name:'터치 일시정지'}).tap();await expect(page.getByRole('button',{name:'작전 계속하기'})).toBeVisible();await expect(root).toBeHidden();await page.getByRole('button',{name:'작전 계속하기'}).tap();await expect(root).toBeVisible();
 await page.setViewportSize({width:390,height:844});await expect(root).toBeVisible();for(const label of ['오른쪽 이동','공격','앉기 전환','무기 전환','재장전']){const box=await page.getByRole('button',{name:label,exact:true}).boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=391&&box.y+box.height<=845,label+' fits portrait');}
 await page.screenshot({path:'test-results/mobile-portrait.png'});await page.setViewportSize({width:844,height:390});await page.screenshot({path:'test-results/mobile-landscape.png'});assert.deepEqual(errors,[]);console.log('PASS: mobile touch aim/fire/reload, weapon/crouch toggles, two-finger sprint, cancellation, pause/resume, portrait/landscape bounds');
}finally{await browser.close();}
