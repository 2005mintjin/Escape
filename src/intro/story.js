import dialogue from '../../data/introDialogue.json' with {type:'json'};
export const HOME={length:26,npcX:18.3,drawerX:8.3,photoX:8.85,startX:12.2};
export class IntroStory{
 constructor(){this.active=false;this.completed=false;this.x=HOME.startX;this.direction=1;this.moving=false;this.time=0;this.drawerOpen=0;this.photoFall=0;this.hasTie=false;this.photoHeld=false;this.mode='home';this.phase='meet';this.paused=false;this.lines=[];this.lineIndex=0;this.typed=0;this.typeElapsed=0;this.letterTicks=0;this.photoElapsed=0;this.fadeElapsed=0;}
 start(){Object.assign(this,new IntroStory());this.active=true;}
 get line(){return this.lines[this.lineIndex]||null;}
 get text(){return this.line?Array.from(this.line.text).slice(0,this.typed).join(''):'';}
 get target(){if(Math.abs(this.x-HOME.npcX)<1.6&&this.phase!=='memory')return 'npc';if(this.phase==='fetch'&&Math.abs(this.x-HOME.drawerX)<1.5)return 'drawer';if(this.phase==='fallen'&&Math.abs(this.x-HOME.photoX)<1.5)return 'photo';return null;}
 get objective(){return this.phase==='meet'?'식탁 옆 남자에게 말을 걸어 보세요':this.phase==='fetch'?'소파 왼쪽 책장 서랍에서 넥타이 찾기':this.phase==='fallen'?'바닥에 떨어진 사진 살펴보기':'오래된 기억';}
 openDialogue(key){this.lines=dialogue[key];this.dialogueKey=key;this.lineIndex=0;this.resetLine();this.mode='dialogue';}
 resetLine(){this.typed=0;this.typeElapsed=0;}
 reveal(count){if(!this.line)return;const chars=Array.from(this.line.text),end=Math.max(this.typed,Math.min(count,chars.length));for(let n=this.typed;n<end;n++)if(!/\s/.test(chars[n]))this.letterTicks++;this.typed=end;}
 interact(){if(!this.active||this.paused)return false;
  if(this.mode==='dialogue'||this.mode==='photo'&&this.photoElapsed>=2){const length=Array.from(this.line?.text||'').length;if(this.typed<length){this.reveal(length);return true;}if(this.lineIndex+1<this.lines.length){this.lineIndex++;this.resetLine();return true;}if(this.mode==='photo'){this.mode='fade';this.fadeElapsed=0;}else{if(this.dialogueKey==='request')this.phase='fetch';if(this.dialogueKey==='drawer')this.phase='fallen';this.mode='home';}return true;}
  if(this.mode!=='home')return false;
  if(this.target==='npc'){this.openDialogue(this.phase==='meet'?'request':'reminder');return true;}
  if(this.target==='drawer'){this.mode='action';this.actionElapsed=0;return true;}
  if(this.target==='photo'){this.photoHeld=true;this.phase='memory';this.mode='photo';this.photoElapsed=0;this.lines=dialogue.memory;this.lineIndex=0;this.resetLine();return true;}return false;
 }
 update(dt,axis=0){if(!this.active||this.paused)return;this.time+=dt;this.moving=false;
  if(this.mode==='home'){const before=this.x;this.x=Math.max(.9,Math.min(HOME.length-.9,this.x+Math.sign(axis)*2.6*dt));this.moving=this.x!==before;if(axis)this.direction=Math.sign(axis);}
  if(this.mode==='action'){this.actionElapsed+=dt;this.drawerOpen=Math.min(1,this.actionElapsed/.55);this.photoFall=Math.max(0,Math.min(1,(this.actionElapsed-.35)/.85));if(this.actionElapsed>=1.25){this.hasTie=true;this.openDialogue('drawer');}}
  if(this.mode==='photo')this.photoElapsed+=dt;
  if(this.mode==='dialogue'||this.mode==='photo'&&this.photoElapsed>=2){this.typeElapsed+=dt;this.reveal(Math.floor(this.typeElapsed/.045));}
  if(this.mode==='fade'){this.fadeElapsed+=dt;if(this.fadeElapsed>=2.2){this.active=false;this.completed=true;}}
 }
 togglePause(){if(this.active)this.paused=!this.paused;}
}
