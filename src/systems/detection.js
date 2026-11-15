import {blocked} from './collision.js';
export const bodyPoint=p=>({x:p.x,y:p.crouch&&!p.aiming?.65:1.65,z:p.z});
export function visible(enemy,player,walls){
 const a={x:enemy.x,y:1.65,z:enemy.z},b=bodyPoint(player),dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz);
 // Guards look diagonally along their lane and toward the foreground.
 const dot=(dx*enemy.direction*.86+dz*.51)/dist;
 return dist<enemy.range&&dot>Math.cos(enemy.fov*Math.PI/360)&&!blocked(a,b,walls);
}
