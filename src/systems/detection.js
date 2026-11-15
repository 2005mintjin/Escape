import {blocked} from './collision.js';
export const bodyPoint=p=>({x:p.x,y:p.crouch&&!p.aiming?.65:1.65,z:p.z});
export function visible(enemy,player,walls){
 const a={x:enemy.x,y:1.65,z:enemy.z},b=bodyPoint(player),dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz);
 // A crouched player immediately behind a wall has local cover even if a diagonal
 // guard ray passes through a different gap. Require the wall between the two lanes.
 if(player.crouch&&!player.aiming&&walls.some(w=>player.x>=w.min.x+.12&&player.x<=w.max.x-.12&&Math.min(enemy.z,player.z)<w.min.z&&Math.max(enemy.z,player.z)>w.max.z&&w.max.y>=b.y))return false;
 if(dist<3&&Math.abs(dz)<.1)return !blocked(a,b,walls);
 // Guards look diagonally along their lane and toward the foreground.
 const dot=(dx*enemy.direction*.86+dz*.51)/dist;
 return dist<enemy.range&&(Math.abs(dx)<2||dot>Math.cos(enemy.fov*Math.PI/360))&&!blocked(a,b,walls);
}
// Once recognized, the guard retains full detection until death or stage reset.
export function advanceDetection(enemy,seen,dt,config,lockdown,time){
 if(enemy.detected||enemy.meter>=1||enemy.witnessUntil>=time){enemy.detected=true;enemy.hasDetectionStarted=true;enemy.meter=1;return false;}
 if(seen&&!enemy.hasDetectionStarted&&!lockdown){enemy.notice=(enemy.notice||0)+dt;if(enemy.notice<config.suspicionSeconds){enemy.state='Suspicious';return true;}}
 enemy.meter=Math.max(0,Math.min(1,enemy.meter+(seen?1/(lockdown?config.alertDetectionSeconds:config.detectionSeconds):-.65)*dt));
 if(enemy.meter>0)enemy.hasDetectionStarted=true;
 if(enemy.meter>=1)enemy.detected=true;
 return false;
}
