import * as THREE from 'three';
import {EnemyDeathClock} from './enemyAnimation.js';
import config from '../../data/gameConfig.json' with {type:'json'};
import {isRadioActive} from '../systems/guardResponse.js';
import {setupNightLighting,tintCharacter} from './nightLighting.js';
import {buildEnvironment} from './environment.js';
import {createProjectileView} from './projectileView.js';
import {inLight} from '../systems/stageObjects.js';
import {levels} from '../levels/campaign.js';
import {createStageView,disposeStage} from './stageView.js';
import definitions from '../../data/enemies.json' with {type:'json'};
import {playerAnimation,animationIndex,isFiring} from './animation.js';
import {loadCharacters,makeSprite,applyFrame} from './sprites.js';
export class World{
 constructor(canvas){this.enemyDeathClock=new EnemyDeathClock();const mobile=matchMedia('(pointer:coarse)').matches;this.renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile});this.renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:2));this.renderer.setClearColor('#0b121e');this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(config.camera.fov,1,.1,150);this.stageId=null;this.stageRoot=null;
 this.player=makeSprite();this.scene.add(this.player);this.enemies=Array.from({length:definitions.length},()=>{const sprite=makeSprite();this.scene.add(sprite);return sprite;});this.ready=Promise.all([loadCharacters(),this.loadLevel(levels[0])]).then(([bank])=>{this.characters=bank;this.player.visible=true;this.enemies.forEach(sprite=>sprite.visible=true);});this.projectileView=createProjectileView(this.scene);this.cameraX=2;this.pointer={x:0,y:0};this.pan={x:0,y:0};this.shake=0;this.resize();window.addEventListener('resize',()=>this.resize());}
 async loadLevel(level){
 this.stageId=level.id;if(this.stageRoot){this.scene.remove(this.stageRoot);disposeStage(this.stageRoot);}const root=new THREE.Group();this.stageRoot=root;this.scene.add(root);this.renderer.setClearColor(level.palette);this.scene.fog=new THREE.Fog(level.palette,24,94);setupNightLighting(root);this.stageView=createStageView(root,level);this.loading=true;
 await buildEnvironment(root,level);if(this.stageRoot===root)this.loading=false;else disposeStage(root);
 }
 resize(){this.renderer.setSize(innerWidth,innerHeight);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();}
 aim(x,y){const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),this.camera);return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),3),new THREE.Vector3());}
 kick(){this.shake=.22;}
 setPointer(x,y){this.pointer.x=Math.max(-1,Math.min(1,x/innerWidth*2-1));this.pointer.y=Math.max(-1,Math.min(1,1-y/innerHeight*2));}
 visibleGuards(enemies){const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse));return enemies.filter(e=>!e.dead&&frustum.intersectsBox(new THREE.Box3(new THREE.Vector3(e.x-.6,0,e.z),new THREE.Vector3(e.x+.6,2.25,e.z))));}
 screen(entity,height=2.6){const p=new THREE.Vector3(entity.x,height,entity.z).project(this.camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};}
 draw(game,dt){if(game.level&&game.level.id!==this.stageId){this.cameraX=game.player.x;this.pan={x:0,y:0};this.stageReady=this.loadLevel(game.level).catch(error=>console.error(error));}if(game.level&&game.level.id===this.stageId)this.stageView?.update(game);this.enemies.forEach((sprite,i)=>sprite.visible=!!this.characters&&i<game.enemies.length);this.cameraX+=(game.player.x-this.cameraX)*(1-Math.exp(-dt*5));if(game.state==='playing'){this.pan.x+=(this.pointer.x*1.6-this.pan.x)*(1-Math.exp(-dt*4));this.pan.y+=(this.pointer.y*.55-this.pan.y)*(1-Math.exp(-dt*4));}this.shake=Math.max(0,this.shake-dt);const kick=this.shake*Math.sin(this.shake*190)*.35;this.camera.position.set(this.cameraX+this.pan.x+kick,config.camera.height+this.pan.y+kick*.6,config.camera.distance);this.camera.lookAt(this.cameraX+this.pan.x,config.camera.lookHeight+this.pan.y,config.camera.lookDepth);this.camera.updateMatrixWorld();const p=game.player;this.player.position.set(p.x,0,p.z);const animation=playerAnimation(p);this.player.userData.animation=animation;if(this.characters){const frames=this.characters.player[animation];applyFrame(this.player,frames[animationIndex(p,game.time,frames.length)],p.direction===-1);}this.player.material.rotation=0;tintCharacter(this.player.material,p.x,p.weapon!=='pistol'&&isFiring(p)&&(p.shotDuration??3)-p.shot<.12,inLight(game)?1:.2);
 game.enemies.forEach((e,i)=>{const s=this.enemies[i];s.position.set(e.x,0,e.z);s.material.rotation=0;if(e.dead&&this.characters){const frames=this.characters.player.enemyDeath;applyFrame(s,frames[this.enemyDeathClock.frame(e,game.time,frames.length)],e.direction===-1);s.userData.animation='death';tintCharacter(s.material,e.x);return;}this.enemyDeathClock.alive(e);if(this.characters){const moving=e.state==='Patrol'||e.state==='Investigate';const row=e.state==='Radio'||e.state==='Alert'||e.state==='Attack'?2:e.direction===-1?1:0;const frames=this.characters.enemy[row];const frame=moving?Math.floor(game.time*7)%frames.length:e.state==='Radio'?2:e.state==='Attack'?5:e.state==='Alert'?4:0;if((isRadioActive(e)||e.state==='Radio')&&!e.dead&&this.characters.player.enemyRadio){const radio=this.characters.player.enemyRadio;applyFrame(s,radio[Math.floor(game.time*4)%radio.length],e.direction===-1);s.userData.animation='radio';}else{applyFrame(s,frames[frame]);s.userData.animation=e.state.toLowerCase();}}s.material.rotation=0;tintCharacter(s.material,e.x);});
 this.projectileView.update(game.projectiles);this.renderer.render(this.scene,this.camera);}
}
