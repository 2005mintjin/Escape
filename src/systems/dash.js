export function beginDash(game,input,config){const p=game.player;if(game.state!=='playing'||p.burst||p.melee||p.reload||p.dashCooldown>0||p.stamina<config.dashCost)return false;
 const rolling=!!input.crouch,direction=input.axis?Math.sign(input.axis):p.direction||1,duration=rolling?config.rollDuration:config.dashDuration;
 p.burst={rolling,direction,duration,elapsed:0,speed:config.dashDistance/duration};p.stamina-=config.dashCost;p.recoverDelay=config.staminaDelay+duration;p.dashCooldown=config.dashCooldown;p.aiming=false;return true;
}
