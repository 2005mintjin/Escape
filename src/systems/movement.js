export function movePlayer(p,dt,input,config){
 if(p.burst){const burst=p.burst,step=Math.min(dt,Math.max(0,burst.duration-burst.elapsed));burst.elapsed+=dt;p.x=Math.max(1,Math.min(config.length-1,p.x+burst.direction*burst.speed*step));p.direction=burst.direction;p.moving=true;p.running=false;p.recoverDelay=config.staminaDelay;if(burst.elapsed>=burst.duration)p.burst=null;return;}
 const requested=!!input.run&&!!input.axis&&!p.crouch&&!p.aiming&&!p.melee;
 p.running=requested&&!p.exhausted&&p.stamina>0;
 if(p.running){p.stamina=Math.max(0,p.stamina-dt);p.recoverDelay=config.staminaDelay;if(!p.stamina)p.exhausted=true;}
 else{p.recoverDelay=Math.max(0,p.recoverDelay-dt);if(!p.recoverDelay)p.stamina=Math.min(config.staminaSeconds,p.stamina+config.staminaRegen*dt);}
 // Exhaustion requires a fresh sprint input after enough recovery; no automatic stutter sprint.
 if(!input.run&&p.stamina>=config.staminaRestart)p.exhausted=false;
 const speed=p.aiming||p.crouch?config.crouchSpeed:p.running?config.runSpeed:config.walkSpeed;
 const before=p.x;p.x=Math.max(1,Math.min(config.length-1,p.x+(p.melee?0:input.axis)*speed*dt));p.moving=p.x!==before;
 if(input.axis&&!p.aiming)p.direction=Math.sign(input.axis);
}
