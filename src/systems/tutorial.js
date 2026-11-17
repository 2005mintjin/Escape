import config from '../../data/gameConfig.json' with {type:'json'};
import {visible,advanceDetection} from './detection.js';
import {radioStep,isRadioActive} from './guardResponse.js';
import lessons from '../../data/tutorialLessons.json' with {type:'json'};
export {lessons as tutorialLessons};
export const tutorialLesson=game=>lessons[game.tutorial?.step??0];
export function updateTutorial(game,dt){if(!game.inTutorial)return;const t=game.tutorial,p=game.player,step=t.step;
 p.x=Math.min(p.x,lessons[step].maxX);if(!p.reserve)p.reserve=30;
 if(!game.pistolAmmo&&(step<=2||step===7)){game.pistolAmmo=6;game.message='훈련용 권총 탄약 보충 · 실전에서는 보충되지 않습니다';}
 for(const [i,e] of game.enemies.entries()){if(e.trainingRole)continue;const lesson=i+1;if(e.dead&&!(t.step>lesson||t.step===lesson&&(i===3?e.crushed:e.killedWith===['rifle','pistol','knife'][i]))){e.dead=false;e.state='Idle';e.crushed=false;e.killedWith=null;game.message='이 구역의 안내에 맞는 장비를 사용하세요. 훈련 표적을 복구했습니다.';}}
 if(step===0){if(p.crouch)t.cover+=dt;if(p.x>=3.5&&t.cover>=.35)t.step++;}
 if(step===1&&game.enemies[0].dead&&p.ammo===6&&!p.reload)t.step++;
 if(step===2&&game.enemies[1].dead)t.step++;
 if(step===3&&game.enemies[2].dead)t.step++;
 if(step===4&&game.panels[0].resolved&&game.enemies[3].crushed)t.step++;
 if(step===5&&(game.lamps[0].broken||game.lamps[0].switchedOff))t.step++;
 const stealth=game.enemies.find(e=>e.id==='stealth'),radio=game.enemies.find(e=>e.id==='radio');
 if(step===6){
  // Practice the same visibility and gauge rules as combat, without lethal retaliation.
  if(stealth.dead){stealth.dead=false;stealth.state='Idle';}
  advanceDetection(stealth,visible(stealth,p,game.level.walls),dt,config,false,game.time);
  if(stealth.meter>=.35)t.exposed=true;
  if(t.exposed&&p.crouch&&!p.aiming&&!visible(stealth,p,game.level.walls)&&stealth.meter<=.001){t.step++;stealth.meter=0;stealth.charging=false;}
  if(stealth.detected){stealth.detected=false;stealth.meter=0;stealth.hasDetectionStarted=false;t.exposed=false;game.message='완전 발각! 서서 게이지를 올린 뒤 더 일찍 웅크리세요.';}
 }
 if(step===7){
  if(radio.dead){if(t.radioArmed&&radio.radio<1)t.step++;else{radio.dead=false;radio.state='Idle';}}
  if(!radio.dead&&Math.abs(p.x-radio.x)<=8){
   radio.corpseTarget??={dead:true,reported:false};
   radioStep(game,radio,dt,config,game.level.walls);t.radioArmed=isRadioActive(radio);
   if(radio.radio>=1){radio.radio=0;radio.radioActive=false;radio.state='Idle';radio.corpseTarget=null;t.radioArmed=false;game.lockdown=false;game.message='무전 완료! 다시 시도하세요. 게이지가 차기 전에 제압하세요.';}
  }
 }
 // Later targets cannot be removed before their own practice starts.
 if(step<6&&stealth.dead)stealth.dead=false;
 if(step<7&&radio.dead)radio.dead=false;
 t.complete=t.step===lessons.length-1;
}
export function tutorialTarget(game){if(!game.inTutorial)return null;const lesson=tutorialLesson(game);return game.enemies.find(e=>e.id===lesson.target)||game.panels.find(p=>p.id===lesson.target)||game.lamps.find(l=>l.id===lesson.target)||null;}
