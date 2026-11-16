import {activatePanel} from './stageObjects.js';
import {blocked} from './collision.js';
import {visible} from './detection.js';
// An aligned gap allows a short dash into the guard lane and back. No stabbing through walls.
export function beginMelee(game,config,walls,panel=null){
 const p=game.player;if(game.state!=='playing'||p.melee||p.burst||p.knifeCooldown>0||p.reload)return false;
 const target=panel||game.enemies.filter(e=>!e.dead&&Math.abs(e.x-p.x)<=config.knifeReach&&!blocked({x:p.x,y:.7,z:p.z},{x:e.x,y:.7,z:e.z},walls)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
 if(!target)game.message='주변에 적이 없습니다 · 틈에서 적에게 접근하세요';
 p.melee={target,panel,elapsed:0,duration:config.knifeDuration,crouched:p.crouch,originX:p.x,originZ:p.z,hit:false};
 if(target&&target.x!==p.x)p.direction=Math.sign(target.x-p.x);p.knifeCooldown=config.knifeCooldown;return true;
}
export function stepMelee(game,dt,config,walls){
 const p=game.player,m=p.melee;if(!m)return;m.elapsed+=dt;
 const t=Math.min(1,m.elapsed/config.knifeDuration),dash=Math.sin(Math.PI*t);
 p.z=m.originZ+((m.target?.z??m.originZ)-m.originZ)*dash;
 if(!m.hit&&t>=.5){m.hit=true;const e=m.target;
 if(m.panel){activatePanel(game,m.panel);}
 else if(e&&!e.dead&&Math.hypot(e.x-p.x,e.z-p.z)<=config.knifeReach){e.dead=true;e.state='Dead';e.deathTime=game.time;
 const witnesses=game.enemies.filter(other=>!other.dead&&visible(other,{...p,crouch:false},walls));
 for(const other of witnesses){other.witnessUntil=game.time+config.reactionSeconds;other.meter=1;other.state='Alert';other.timer=config.reactionSeconds;}
 game.message=witnesses.length?'근접 처치 목격! 즉시 발각':'소음 없이 근접 처치';
 }else if(e)game.message='적이 근접 공격 범위를 벗어났습니다';}
 if(t>=1){p.z=m.originZ;p.melee=null;}
}
