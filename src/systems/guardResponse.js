import {visible} from './detection.js';
// Investigation targets are snapshots of the noise location, never hidden-player tracking.
export function rally(enemies,onscreen,x,duration){
 for(const e of enemies)if(!e.dead&&onscreen.includes(e)){e.investigateX=x;e.searchTime=duration;e.idle=0;e.direction=x>=e.x?1:-1;}
}
export function radioStep(game,e,dt,config,walls){
 if(game.lockdown)return false;
 if(!e.corpseTarget)e.corpseTarget=game.enemies.find(body=>body.dead&&!body.reported&&visible(e,{...body,crouch:true},walls));
 if(!e.corpseTarget)return false;
 e.state='Radio';e.radio=Math.min(1,e.radio+dt/config.radioSeconds);
 if(e.radio>=1){e.corpseTarget.reported=true;game.lockdown=true;game.message='무전 완료 · 전원 경계태세! 발각 속도 증가';}
 return true;
}
export function investigate(e,dt,config){
 if(e.searchTime<=0)return false;
 e.searchTime=Math.max(0,e.searchTime-dt);e.state='Investigate';
 const dx=e.investigateX-e.x;
 if(Math.abs(dx)>.2){e.direction=Math.sign(dx);e.x+=e.direction*Math.min(Math.abs(dx),e.speed*config.investigateSpeed*dt);}
 else e.direction=Math.sin(e.searchTime*2)>0?1:-1;
 return true;
}
