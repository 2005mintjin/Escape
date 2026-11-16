import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5173');await page.getByRole('button',{name:'작전 시작'}).click();await page.keyboard.down('KeyS');await page.keyboard.down('KeyD');await page.waitForTimeout(500);await page.keyboard.up('KeyD');await page.keyboard.up('KeyS');await page.keyboard.press('Escape');await page.getByRole('button',{name:'작전 계속하기'}).click();
await page.keyboard.press('KeyF');await page.getByText('칼 공격 중',{exact:true}).waitFor();await page.getByText('소총 사거리 10m · R 재장전',{exact:true}).waitFor();
await page.mouse.click(700,350);await page.waitForTimeout(50);assert.equal(await page.locator('footer strong').textContent(),'06');
await page.keyboard.down('KeyS');await page.keyboard.down('Shift');await page.mouse.click(700,350);await page.waitForTimeout(50);await expect(page.locator('footer strong')).toHaveText('05',{timeout:15000});await page.keyboard.up('Shift');await page.keyboard.up('KeyS');
const audioResult=await page.evaluate(async()=>{const {Voices}=await import('/src/audio/voices.js');const v=new Voices(undefined,()=>0);v.unlock();const enemy={state:'Radio',radio:0,dead:false};const game={state:'playing',enemies:[enemy]};v.update(game);const channel=v.channels.get(enemy);await channel.audio.play();await new Promise(resolve=>setTimeout(resolve,100));if(channel.audio.paused||channel.audio.currentTime<=0)throw new Error('radio playback failed');const duration=channel.audio.duration;enemy.dead=true;v.update(game);if(!channel.audio.paused||channel.audio.currentTime!==0)throw new Error('radio not interrupted');return duration;});assert.ok(Math.abs(audioResult-3.3175)<.1);
const effectPlayback=await page.evaluate(async()=>{const {Effects}=await import('/src/audio/effects.js');const effects=new Effects();const result=[];for(const name of ['player','enemy','reload']){const sound=effects.play(name);await sound.play();await new Promise(resolve=>setTimeout(resolve,70));if(sound.paused||sound.currentTime<=0)throw new Error('MP3 playback failed: '+name);result.push(sound.duration);effects.stop();}return result;});assert.ok(effectPlayback.every(duration=>duration>0));
for(const size of [{width:1440,height:900},{width:800,height:600}]){await page.setViewportSize(size);const result=await page.evaluate(async()=>{const THREE=await import('/node_modules/.vite/deps/three.js');const {World}=await import('/src/rendering/world.js');const w=new World(document.createElement('canvas'));await w.ready;w.cameraX=15;w.draw({player:{x:15,z:3,crouch:false},enemies:[],tracers:[],time:0},1);const point=new THREE.Vector3(16,1.3,-3);const ndc=point.clone().project(w.camera);const aim=w.aim((ndc.x+1)*innerWidth/2,(1-ndc.y)*innerHeight/2);const error=aim.distanceTo(point);
const snapshot={state:'playing',player:{x:15,z:3,crouch:false},enemies:[],tracers:[],time:0};
const before=w.camera.position.clone();w.setPointer(innerWidth,0);w.draw(snapshot,.5);
if(w.camera.position.x<=before.x||w.camera.position.y<=before.y)throw new Error('mouse pan failed');
if(w.camera.position.z!==14.5||w.camera.position.y>3.7)throw new Error('camera height/zoom failed');
const near={x:15,z:-3},far={x:100,z:-3};const guards=w.visibleGuards([near,far]);
if(!guards.includes(near)||guards.includes(far))throw new Error('screen guard selection failed');
const shifted=point.clone().project(w.camera);const shiftedAim=w.aim((shifted.x+1)*innerWidth/2,(1-shifted.y)*innerHeight/2);
if(shiftedAim.distanceTo(point)>1e-6)throw new Error('panned aim failed');
for(const [name,stance] of Object.entries({idle:{},crouch:{crouch:true},walk:{moving:true},run:{moving:true,running:true},aim:{aiming:true},shoot:{shot:3},crouchWalk:{crouch:true,moving:true},death:{dead:true,deathElapsed:1}})){const actor={x:15,z:3,weapon:'rifle',...stance};w.draw({...snapshot,player:actor},0);if(w.player.userData.animation!==name||!w.player.material.map.image)throw new Error('sprite state failed: '+name);}
if(!w.enemies[0].material.map?.image) {const {Game}=await import('/src/core/game.js');w.draw(new Game(),0);}
if(w.enemies[0].material.map.image.width!==1774)throw new Error('enemy atlas failed');
const {applyFrame}=await import('/src/rendering/sprites.js');
for(const frames of Object.values(w.characters.player))for(const frame of frames)for(const flip of [false,true]){applyFrame(w.player,frame,flip);const [, ,width,height]=frame.rect;if(Math.abs(w.player.scale.x/width-w.player.scale.y/height)>1e-9)throw new Error('sprite aspect distortion');const texture=w.player.material.map;if(texture.offset.x+Math.min(0,texture.repeat.x)<0||texture.offset.x+Math.max(0,texture.repeat.x)>1.00001)throw new Error('UV bounds');}
let environmentParts=0;w.scene.traverse(item=>{if(item.userData.environment)environmentParts+=item.isInstancedMesh?item.count:1;});if(environmentParts<300)throw new Error('3D environment missing');
if(w.enemies.length!==6)throw new Error('guard sprites missing');
w.setPointer(innerWidth/2,innerHeight/2);w.pan={x:0,y:0};w.draw(snapshot,0);const still=w.camera.position.clone();w.kick();w.draw(snapshot,.02);
if(w.camera.position.distanceTo(still)<.001)throw new Error('shot shake missing');w.draw(snapshot,.3);
if(w.camera.position.distanceTo(still)>1e-6)throw new Error('shake did not settle');
const {Game}=await import('/src/core/game.js');const meleeGame=new Game();meleeGame.player.x=11.5;meleeGame.enemies[0].x=11.5;
if(!meleeGame.knife())throw new Error('melee did not start');meleeGame.update(.2,{axis:0,crouch:true});w.draw(meleeGame,.02);
if(!w.player.material.map?.image||!w.player.visible)throw new Error('character atlas missing');
w.renderer.dispose();return error;});assert.ok(result<1e-6,'aim projection matches on resize');}
await page.setViewportSize({width:1440,height:900});await page.screenshot({path:'/workspace/Escape/e2e/screenshot.png'});assert.deepEqual(errors,[]);await browser.close();console.log('PASS: WebGL startup, movement, crouch, pause/resume, two viewport aiming projections, no runtime errors');
