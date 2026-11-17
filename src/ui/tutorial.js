import {tutorialLesson,tutorialLessons,tutorialTarget} from '../systems/tutorial.js';
export function tutorialUI(game,{restart,skip,world}){
 const root=document.createElement('aside');root.id='tutorial-guide';root.hidden=true;root.innerHTML='<div class="tutorial-sign"><div class="tutorial-tag"></div><h2></h2><p class="tutorial-instruction"></p><strong class="tutorial-goal" aria-live="polite"></strong><div class="tutorial-distance"></div></div><div class="tutorial-buttons"><button data-training="restart">다시 연습</button><button data-training="skip">튜토리얼 건너뛰기</button></div>';document.body.append(root);root.querySelector('[data-training=restart]').onclick=restart;root.querySelector('[data-training=skip]').onclick=skip;
 return ()=>{document.body.classList.toggle('tutorial-active',!!game.inTutorial&&game.state==='playing');root.hidden=!game.inTutorial||game.state!=='playing';if(root.hidden)return;const t=game.tutorial,l=tutorialLesson(game),target=tutorialTarget(game),coarse=matchMedia('(pointer:coarse)').matches;
 const sign=root.querySelector('.tutorial-sign'),point=world.screen({x:l.maxX-2,z:0},3.6),half=Math.min(240,innerWidth*.43);sign.style.left=Math.max(half,Math.min(innerWidth-half,point.x))+'px';sign.style.top=Math.max(78,Math.min(innerHeight-145,point.y))+'px';
 root.querySelector('.tutorial-distance').textContent=target&&!target.dead?'목표까지 '+Math.abs(target.x-game.player.x).toFixed(1)+' m':'';
 root.querySelector('.tutorial-tag').textContent=`연습 ${t.step+1} / ${tutorialLessons.length}`;
 root.querySelector('h2').textContent=l.title;
 root.querySelector('.tutorial-instruction').textContent=coarse?l.touchSign:l.sign;
 let goal=l.goal;if(t.step===1&&game.enemies[0].dead)goal='✓ 명중했습니다. R / 재장전 버튼으로 탄창을 채우세요.';
 if(t.step===6)goal=t.exposed?'이제 벽 뒤에서 웅크려 게이지를 0%로 낮추세요':'서서 경비에게 모습을 보여 발각 게이지를 35%까지 올리세요';
 if(t.step===7&&game.message.startsWith('무전 완료!'))goal=game.message;
 root.querySelector('.tutorial-goal').textContent=goal;
 };
}
