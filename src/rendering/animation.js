export function playerAnimation(p){
 if(p.weapon==='knife')return p.crouch?'crouch':p.moving?(p.running?'run':'walk'):'idle';
 if(p.shot>2.78)return 'shoot';
 if(p.aiming)return 'aim';
 if(p.crouch)return 'crouch';
 return p.moving?(p.running?'run':'walk'):'idle';
}
