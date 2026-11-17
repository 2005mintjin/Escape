import './ending/style.css';
import {EndingExperience} from './ending/experience.js';
import './style.css';
import './ui/graphicsStatus.css';
import {graphicsStatus} from './ui/graphicsStatus.js';
import './ui/tutorial.css';
import {tutorialUI} from './ui/tutorial.js';
import './ui/cinematic.css';
import {cinematicOverlay} from './ui/cinematic.js';
import {RunAudio} from './audio/runAudio.js';
import './ui/theme.css';
import './intro/style.css';
import {IntroExperience} from './intro/experience.js';
import {BattlefieldAmbience} from './audio/sceneAudio.js';
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
const runningAudio=new RunAudio();const ambience=new BattlefieldAmbience();const voices=new Voices();const siren=new Siren();const music=new Music();const updateMusicControl=musicControl(music);
addEventListener('pointerdown',()=>{if(game.state!=='title')music.unlock();ambience.unlock();runningAudio.unlock();siren.unlock();},{capture:true});
const game=new Game(),world=new World(document.querySelector('canvas')),input=new Input();game.state='title';const updatePauseControl=pauseControl(game);const effects=new Effects();world.ready.catch(error=>{console.error(error);game.message='캐릭터 이미지를 불러오지 못했습니다. 새로고침하세요';});
const updateCinematic=cinematicOverlay(game);
const intro=new IntroExperience(world.renderer,(options={})=>{input.clear();touch.clear();if(!options.skipTutorial)game.startTutorial();game.state='playing';document.body.classList.remove('intro-title');world.renderer.setClearColor(game.level.palette);world.draw(game,0);updateUI(game,world,onMenu);});intro.ready.catch(error=>{intro.loadError=error;console.error(error);intro.ui.nodes['home-loading'].textContent='집 안 이미지를 불러오지 못했습니다. 새로고침해 주세요.';});
let endingDone=false;
const ending=new EndingExperience(world.renderer,intro.war,()=>{game.state='clear';updateUI(game,world,onMenu);});
function beginEnding(){if(game.state==='clear'&&game.stageIndex===2&&!game.inTutorial&&!endingDone){endingDone=true;input.clear();touch.clear();game.projectiles=[];game.state='ending';ending.start();return true;}return false;}
function onMenu(action){ending.stop();endingDone=false;runningAudio.unlock();voices.unlock();ambience.unlock();input.clear();touch.clear();if(action==='intro'){game.startCampaign();game.state='intro';document.body.classList.remove('intro-title');intro.start();music.update(game.state,document.hidden,intro.story);music.unlock();}else{document.body.classList.remove('intro-title');if(action==='next')game.nextStage();else if(action==='campaign')game.startCampaign();else game.reset();world.renderer.setClearColor(game.level.palette);music.update(game.state,document.hidden);music.unlock();}}
function point(x,y){world.setPointer(x,y);if(game.player.aiming)game.player.direction=x>=world.screen(game.player).x?1:-1;const c=document.querySelector('#crosshair');c.style.left=x+'px';c.style.top=y+'px';}
function attack(x,y){if(intro.active)return;voices.unlock();game.stance(input);game.player.direction=x>=world.screen(game.player).x?1:-1;const target=world.aim(x,y);if(target&&game.shoot(target,world.visibleGuards(game.enemies))){world.kick();}}
addEventListener('pointermove',event=>{if(event.pointerType==='mouse')point(event.clientX,event.clientY);});
addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.target.id==='world'&&event.button===0)attack(event.clientX,event.clientY);});
const touch=new TouchControls(input,{canvas:document.querySelector('#world'),game,point,attack,unlock:()=>voices.unlock()});
const updateTutorialUI=tutorialUI(game,{world,restart:()=>onMenu('restart'),skip:()=>onMenu('campaign')});
addEventListener('keydown',e=>{if(e.repeat)return;if(ending.active){if(['KeyE','Enter','Space'].includes(e.code)){e.preventDefault();ending.story.next();}if(e.code==='Escape'){e.preventDefault();ending.pause();}return;}if(intro.active){if(['KeyE','Enter','Space'].includes(e.code)){e.preventDefault();intro.interact();}if(e.code==='Escape'){e.preventDefault();intro.pause();}return;}if(e.code==='Digit1')game.selectWeapon('rifle');if(e.code==='Digit2')game.selectWeapon('pistol');if(e.code==='KeyQ'&&game.state==='playing'){e.preventDefault();game.dash(input);}if(e.code==='KeyF'&&game.state==='playing'){e.preventDefault();game.stance(input);game.knife();}if(e.code==='KeyR')game.reload();if(e.code==='Escape'){if(game.state==='playing')game.state='paused';else if(game.state==='paused')game.state='playing';document.querySelector('#menu').dataset.state='';}});
let lastWheelSwitch=-Infinity;document.querySelector('#world').addEventListener('wheel',e=>{if(game.state!=='playing')return;e.preventDefault();const now=performance.now();if(e.deltaY&&now-lastWheelSwitch>180){game.toggleWeapon();lastWheelSwitch=now;}},{passive:false});
function pauseOnLeave(){if(ending.active)ending.pause(true);input.clear();touch.clear();if(intro.active&&!intro.story.paused)intro.pause();if(game.state==='playing')game.state='paused';}
addEventListener('blur',pauseOnLeave);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseOnLeave();music.update(game.state,document.hidden,intro.active?intro.story:ending.active?ending.story:null);siren.update(game,document.hidden);ambience.update(game.state,document.hidden);runningAudio.update(game,document.hidden);});

let frameError=null;const updateGraphicsStatus=graphicsStatus({canvas:document.querySelector('#world'),renderer:world.renderer,pause:pauseOnLeave,skip:()=>intro.skip(),issue:()=>frameError?{error:frameError}:intro.active&&intro.loadError?{error:intro.loadError,canSkip:!world.loadError}:!intro.active&&game.state!=='title'&&world.loadError?{error:world.loadError}:null});
let last=performance.now();function loop(now){requestAnimationFrame(loop);if(frameError){updateGraphicsStatus();return;}try{const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(elapsed,.05);last=now;updateTutorialUI();updateCinematic();runningAudio.update(game,document.hidden);music.update(game.state,document.hidden,intro.active?intro.story:ending.active?ending.story:null);updateMusicControl();updatePauseControl();touch.update();ambience.update(game.state,document.hidden);if(intro.active||game.state==='title'){voices.update(game);siren.update(game,document.hidden);effects.update(game);}
 if(updateGraphicsStatus())return;
 if(game.state==='ending'){ending.update(elapsed);return;}
 if(intro.active){intro.warAudio.music.muted=!music.enabled;intro.update(dt,input,elapsed);return;}
 if(game.state==='title'){document.body.classList.add('intro-title');updateUI(game,world,onMenu);return;}
 document.body.classList.remove('intro-title');if(!world.loading)game.update(dt,input);if(beginEnding()){voices.update(game);siren.update(game,document.hidden);effects.update(game);ambience.update(game.state,document.hidden);runningAudio.update(game,document.hidden);ending.update(0);return;}voices.update(game);siren.update(game,document.hidden);effects.update(game);ambience.update(game.state,document.hidden);runningAudio.update(game,document.hidden);world.renderer.setClearColor(game.level.palette);world.draw(game,dt);updateUI(game,world,onMenu);
}catch(error){frameError=error;pauseOnLeave();updateGraphicsStatus();console.error(error);}}requestAnimationFrame(loop);
