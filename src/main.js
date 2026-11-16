import './style.css';
import './ui/theme.css';
import './intro/style.css';
import {IntroExperience} from './intro/experience.js';
import {Music} from './audio/music.js';
import {pauseControl} from './ui/pauseControl.js';
import {musicControl} from './ui/musicControl.js';
import {Siren} from './audio/siren.js';
import {Effects} from './audio/effects.js';
import {Voices} from './audio/voices.js';
import {Game} from './core/game.js';
import {World} from './rendering/world.js';
import {Input} from './core/input.js';
import {TouchControls} from './ui/touchControls.js';
import {updateUI} from './ui/interface.js';
const voices=new Voices();const siren=new Siren();const music=new Music();const updateMusicControl=musicControl(music);
addEventListener('pointerdown',()=>{music.unlock();siren.unlock();},{capture:true});
const game=new Game(),world=new World(document.querySelector('canvas')),input=new Input();game.state='title';const updatePauseControl=pauseControl(game);const effects=new Effects();world.ready.catch(error=>{console.error(error);game.message='캐릭터 이미지를 불러오지 못했습니다. 새로고침하세요';});
const intro=new IntroExperience(world.renderer,()=>{input.clear();touch.clear();game.state='playing';document.body.classList.remove('intro-title');world.renderer.setClearColor(game.level.palette);world.draw(game,0);updateUI(game,world,onMenu);});intro.ready.catch(error=>{console.error(error);intro.ui.nodes['home-loading'].textContent='집 안 이미지를 불러오지 못했습니다. 새로고침해 주세요.';});
function onMenu(action){music.unlock();voices.unlock();input.clear();touch.clear();if(action==='intro'){game.startCampaign();game.state='intro';document.body.classList.remove('intro-title');intro.start();}else{document.body.classList.remove('intro-title');if(action==='next')game.nextStage();else if(action==='campaign')game.startCampaign();else game.reset();world.renderer.setClearColor(game.level.palette);}}
function point(x,y){world.setPointer(x,y);if(game.player.aiming)game.player.direction=x>=world.screen(game.player).x?1:-1;const c=document.querySelector('#crosshair');c.style.left=x+'px';c.style.top=y+'px';}
function attack(x,y){if(intro.active)return;voices.unlock();game.stance(input);game.player.direction=x>=world.screen(game.player).x?1:-1;const target=world.aim(x,y);if(target&&game.shoot(target,world.visibleGuards(game.enemies))){world.kick();}}
addEventListener('pointermove',event=>{if(event.pointerType==='mouse')point(event.clientX,event.clientY);});
addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.target.id==='world'&&event.button===0)attack(event.clientX,event.clientY);});
const touch=new TouchControls(input,{canvas:document.querySelector('#world'),game,point,attack,unlock:()=>voices.unlock()});
addEventListener('keydown',e=>{if(e.repeat)return;if(intro.active){if(['KeyE','Enter','Space'].includes(e.code)){e.preventDefault();intro.interact();}if(e.code==='Escape'){e.preventDefault();intro.pause();}return;}if(e.code==='Digit1')game.selectWeapon('rifle');if(e.code==='Digit2')game.selectWeapon('pistol');if(e.code==='KeyQ'&&game.state==='playing'){e.preventDefault();game.dash(input);}if(e.code==='KeyF'&&game.state==='playing'){e.preventDefault();game.stance(input);game.knife();}if(e.code==='KeyR')game.reload();if(e.code==='Escape'){if(game.state==='playing')game.state='paused';else if(game.state==='paused')game.state='playing';document.querySelector('#menu').dataset.state='';}});
let lastWheelSwitch=-Infinity;document.querySelector('#world').addEventListener('wheel',e=>{if(game.state!=='playing')return;e.preventDefault();const now=performance.now();if(e.deltaY&&now-lastWheelSwitch>180){game.toggleWeapon();lastWheelSwitch=now;}},{passive:false});
function pauseOnLeave(){input.clear();touch.clear();if(intro.active&&!intro.story.paused)intro.pause();if(game.state==='playing')game.state='paused';}
addEventListener('blur',pauseOnLeave);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseOnLeave();music.update(game.state,document.hidden||intro.active);siren.update(game,document.hidden);});

let last=performance.now();function loop(now){const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;music.update(game.state,document.hidden||intro.active);updateMusicControl();updatePauseControl();touch.update();if(intro.active||game.state==='title'){voices.update(game);siren.update(game,document.hidden);effects.update(game);}
 if(intro.active){intro.update(dt,input);requestAnimationFrame(loop);return;}
 if(game.state==='title'){document.body.classList.add('intro-title');intro.preview(dt);updateUI(game,world,onMenu);requestAnimationFrame(loop);return;}
 document.body.classList.remove('intro-title');if(!world.loading)game.update(dt,input);voices.update(game);siren.update(game,document.hidden);effects.update(game);world.renderer.setClearColor(game.level.palette);world.draw(game,dt);updateUI(game,world,onMenu);requestAnimationFrame(loop);}requestAnimationFrame(loop);
