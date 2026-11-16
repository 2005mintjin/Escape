import lessons from '../../data/tutorialLessons.json' with {type:'json'};
export {lessons as tutorialLessons};
export const tutorialLesson=game=>lessons[game.tutorial?.step??0];
export function updateTutorial(game,dt){if(!game.inTutorial)return;const t=game.tutorial,p=game.player,step=t.step;
 p.x=Math.min(p.x,lessons[step].maxX);if(!p.reserve)p.reserve=30;
 if(!game.pistolAmmo&&step<=2){game.pistolAmmo=6;game.message='훈련용 권총 탄약 보충 · 실전에서는 보충되지 않습니다';}
 for(const [i,e] of game.enemies.entries()){const lesson=i+1;if(e.dead&&!(t.step>lesson||t.step===lesson&&(i===3?e.crushed:e.killedWith===['rifle','pistol','knife'][i]))){e.dead=false;e.state='Idle';e.crushed=false;e.killedWith=null;game.message='이 구역의 안내에 맞는 장비를 사용하세요. 훈련 표적을 복구했습니다.';}}
 if(step===0){if(p.crouch)t.cover+=dt;if(p.x>=3.5&&t.cover>=.35)t.step++;}
 if(step===1&&game.enemies[0].dead&&p.ammo===6&&!p.reload)t.step++;
 if(step===2&&game.enemies[1].dead)t.step++;
 if(step===3&&game.enemies[2].dead)t.step++;
 if(step===4&&game.panels[0].resolved&&game.enemies[3].crushed)t.step++;
 if(step===5&&(game.lamps[0].broken||game.lamps[0].switchedOff))t.step++;
 t.complete=t.step===lessons.length-1;
}
export function tutorialTarget(game){if(!game.inTutorial)return null;const lesson=tutorialLesson(game);return game.enemies.find(e=>e.id===lesson.target)||game.panels.find(p=>p.id===lesson.target)||game.lamps.find(l=>l.id===lesson.target)||null;}
