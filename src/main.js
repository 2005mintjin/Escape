import './style.css';
import {Game} from './core/game.js';
import {World} from './rendering/world.js';
import {Input} from './core/input.js';
import {updateUI} from './ui/interface.js';
const game=new Game(),world=new World(document.querySelector('canvas')),input=new Input();game.state='title';let audio;
function sound(){audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sawtooth';o.frequency.setValueAtTime(110,audio.currentTime);o.frequency.exponentialRampToValueAtTime(30,audio.currentTime+.13);g.gain.setValueAtTime(.12,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.15);}
addEventListener('mousemove',e=>{const c=document.querySelector('#crosshair');c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';});
addEventListener('mousedown',e=>{if(e.target.tagName!=='CANVAS'||e.button!==0)return;const target=world.aim(e.clientX,e.clientY);if(target&&game.shoot(target))sound();});
addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyR')game.reload();if(e.code==='Escape'){if(game.state==='playing')game.state='paused';else if(game.state==='paused')game.state='playing';document.querySelector('#menu').dataset.state='';}});
addEventListener('blur',()=>{if(game.state==='playing')game.state='paused';});
let last=performance.now();function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;game.update(dt,input);world.draw(game,dt);updateUI(game,world,()=>game.reset());requestAnimationFrame(loop);}requestAnimationFrame(loop);
