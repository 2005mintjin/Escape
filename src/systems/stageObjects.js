import {blocked} from './collision.js';
export const lightsComplete=game=>game.lamps.filter(light=>light.required).every(light=>light.broken);
export const exitOpen=game=>lightsComplete(game)&&game.panels.every(panel=>panel.active);
export function stageObjective(game){
 const lightTotal=game.lamps.filter(l=>l.required).length,lightDone=game.lamps.filter(l=>l.required&&l.broken).length;
 if(!lightsComplete(game))return `감시등 파괴 ${lightDone} / ${lightTotal} · Shift + 사격`;
 const panel=game.panels.find(p=>!p.active);if(panel)return `제어판 ${panel.x}m · 틈에서 F / 칼 버튼`;
 return '출구 개방 · 문 또는 터널로 이동';
}
export function nearbyPanel(game,reach){const p=game.player;return game.panels.find(panel=>!panel.active&&Math.abs(panel.x-p.x)<=reach&&!blocked({x:p.x,y:.7,z:p.z},{x:panel.x,y:.7,z:panel.z},game.level.walls));}
export function activatePanel(game,panel){
 if(panel.active)return;
 if(panel.requiresLights&&!lightsComplete(game)){game.message='먼저 금빛 감시등의 전원을 사격으로 차단하세요';return;}
 panel.active=true;panel.activatedAt=game.time;
 panel.crushAt=game.time+.3;
 game.message='낙하물 작동 · 통로 개방';
}
export function inShadow(game){return game.lamps.some(lamp=>lamp.broken&&Math.abs(lamp.x-game.player.x)<4.5);}
export function segmentParameter(a,b,point){const d={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},length=d.x*d.x+d.y*d.y+d.z*d.z;if(!length)return null;const t=((point.x-a.x)*d.x+(point.y-a.y)*d.y+(point.z-a.z)*d.z)/length;if(t<0||t>1.05)return null;const along=Math.min(1,t);return {t:along,x:a.x+d.x*along,y:a.y+d.y*along,z:a.z+d.z*along};}
export function closestShotTarget(game,a,b){let result=null,best=Infinity;
 for(const enemy of game.enemies){if(enemy.dead)continue;const q=segmentParameter(a,b,{x:enemy.x,y:1.1,z:enemy.z});if(q&&q.t<best&&Math.abs(q.x-enemy.x)<.5&&Math.abs(q.z-enemy.z)<.5&&q.y>.15&&q.y<2.15){result={kind:'enemy',object:enemy,point:{x:enemy.x,y:Math.max(.2,Math.min(2,q.y)),z:enemy.z}};best=q.t;}}
 for(const light of game.lamps){if(light.broken)continue;const q=segmentParameter(a,b,light);if(q&&q.t<best&&Math.hypot(q.x-light.x,q.y-light.y,q.z-light.z)<.55){result={kind:'light',object:light,point:{x:light.x,y:light.y,z:light.z}};best=q.t;}}
 return result;
}

export function updateStageObjects(game){for(const panel of game.panels)if(panel.active&&!panel.resolved&&game.time>=panel.crushAt){panel.resolved=true;for(const enemy of game.enemies)if(!enemy.dead&&Math.abs(enemy.x-panel.trapX)<=4.8){enemy.dead=true;enemy.state='Dead';enemy.deathTime=game.time;enemy.crushed=true;}}}
