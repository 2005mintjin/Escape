import config from '../../data/gameConfig.json' with {type:'json'};
import voices from '../../data/voices.json' with {type:'json'};
import definitions from '../../data/enemies.json' with {type:'json'};
import {level} from '../levels/level01.js';
import {visible,bodyPoint} from '../systems/detection.js';
import {rally,radioStep,investigate} from '../systems/guardResponse.js';
import {beginMelee,stepMelee} from '../systems/melee.js';
import {movePlayer} from '../systems/movement.js';
import {blocked} from '../systems/collision.js';
export class Game {
 constructor(){this.reset();}
 reset(){this.player={x:level.start,z:config.playerZ,crouch:false,aiming:false,weapon:'rifle',deathElapsed:0,stamina:config.staminaSeconds,exhausted:false,recoverDelay:0,direction:1,ammo:config.magazine,reserve:config.reserve,reload:0,shot:0,knifeCooldown:0,melee:null,dead:false};this.enemies=definitions.map(e=>({...e,z:config.enemyZ,state:'Patrol',meter:0,timer:0,idle:0,dead:false,radio:0,corpseTarget:null,searchTime:0}));this.state='playing';this.lockdown=false;this.time=0;this.tracers=[];this.message='낮은 벽 아래로 이동하세요';}
 stance(input){this.player.crouch=this.player.melee?false:!!input.crouch;this.player.aiming=!!input.aim;}
 switchWeapon(){if(this.state!=='playing'||this.player.melee)return;this.player.weapon=this.player.weapon==='rifle'?'knife':'rifle';}
 update(dt,input){if(this.state==='dying'){this.player.deathElapsed+=dt;if(this.player.deathElapsed>=1)this.state='dead';return;}if(this.state!=='playing')return;this.time+=dt;const p=this.player;this.stance(input);movePlayer(p,dt,input,config);p.shot=Math.max(0,p.shot-dt);p.knifeCooldown=Math.max(0,p.knifeCooldown-dt);stepMelee(this,dt,config,level.walls);
 if(p.reload>0){p.reload=Math.max(0,p.reload-dt);if(!p.reload){const n=Math.min(config.magazine-p.ammo,p.reserve);p.ammo+=n;p.reserve-=n;}}
 this.tracers=this.tracers.filter(t=>(t.life-=dt)>0);
 for(const e of this.enemies){if(e.dead)continue;const seen=visible(e,p,level.walls);if(seen){e.lastSeenX=p.x;e.alertMemory=2;}else e.alertMemory=Math.max(0,(e.alertMemory||0)-dt);e.meter=Math.max(0,Math.min(1,e.meter+(seen?1/(this.lockdown?config.alertDetectionSeconds:config.detectionSeconds):-.65)*dt));
 if(e.witnessUntil>=this.time||((e.state==='Alert'||e.state==='Attack')&&e.alertMemory>0))e.meter=1;
 if(seen&&e.meter>0)e.direction=p.x>=e.x?1:-1;
 if(e.meter>=1){if(e.state!=='Alert'&&e.state!=='Attack'){e.state='Alert';e.timer=config.reactionSeconds;}e.timer-=dt;if(e.timer<=0){e.state='Attack';if(seen&&!blocked({x:e.x,y:1.65,z:e.z},bodyPoint(p),level.walls)){this.tracers.push({a:{x:e.x,y:1.65,z:e.z},b:bodyPoint(p),life:.2,enemy:true});p.dead=true;p.deathElapsed=0;this.state='dying';break;}else{e.state='Suspicious';e.meter=.5;}}}
 else if(radioStep(this,e,dt,{...config,radioSeconds:Math.max(config.radioSeconds,voices.radio.duration)},level.walls)){}else if(investigate(e,dt,config)){}else if(e.meter>0){e.state='Suspicious';}else if(e.idle>0){e.idle-=dt;e.state='Idle';}else{e.state='Patrol';e.x+=e.direction*e.speed*dt;if(e.x>=e.max||e.x<=e.min){e.x=Math.max(e.min,Math.min(e.max,e.x));e.direction*=-1;e.idle=1.5;}}
 }
 if(p.x>=level.exit&&!p.dead)this.state='clear';}
 knife(){if(this.player.weapon!=='knife')return false;return beginMelee(this,config,level.walls);}
 reload(){const p=this.player;if(this.state==='playing'&&!p.melee&&!p.reload&&p.ammo<config.magazine&&p.reserve)p.reload=config.reloadSeconds;}
 shoot(target,onscreen=[]){const p=this.player;if(this.state!=='playing'||p.weapon!=='rifle'||p.reload||p.melee||p.shot>0)return false;if(!p.aiming){this.message='Shift를 누른 채 클릭하여 사격하세요';return false;}if(!p.ammo){this.message='R 키로 재장전';return false;}p.ammo--;p.shot=config.shotCooldown;const a={x:p.x,y:1.65,z:p.z};let b={...target};const distance=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
 if(distance>config.weaponRange){const scale=config.weaponRange/distance;b={x:a.x+(b.x-a.x)*scale,y:a.y+(b.y-a.y)*scale,z:a.z+(b.z-a.z)*scale};}let hit=null;
 // Pick the nearest sprite body along the aiming ray.
 let best=Infinity;for(const e of this.enemies){if(e.dead||Math.hypot(e.x-a.x,1.3-a.y,e.z-a.z)>config.weaponRange)continue;const d={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},len=d.x*d.x+d.y*d.y+d.z*d.z;const t=((e.x-a.x)*d.x+(1.1-a.y)*d.y+(e.z-a.z)*d.z)/len;const q={x:a.x+d.x*t,y:a.y+d.y*t,z:a.z+d.z*t};if(t>0&&t<=1.05&&Math.abs(q.x-e.x)<.5&&q.y>.15&&q.y<2.15&&Math.abs(q.z-e.z)<.5&&t<best){best=t;hit=e;}}
 if(hit){b={x:hit.x,y:1.3,z:hit.z};if(!blocked(a,b,level.walls)){hit.dead=true;hit.state='Dead';hit.deathTime=this.time;}}
 // Clamp visual tracer at first wall intersection.
 if(blocked(a,b,level.walls)){let low=0,high=1;for(let i=0;i<18;i++){const t=(low+high)/2,q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};if(blocked(a,q,level.walls))high=t;else low=t;}b={x:a.x+(b.x-a.x)*low,y:a.y+(b.y-a.y)*low,z:a.z+(b.z-a.z)*low};}
 this.tracers.push({a,b,life:.14});rally(this.enemies,onscreen,p.x,config.investigateSeconds);this.message='총성 · 화면 안 경비병이 사격 위치로 집결합니다';return true;}
}
export {config,level};
