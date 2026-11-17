import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile}),page=await context.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.route('**/src/main.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:await response.text()+'\nwindow.endingQA={game,world,ending,onMenu};'});});
 await page.goto('http://localhost:5173');await page.waitForFunction(()=>!!window.endingQA);await page.evaluate(()=>endingQA.onMenu('campaign'));
 await page.waitForFunction(()=>!endingQA.world.loading);
 const walk=await page.evaluate(()=>{const {game,world}=endingQA;game.player.weapon='pistol';game.player.moving=true;game.player.running=false;const maps=new Set();for(let i=0;i<6;i++){game.time=(i+.1)/7;world.draw(game,0);maps.add(world.player.material.map);}return maps.size;});assert.equal(walk,6);
 await page.evaluate(()=>{endingQA.game.state='clear';});await page.waitForTimeout(100);await expect(page.locator('#ending-ui')).toBeHidden();
 await page.evaluate(()=>{const {game}=endingQA;game.stageIndex=2;game.reset();game.state='extracting';game.extractionElapsed=2.5;game.extractionStartX=game.level.exit;});
 await expect(page.locator('#ending-ui')).toBeVisible();await page.waitForFunction(()=>endingQA.ending.loaded);await expect(page.locator('#ending-ui')).toHaveAttribute('data-shot','arrival');
 await page.getByRole('button',{name:'Ⅱ 일시정지',exact:true}).click();const t=await page.evaluate(()=>endingQA.ending.story.time);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>endingQA.ending.story.time),t);await page.getByRole('button',{name:'▶ 이어서 보기',exact:true}).click();
 await page.evaluate(()=>{endingQA.ending.story.index=1;endingQA.ending.story.elapsed=1;});await expect(page.locator('#ending-ui')).toHaveAttribute('data-shot','reunion');
 await page.screenshot({path:`test-results/ending-${mobile?'touch':'pc'}-reunion.png`});
 if(mobile){for(const size of [{width:844,height:390},{width:390,height:844}]){await page.setViewportSize(size);await page.waitForFunction(()=>{const b=document.querySelector('.ending-caption').getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.bottom<=innerHeight;});}}
 for(let i=0;i<20&&await page.evaluate(()=>endingQA.ending.story.active);i++){if(mobile)await page.getByRole('button',{name:'계속 · E ▷',exact:true}).tap();else await page.keyboard.press('Enter');}
 await expect(page.locator('#ending-ui')).toBeHidden();await expect(page.getByRole('heading',{name:'최종 탈출',exact:true})).toBeVisible();assert.equal(await page.evaluate(()=>endingQA.game.state),'clear');assert.deepEqual(errors,[]);console.log(`PASS: ${mobile?'touch':'PC'} walking six distinct frames, final-stage-only ending, reunion/rescue dialogue, pause, responsive captions, final clear`);await context.close();
}}finally{await browser.close();}
