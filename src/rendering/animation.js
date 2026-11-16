export function playerAnimation(p){
 if(p.dead)return 'death';
 if(p.burst)return p.burst.rolling?'roll':'run';
 if(p.melee)return p.melee.crouched?'meleeCrouch':'melee';
 if(p.shot>2.78)return 'shoot';
 if(p.aiming)return 'aim';
 if(p.crouch)return p.moving?'crouchWalk':'crouch';
 return p.moving?(p.running?'run':'walk'):'idle';
}
export function animationIndex(p,time,count){
 if(p.dead)return Math.min(count-1,Math.floor((p.deathElapsed||0)/.85*count));
 if(p.burst)return Math.min(count-1,Math.floor(p.burst.elapsed/p.burst.duration*count));
 if(p.melee)return Math.min(count-1,Math.floor(p.melee.elapsed/(p.melee.duration||.65)*count));
 if(p.shot>2.78)return Math.min(count-1,Math.floor((3-p.shot)/.055));
 return Math.floor(time*(p.running?12:p.moving?7:5))%count;
}
