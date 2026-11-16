// Persistent DOM: HUD refreshes must never destroy a held pointer or its capture.
export class TouchControls {
 constructor(input,{canvas,game,point,attack,unlock}){
  this.input=input;this.game=game;this.point=point;this.attack=attack;this.unlock=unlock;this.held=new Map();this.canvasPointers=new Set();this.aimPoint={x:innerWidth*.6,y:innerHeight*.45};
  this.root=document.createElement('div');this.root.id='touch-controls';this.root.innerHTML=`<button id="touch-pause" data-action="pause" aria-label="터치 일시정지">Ⅱ 일시정지</button><button id="touch-weapon" data-action="weapon" aria-label="무기 전환">소총 ↔ 권총</button><div class="touch-help">화면을 터치해 조준 · 공격을 누르고 있으면 사격 자세</div><div class="touch-move"><button data-hold="left" aria-label="왼쪽 이동">◀</button><button data-hold="right" aria-label="오른쪽 이동">▶</button><button data-hold="run" aria-label="달리기">달리기</button></div><div class="touch-actions"><button data-action="crouch" aria-label="앉기 전환" aria-pressed="false">앉기</button><button data-action="dash" aria-label="대시 / 구르기">대시</button><button data-action="knife" aria-label="칼 공격">칼</button><button data-action="reload" aria-label="재장전">재장전</button><button data-hold="fire" aria-label="공격">공격</button></div>`;document.body.append(this.root);
  for(const button of this.root.querySelectorAll('[data-hold]')){
   button.addEventListener('pointerdown',event=>{event.preventDefault();if(game.state!=='playing')return;button.setPointerCapture(event.pointerId);this.unlock();this.held.set(event.pointerId,button.dataset.hold);this.sync();if(button.dataset.hold==='fire')this.fire();});
   const release=event=>{this.held.delete(event.pointerId);this.sync();};for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,release);
  }
  this.root.querySelector('[data-action="pause"]').onclick=()=>{game.state='paused';this.clear();};
  this.root.querySelector('[data-action="crouch"]').onclick=()=>{input.touch.crouch=!input.touch.crouch;this.sync();};
  this.root.querySelector('[data-action="dash"]').onclick=()=>game.dash(input);
  this.root.querySelector('[data-action="knife"]').onclick=()=>{this.unlock();game.stance(input);game.knife();};
  this.root.querySelector('[data-action="weapon"]').onclick=()=>game.toggleWeapon();
  this.root.querySelector('[data-action="reload"]').onclick=()=>game.reload();
  canvas.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'||game.state!=='playing')return;event.preventDefault();canvas.setPointerCapture(event.pointerId);this.unlock();this.canvasPointers.add(event.pointerId);this.setAim(event);this.sync();});
  canvas.addEventListener('pointermove',event=>{if(this.canvasPointers.has(event.pointerId))this.setAim(event);});
  const releaseCanvas=event=>{this.canvasPointers.delete(event.pointerId);this.sync();};for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,releaseCanvas);
  addEventListener('blur',()=>this.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
 }
 setAim(event){this.aimPoint={x:event.clientX,y:event.clientY};this.point(event.clientX,event.clientY);}
 sync(){const values=[...this.held.values()];Object.assign(this.input.touch,{axis:Number(values.includes('right'))-Number(values.includes('left')),run:values.includes('run'),aim:values.includes('fire')||this.canvasPointers.size>0});for(const button of this.root.querySelectorAll('[data-hold]'))button.classList.toggle('held',values.includes(button.dataset.hold));this.root.querySelector('[data-action="crouch"]').setAttribute('aria-pressed',String(this.input.touch.crouch));}
 fire(){this.point(this.aimPoint.x,this.aimPoint.y);this.attack(this.aimPoint.x,this.aimPoint.y);}
 clear(){this.held.clear();this.canvasPointers.clear();Object.assign(this.input.touch,{axis:0,run:false,aim:false,crouch:false});this.sync();}
 update(){const active=this.game.state==='playing';this.root.hidden=!active;if(!active){this.clear();return;}if([...this.held.values()].includes('fire'))this.fire();const p=this.game.player;this.root.querySelector('[data-action="weapon"]').textContent=(p.weapon==='pistol'?'권총 → 소총':'소총 → 권총')+' · '+this.game.pistolAmmo+'발';this.root.querySelector('[data-action="reload"]').disabled=p.weapon==='pistol';this.root.querySelector('[data-hold="fire"]').textContent=p.shot>0?`${p.shot.toFixed(1)}초`:'사격';}
}
