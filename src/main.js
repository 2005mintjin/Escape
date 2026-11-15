import './style.css';
import './ui/theme.css';
import {Music} from './audio/music.js';
import {musicControl} from './ui/musicControl.js';
import {Effects} from './audio/effects.js';
import {Voices} from './audio/voices.js';
import {Game} from './core/game.js';
import {World} from './rendering/world.js';
import {Input} from './core/input.js';
import {TouchControls} from './ui/touchControls.js';
import {updateUI} from './ui/interface.js';
const voices=new Voices();const music=new Music();const updateMusicControl=musicControl(music);
addEventListener('pointerdown',()=>music.unlock(),{once:true,capture:true});
const game=new Game(),world=new World(document.querySelector('canvas')),input=new Input();game.state='title';const effects=new Effects();world.ready.catch(error=>{console.error(error);game.message='캐릭터 이미지를 불러오지 못했습니다. 새로고침하세요';});
function point(x,y){world.setPointer(x,y);if(game.player.aiming)game.player.direction=x>=world.screen(game.player).x?1:-1;const c=document.querySelector('#crosshair');c.style.left=x+'px';c.style.top=y+'px';}
function attack(x,y){voices.unlock();game.stance(input);game.player.direction=x>=world.screen(game.player).x?1:-1;if(game.player.weapon==='knife'){game.knife();voices.update(game);return;}const target=world.aim(x,y);if(target&&game.shoot(target,world.visibleGuards(game.enemies))){world.kick();effects.play('player');}}
addEventListener('pointermove',event=>{if(event.pointerType==='mouse')point(event.clientX,event.clientY);});
addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.target.id==='world'&&event.button===0)attack(event.clientX,event.clientY);});
const touch=new TouchControls(input,{canvas:document.querySelector('#world'),game,point,attack,unlock:()=>voices.unlock()});
addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyR')game.reload();if(e.code==='Escape'){if(game.state==='playing')game.state='paused';else if(game.state==='paused')game.state='playing';document.querySelector('#menu').dataset.state='';}});
function pauseOnLeave(){input.clear();touch.clear();if(game.state==='playing')game.state='paused';}
addEventListener('blur',pauseOnLeave);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseOnLeave();music.update(game.state,document.hidden);});
document.querySelector('canvas').addEventListener('wheel',e=>{e.preventDefault();if(e.deltaY!==0)game.switchWeapon();},{passive:false});
let last=performance.now();function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;music.update(game.state,document.hidden);updateMusicControl();touch.update();game.update(dt,input);voices.update(game);effects.update(game);world.draw(game,dt);updateUI(game,world,()=>{music.unlock();voices.unlock();input.clear();touch.clear();game.reset();});requestAnimationFrame(loop);}requestAnimationFrame(loop);
