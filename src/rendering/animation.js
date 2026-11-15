export function playerAnimation(p){
 if(p.dead)return 'death';
 if(p.weapon==='knife')return p.crouch?(p.moving?'crouchWalk':'crouch'):p.moving?(p.running?'run':'walk'):'idle';
 if(p.shot>2.78)return 'shoot';
 if(p.aiming)return 'aim';
 if(p.crouch)return p.moving?'crouchWalk':'crouch';
 return p.moving?(p.running?'run':'walk'):'idle';
}
export function animationIndex(p,time,count){
 if(p.dead)return Math.min(count-1,Math.floor((p.deathElapsed||0)/.85*count));
 if(p.shot>2.78)return Math.min(count-1,Math.floor((3-p.shot)/.055));
 return Math.floor(time*(p.running?12:p.moving?7:5))%count;
}
