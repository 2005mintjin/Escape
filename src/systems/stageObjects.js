import config from '../../data/gameConfig.json' with {type:'json'};
import {blocked} from './collision.js';
export const lightOff=light=>light.broken||light.switchedOff;
export const exitEntry=game=>game.level.exit-.35;
export const lightsComplete=game=>game.lamps.filter(light=>light.required).every(lightOff);
export const exitOpen=game=>lightsComplete(game)&&game.panels.filter(panel=>panel.required!==false).every(panel=>panel.active);
export function stageObjective(game){
 const lightTotal=game.lamps.filter(l=>l.required).length,lightDone=game.lamps.filter(l=>l.required&&lightOff(l)).length;
 if(!lightsComplete(game))return `감시등 차단 ${lightDone} / ${lightTotal} · 사격 / 조명 제어판 F`;
 const panel=game.panels.find(p=>p.required!==false&&!p.active);if(panel)return `제어판 ${panel.x}m · F / 칼 또는 사격`;
 return '출구 개방 · 문 또는 터널로 이동';
}
export const panelBounds=panel=>({min:{x:panel.x-.4,y:panel.y-.3,z:panel.z+.07},max:{x:panel.x+.4,y:panel.y+.3,z:panel.z+.25}});
export function nearbyPanel(game,reach){const p=game.player;return game.panels.find(panel=>!panel.active&&Math.abs(panel.x-p.x)<=reach&&!blocked({x:p.x,y:.7,z:p.z},{x:panel.x,y:.7,z:panel.z},game.level.walls));}
export function activatePanel(game,panel){
 game.soundEvents.push({key:'panel'});
 if(panel.active)return;
 if(panel.requiresLights&&!lightsComplete(game)){game.message='먼저 감시등을 사격하거나 조명 제어판으로 차단하세요';return;}
 panel.active=true;panel.activatedAt=game.time;
 if(panel.type==='lights'){for(const lamp of game.lamps)if(panel.lights.includes(lamp.id))lamp.switchedOff=true;game.message='조명 전원 차단 · 밝은 위험 구역 해제';return;}
 panel.crushAt=game.time+.3;
 game.message='낙하물 작동 · 통로 개방';
}
export const LIGHT_RADIUS=3.6,LIGHT_DEPTH=2.2;
export const insideLight=(lamp,p)=>((p.x-lamp.x)/LIGHT_RADIUS)**2+((p.z-3)/LIGHT_DEPTH)**2<=1;
export const inLight=game=>(game.lamps||[]).some(lamp=>!lightOff(lamp)&&insideLight(lamp,game.player));
export function inShadow(game){return !inLight(game)&&game.lamps.some(lamp=>lightOff(lamp)&&Math.abs(lamp.x-game.player.x)<4.5);}
export const TRAP_SIZE=config.trapSize;
export const trapBounds=panel=>({min:{x:panel.trapX-TRAP_SIZE.width/2,y:0,z:-3-TRAP_SIZE.depth/2},max:{x:panel.trapX+TRAP_SIZE.width/2,y:TRAP_SIZE.height,z:-3+TRAP_SIZE.depth/2}});
export function updateStageObjects(game){for(const panel of game.panels)if(panel.type!=='lights'&&panel.active&&!panel.resolved&&game.time>=panel.crushAt){panel.resolved=true;game.soundEvents.push({key:'trap'});const bounds=trapBounds(panel);for(const enemy of game.enemies)if(!enemy.dead&&enemy.x>=bounds.min.x&&enemy.x<=bounds.max.x&&enemy.z>=bounds.min.z&&enemy.z<=bounds.max.z){enemy.dead=true;enemy.state='Dead';enemy.deathTime=game.time;enemy.crushed=true;}}}
