import {tutorialLevel} from '../levels/tutorial.js';
import {updateTutorial} from '../systems/tutorial.js';
import config from '../../data/gameConfig.json' with {type:'json'};
import {levels} from '../levels/campaign.js';
import {beginDash} from '../systems/dash.js';
import {nearbyPanel,exitOpen,exitEntry,inLight,inShadow,stageObjective,updateStageObjects} from '../systems/stageObjects.js';
import {level} from '../levels/level01.js';
import {visible,bodyPoint,advanceDetection} from '../systems/detection.js';
import {rally,radioStep,investigate,isRadioActive} from '../systems/guardResponse.js';
import {beginMelee,stepMelee} from '../systems/melee.js';
import {movePlayer} from '../systems/movement.js';
import {fireProjectile,updateProjectiles} from '../systems/projectiles.js';
export class Game {
 constructor(random=Math.random){this.random=random;this.stageIndex=0;this.pistolAmmo=config.pistol.rounds;this.stagePistolAmmo=this.pistolAmmo;this.reset();}
 reset(){this.pistolAmmo=this.stagePistolAmmo??config.pistol.rounds;this.level=this.inTutorial?tutorialLevel:levels[this.stageIndex];this.tutorial=this.inTutorial?{step:0,cover:0,complete:false}:null;this.lamps=this.level.lamps.map(l=>({...l,broken:false}));this.panels=this.level.panels.map(p=>({...p,active:false}));this.player={x:this.level.start,z:config.playerZ,crouch:false,aiming:false,weapon:'rifle',burst:null,dashCooldown:0,deathElapsed:0,health:config.playerHealth,hurt:0,stamina:config.staminaSeconds,exhausted:false,recoverDelay:0,direction:1,ammo:config.magazine,reserve:config.reserve,reload:0,shot:0,shotDuration:config.shotCooldown,lastShotWeapon:'rifle',knifeCooldown:0,melee:null,dead:false};this.enemies=this.level.guards.map(e=>({...e,z:config.enemyZ,state:e.training?'Idle':'Patrol',meter:0,detected:false,hasDetectionStarted:false,charging:false,notice:0,timer:0,idle:0,dead:false,radio:0,radioActive:false,radioClip:null,corpseTarget:null,searchTime:0}));this.extractionElapsed=0;this.extractionStartX=0;this.soundEvents=[];this.state='playing';this.lockdown=false;this.time=0;this.projectiles=[];this.message=this.level.brief;}
 startCampaign(){this.inTutorial=false;this.stageIndex=0;this.pistolAmmo=config.pistol.rounds;this.stagePistolAmmo=this.pistolAmmo;this.reset();}
 startTutorial(){this.inTutorial=true;this.stageIndex=0;this.stagePistolAmmo=this.pistolAmmo=config.pistol.rounds;this.reset();}
 nextStage(){if(this.inTutorial&&this.state==='clear'){this.startCampaign();return true;}if(this.state!=='clear'||this.stageIndex>=levels.length-1)return false;const weapon=this.player.weapon;this.stagePistolAmmo=this.pistolAmmo;this.stageIndex++;this.reset();this.player.weapon=weapon;return true;}
 selectWeapon(weapon){const p=this.player;if(this.state!=='playing'||!['rifle','pistol'].includes(weapon)||p.melee||p.burst||p.reload)return false;p.weapon=weapon;return true;}
 toggleWeapon(){return this.selectWeapon(this.player.weapon==='rifle'?'pistol':'rifle');}
 dash(input){return beginDash(this,input,config);}
 damagePlayer(){if(this.state!=='playing')return;const p=this.player;p.health=Math.max(0,p.health-1);p.hurt=.3;if(!p.health){p.dead=true;p.deathElapsed=0;this.state='dying';}}
 stance(input){this.player.crouch=this.player.burst?this.player.burst.rolling:this.player.melee?false:!!input.crouch;this.player.aiming=!this.player.burst&&!this.player.melee&&!!input.aim;}

