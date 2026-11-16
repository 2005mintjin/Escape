import {blocked} from './collision.js';
export const lightOff=light=>light.broken||light.switchedOff;
export const exitEntry=game=>game.level.exit-1.25;
export const lightsComplete=game=>game.lamps.filter(light=>light.required).every(lightOff);
export const exitOpen=game=>lightsComplete(game)&&game.panels.filter(panel=>panel.required!==false).every(panel=>panel.active);
export function stageObjective(game){
 const lightTotal=game.lamps.filter(l=>l.required).length,lightDone=game.lamps.filter(l=>l.required&&lightOff(l)).length;
 if(!lightsComplete(game))return `감시등 차단 ${lightDone} / ${lightTotal} · 사격 / 조명 제어판 F`;
 const panel=game.panels.find(p=>p.required!==false&&!p.active);if(panel)return `제어판 ${panel.x}m · 틈에서 F / 칼 버튼`;
 return '출구 개방 · 문 또는 터널로 이동';
}
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
export function segmentParameter(a,b,point){const d={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},length=d.x*d.x+d.y*d.y+d.z*d.z;if(!length)return null;const t=((point.x-a.x)*d.x+(point.y-a.y)*d.y+(point.z-a.z)*d.z)/length;if(t<0||t>1.05)return null;const along=Math.min(1,t);return {t:along,x:a.x+d.x*along,y:a.y+d.y*along,z:a.z+d.z*along};}
export function closestShotTarget(game,a,b){let result=null,best=Infinity;
 for(const enemy of game.enemies){if(enemy.dead)continue;const q=segmentParameter(a,b,{x:enemy.x,y:1.1,z:enemy.z});if(q&&q.t<best&&Math.abs(q.x-enemy.x)<.5&&Math.abs(q.z-enemy.z)<.5&&q.y>.15&&q.y<2.15){result={kind:'enemy',object:enemy,point:{x:enemy.x,y:Math.max(.2,Math.min(2,q.y)),z:enemy.z}};best=q.t;}}
 for(const light of game.lamps){if(lightOff(light))continue;const q=segmentParameter(a,b,light);if(q&&q.t<best&&Math.hypot(q.x-light.x,q.y-light.y,q.z-light.z)<.55){result={kind:'light',object:light,point:{x:light.x,y:light.y,z:light.z}};best=q.t;}}
 return result;
}

export function updateStageObjects(game){for(const panel of game.panels)if(panel.type!=='lights'&&panel.active&&!panel.resolved&&game.time>=panel.crushAt){panel.resolved=true;game.soundEvents.push({key:'trap'});for(const enemy of game.enemies)if(!enemy.dead&&Math.abs(enemy.x-panel.trapX)<=4.8){enemy.dead=true;enemy.state='Dead';enemy.deathTime=game.time;enemy.crushed=true;}}}
