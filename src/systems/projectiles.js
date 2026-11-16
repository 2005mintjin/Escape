import {segmentBoxEntry} from './collision.js';
import {lightOff,activatePanel,panelBounds} from './stageObjects.js';
export function fireProjectile(game,origin,target,{enemy=false,speed,range}){
 const length=Math.hypot(target.x-origin.x,target.y-origin.y,target.z-origin.z);if(length<1e-6)return false;
 const direction={x:(target.x-origin.x)/length,y:(target.y-origin.y)/length,z:(target.z-origin.z)/length};
 game.projectiles.push({position:{...origin},direction,speed,remaining:range,enemy,weapon:enemy?null:game.player?.weapon});
 if(enemy)game.soundEvents.push({key:'enemy'});return true;
}
const bodyBox=(body,player=false)=>({min:{x:body.x-.42,y:.12,z:body.z-.3},max:{x:body.x+.42,y:player&&body.crouch&&!body.aiming?1:2.15,z:body.z+.3}});
export function updateProjectiles(game,dt){
 const active=[];
 for(const bullet of game.projectiles){
  const a=bullet.position,distance=Math.min(bullet.remaining,bullet.speed*dt),b={x:a.x+bullet.direction.x*distance,y:a.y+bullet.direction.y*distance,z:a.z+bullet.direction.z*distance};let hit=null,nearest=Infinity;
  const consider=(box,kind,object)=>{const t=segmentBoxEntry(a,b,box);if(t!==null&&t<nearest){nearest=t;hit={kind,object};}};
  for(const wall of game.level.walls)consider(wall,'wall');
  if(bullet.enemy)consider(bodyBox(game.player,true),'player');
  else{
   for(const enemy of game.enemies)if(!enemy.dead)consider(bodyBox(enemy),'enemy',enemy);
   for(const panel of game.panels)consider(panelBounds(panel),'panel',panel);
   for(const lamp of game.lamps)if(!lightOff(lamp))consider({min:{x:lamp.x-.4,y:lamp.y-.3,z:lamp.z-.4},max:{x:lamp.x+.4,y:lamp.y+.3,z:lamp.z+.4}},'light',lamp);
  }
  if(hit){
   if(hit.kind==='player')game.damagePlayer();
   if(hit.kind==='enemy'){hit.object.dead=true;hit.object.state='Dead';hit.object.deathTime=game.time;hit.object.killedWith=bullet.weapon;}
   if(hit.kind==='panel')activatePanel(game,hit.object);
   if(hit.kind==='light'&&!(game.inTutorial&&game.tutorial.step<hit.object.trainingStep)){hit.object.broken=true;game.soundEvents.push({key:'light'});game.message='감시등 파괴 · 어둠 속 발견 속도 감소';}
  }else{bullet.position=b;bullet.remaining-=distance;if(bullet.remaining>1e-6)active.push(bullet);}
  if(game.player.dead){game.projectiles=[];return;}
 }
 game.projectiles=active;
}
