import config from '../../data/gameConfig.json' with {type:'json'};
import {levels} from '../levels/campaign.js';
import {beginDash} from '../systems/dash.js';
import {nearbyPanel,closestShotTarget,exitOpen,exitEntry,inLight,inShadow,stageObjective,updateStageObjects} from '../systems/stageObjects.js';
import {level} from '../levels/level01.js';
import {visible,bodyPoint,advanceDetection} from '../systems/detection.js';
import {rally,radioStep,investigate} from '../systems/guardResponse.js';
import {beginMelee,stepMelee} from '../systems/melee.js';
import {movePlayer} from '../systems/movement.js';
import {blocked} from '../systems/collision.js';
export class Game {
 constructor(random=Math.random){this.random=random;this.stageIndex=0;this.reset();}
 reset(){this.level=levels[this.stageIndex];this.lamps=this.level.lamps.map(l=>({...l,broken:false}));this.panels=this.level.panels.map(p=>({...p,active:false}));this.player={x:this.level.start,z:config.playerZ,crouch:false,aiming:false,weapon:'rifle',burst:null,dashCooldown:0,deathElapsed:0,health:config.playerHealth,hurt:0,stamina:config.staminaSeconds,exhausted:false,recoverDelay:0,direction:1,ammo:config.magazine,reserve:config.reserve,reload:0,shot:0,knifeCooldown:0,melee:null,dead:false};this.enemies=this.level.guards.map(e=>({...e,z:config.enemyZ,state:'Patrol',meter:0,detected:false,hasDetectionStarted:false,charging:false,notice:0,timer:0,idle:0,dead:false,radio:0,radioClip:null,corpseTarget:null,searchTime:0}));this.extractionElapsed=0;this.soundEvents=[];this.state='playing';this.lockdown=false;this.time=0;this.tracers=[];this.message=this.level.brief;}
 startCampaign(){this.stageIndex=0;this.reset();}
 nextStage(){if(this.state!=='clear'||this.stageIndex>=levels.length-1)return false;this.stageIndex++;this.reset();return true;}
 dash(input){return beginDash(this,input,config);}
 damagePlayer(){if(this.state!=='playing')return;const p=this.player;p.health=Math.max(0,p.health-1);p.hurt=.3;if(!p.health){p.dead=true;p.deathElapsed=0;this.state='dying';}}
 stance(input){this.player.crouch=this.player.burst?this.player.burst.rolling:this.player.melee?false:!!input.crouch;this.player.aiming=!this.player.burst&&!this.player.melee&&!!input.aim;}

 update(dt,input){if(this.state==='extracting'){this.extractionElapsed+=dt;if(this.extractionElapsed+1e-9>=config.extractionSeconds)this.state='clear';return;}if(this.state==='dying'){this.player.deathElapsed+=dt;if(this.player.deathElapsed>=1)this.state='dead';return;}if(this.state!=='playing')return;this.time+=dt;const p=this.player;this.stance(input);p.hurt=Math.max(0,p.hurt-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);movePlayer(p,dt,input,{...config,length:this.level.length});p.shot=Math.max(0,p.shot-dt);p.knifeCooldown=Math.max(0,p.knifeCooldown-dt);stepMelee(this,dt,config,this.level.walls);
 if(p.reload>0){p.reload=Math.max(0,p.reload-dt);if(!p.reload){const n=Math.min(config.magazine-p.ammo,p.reserve);p.ammo+=n;p.reserve-=n;}}
 updateStageObjects(this);this.tracers=this.tracers.filter(t=>(t.life-=dt)>0);
 for(const e of this.enemies){if(e.dead)continue;const seen=visible(e,p,this.level.walls);
 if(advanceDetection(e,seen,dt,{...config,detectionSeconds:config.detectionSeconds*(inLight(this)?config.litDetectionMultiplier:inShadow(this)?2.5:1),alertDetectionSeconds:config.alertDetectionSeconds*(inLight(this)?config.litDetectionMultiplier:1)},this.lockdown,this.time))continue;
 if(seen&&e.meter>0)e.direction=p.x>=e.x?1:-1;
 if(e.detected){
  if(e.state!=='Alert'&&e.state!=='Attack'){e.state='Alert';e.timer=config.reactionSeconds;}
  e.timer-=dt;
  if(e.timer<=0){e.state='Attack';e.timer=config.enemyShotInterval;const a={x:e.x,y:1.65,z:e.z},b=bodyPoint(p);
   if(Math.hypot(b.x-a.x,b.z-a.z)<=e.range){e.direction=p.x>=e.x?1:-1;this.tracers.push({a,b,life:.2,enemy:true});
    this.damagePlayer();if(p.dead)break;
   }
  }
 }
 else if(radioStep(this,e,dt,config,this.level.walls)){}else if(investigate(e,dt,config)){}else if(e.meter>0){e.state='Suspicious';}else if(e.idle>0){e.idle-=dt;e.state='Idle';}else{e.state='Patrol';e.x+=e.direction*e.speed*dt;if(e.x>=e.max||e.x<=e.min){e.x=Math.max(e.min,Math.min(e.max,e.x));e.direction*=-1;e.idle=1.5;}}
 }
 if(p.x>=exitEntry(this)&&!p.dead){if(exitOpen(this)){this.state='extracting';this.extractionElapsed=0;this.soundEvents.push({key:'escape'});p.burst=null;p.melee=null;}else{p.x=exitEntry(this)-.15;this.message=stageObjective(this);}}}
 knife(){return beginMelee(this,config,this.level.walls,nearbyPanel(this,config.knifeReach));}
 reload(){const p=this.player;if(this.state==='playing'&&!p.melee&&!p.burst&&!p.reload&&p.ammo<config.magazine&&p.reserve)p.reload=config.reloadSeconds;}
 shoot(target,onscreen=[]){const p=this.player;if(this.state!=='playing'||p.weapon!=='rifle'||p.reload||p.melee||p.burst||p.shot>0)return false;if(!p.aiming){this.message='Shift를 누른 채 클릭하여 사격하세요';return false;}if(!p.ammo){this.message='R 키로 재장전';return false;}p.ammo--;p.shot=config.shotCooldown;const a={x:p.x,y:1.65,z:p.z};let b={...target};const distance=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
 if(distance>config.weaponRange){const scale=config.weaponRange/distance;b={x:a.x+(b.x-a.x)*scale,y:a.y+(b.y-a.y)*scale,z:a.z+(b.z-a.z)*scale};}let hit=null;
 const targetHit=closestShotTarget(this,a,b);
 if(targetHit&&!blocked(a,targetHit.point,this.level.walls)){b=targetHit.point;if(targetHit.kind==='enemy'){hit=targetHit.object;hit.dead=true;hit.state='Dead';hit.deathTime=this.time;}else{targetHit.object.broken=true;this.soundEvents.push({key:'light'});this.message='감시등 파괴 · 어둠 속 발견 속도 감소';}}
 // Clamp visual tracer at first wall intersection.
 if(blocked(a,b,this.level.walls)){let low=0,high=1;for(let i=0;i<18;i++){const t=(low+high)/2,q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};if(blocked(a,q,this.level.walls))high=t;else low=t;}b={x:a.x+(b.x-a.x)*low,y:a.y+(b.y-a.y)*low,z:a.z+(b.z-a.z)*low};}
 this.tracers.push({a,b,life:.14});rally(this.enemies,onscreen,p.x,config.investigateSeconds);if(targetHit?.kind!=='light')this.message='총성 · 화면 안 경비병이 사격 위치로 집결합니다';return true;}
}
export {config,level};