 update(dt,input){if(this.state==='extracting'){this.extractionElapsed+=dt;this.time+=dt;this.player.x=this.extractionStartX+Math.min(1,this.extractionElapsed/.6)*1.4;this.player.moving=true;if(this.extractionElapsed+1e-9>=config.extractionSeconds){this.state='clear';this.nextStage();}return;}if(this.state==='dying'){this.player.deathElapsed+=dt;if(this.player.deathElapsed>=1)this.state='dead';return;}if(this.state!=='playing')return;this.time+=dt;const p=this.player;this.stance(input);p.hurt=Math.max(0,p.hurt-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);movePlayer(p,dt,input,{...config,length:this.level.length});p.shot=Math.max(0,p.shot-dt);p.knifeCooldown=Math.max(0,p.knifeCooldown-dt);stepMelee(this,dt,config,this.level.walls);
 if(p.reload>0){p.reload=Math.max(0,p.reload-dt);if(!p.reload){const n=Math.min(config.magazine-p.ammo,p.reserve);p.ammo+=n;p.reserve-=n;}}
 updateStageObjects(this);updateProjectiles(this,dt);updateTutorial(this,dt);if(p.dead)return;
 for(const e of this.enemies){if(e.dead||this.inTutorial)continue;if(inLight(this)&&Math.hypot(e.x-p.x,e.z-p.z)<=Math.min(config.lightAlertRange,e.range)){e.meter=1;e.detected=true;}const seen=visible(e,p,this.level.walls);
 const noticing=advanceDetection(e,seen,dt,inShadow(this)&&!this.lockdown?{...config,detectionSeconds:config.detectionSeconds*2.5}:config,this.lockdown,this.time);
 if(isRadioActive(e)){radioStep(this,e,dt,config,this.level.walls);continue;}
 if(noticing)continue;
 if(seen&&e.meter>0)e.direction=p.x>=e.x?1:-1;
 if(e.detected){
  if(e.state!=='Alert'&&e.state!=='Attack'){e.state='Alert';e.timer=config.reactionSeconds;}
  e.timer-=dt;
  if(e.timer<=0){e.state='Attack';e.timer=config.enemyShotInterval;const a={x:e.x,y:1.65,z:e.z},b=bodyPoint(p);
   if(Math.hypot(b.x-a.x,b.z-a.z)<=e.range){e.direction=p.x>=e.x?1:-1;fireProjectile(this,a,b,{enemy:true,speed:config.enemyBulletSpeed,range:e.range});
   }
  }
 }
 else if(radioStep(this,e,dt,config,this.level.walls)){}else if(investigate(e,dt,config)){}else if(e.meter>0){e.state='Suspicious';}else if(e.idle>0){e.idle-=dt;e.state='Idle';}else{e.state='Patrol';e.x+=e.direction*e.speed*dt;if(e.x>=e.max||e.x<=e.min){e.x=Math.max(e.min,Math.min(e.max,e.x));e.direction*=-1;e.idle=1.5;}}
 }
 if(p.x>=exitEntry(this)&&!p.dead){if(exitOpen(this)){this.state='extracting';this.extractionElapsed=0;this.extractionStartX=p.x;p.crouch=false;p.aiming=false;p.moving=true;p.running=false;this.soundEvents.push({key:'escape'});this.projectiles=[];p.burst=null;p.melee=null;}else{p.x=exitEntry(this)-.15;this.message=stageObjective(this);}}}
 knife(){return beginMelee(this,config,this.level.walls,nearbyPanel(this,config.knifeReach));}
 reload(){const p=this.player;if(this.state==='playing'&&p.weapon==='rifle'&&!p.melee&&!p.burst&&!p.reload&&p.ammo<config.magazine&&p.reserve)p.reload=config.reloadSeconds;}
 shoot(target,onscreen=[]){const p=this.player;if(this.state!=='playing'||!['rifle','pistol'].includes(p.weapon)||p.reload||p.melee||p.burst||p.shot>0)return false;if(!p.aiming){this.message='Shift를 누른 채 클릭하여 사격하세요';return false;}const silent=p.weapon==='pistol',ammo=silent?this.pistolAmmo:p.ammo;if(!ammo){this.message=silent?'소음 리볼버 탄약 소진 · 보충 불가':'R 키로 재장전';return false;}
 const stats=silent?config.pistol:{cooldown:config.shotCooldown,speed:config.playerBulletSpeed,range:config.weaponRange};
 if(silent)this.pistolAmmo--;else p.ammo--;p.shot=p.shotDuration=stats.cooldown;p.lastShotWeapon=p.weapon;
 fireProjectile(this,{x:p.x,y:1.65,z:p.z},target,{speed:stats.speed,range:stats.range});this.soundEvents.push({key:silent?'pistol':'player'});
 if(!silent&&!this.inTutorial)rally(this.enemies,onscreen,p.x,config.investigateSeconds);this.message=silent?'소음 사격 · 총성 집결 없음':'총성 · 화면 안 경비병이 사격 위치로 집결합니다';return true;}
}
export {config,level};
