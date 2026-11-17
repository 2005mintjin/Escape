export const isFiring=p=>p.shot>0&&p.shot>(p.shotDuration??3)-.22&&(!p.lastShotWeapon||p.lastShotWeapon===p.weapon);
export function playerAnimation(p){
 if(p.dead)return 'death';
 if(p.burst)return p.burst.rolling?'roll':p.weapon==='pistol'?'pistolRun':'run';
 if(p.melee)return p.melee.crouched?'meleeCrouch':'melee';
 if(p.weapon==='pistol'){if(isFiring(p))return p.crouch?'pistolCrouchShoot':'pistolShoot';if(p.aiming)return p.crouch?'pistolCrouchAim':'pistolAim';if(p.crouch)return p.moving?'pistolCrouchWalk':'pistolCrouch';return p.moving?(p.running?'pistolRun':'pistolWalk'):'pistolIdle';}
 if(isFiring(p))return 'shoot';
 if(p.aiming)return 'aim';
 if(p.crouch)return p.moving?'crouchWalk':'crouch';
 return p.moving?(p.running?'run':'walk'):'idle';
}
export function animationIndex(p,time,count){
 if(p.dead)return Math.min(count-1,Math.floor((p.deathElapsed||0)/.85*count));
 if(p.burst)return Math.min(count-1,Math.floor(p.burst.elapsed/p.burst.duration*count));
 if(p.melee)return Math.min(count-1,Math.floor(p.melee.elapsed/(p.melee.duration||.65)*count));
 if(isFiring(p))return Math.min(count-1,Math.floor(((p.shotDuration??3)-p.shot)/.22*count));
 if(p.weapon==='pistol'&&p.aiming&&!p.moving)return 0;
 return Math.floor(time*(p.running?(p.weapon==='pistol'?16:12):p.moving?7:5))%count;
}
