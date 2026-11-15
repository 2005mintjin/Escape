const DIRECTIONS={KeyA:-1,ArrowLeft:-1,KeyD:1,ArrowRight:1};
export class Input {
 constructor(target=window,now=()=>performance.now()){
  this.keys=new Set();this.lastTap={direction:0,time:-Infinity};this.sprintDirection=0;
  target.addEventListener('keydown',e=>{
   if(['Space','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
   const direction=DIRECTIONS[e.code];
   if(direction&&!e.repeat&&!this.keys.has(e.code)){if(direction!==this.sprintDirection)this.sprintDirection=0;const time=now();if(direction===this.lastTap.direction&&time-this.lastTap.time<=280)this.sprintDirection=direction;this.lastTap={direction,time};}
   this.keys.add(e.code);
  });
  target.addEventListener('keyup',e=>{this.keys.delete(e.code);if(this.axis!==this.sprintDirection)this.sprintDirection=0;});
  target.addEventListener('blur',()=>this.clear());
 }
 clear(){this.keys.clear();this.sprintDirection=0;this.lastTap={direction:0,time:-Infinity};}
 get axis(){return Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'));}
 get crouch(){return this.keys.has('KeyS');}
 get aim(){return this.keys.has('ShiftLeft')||this.keys.has('ShiftRight');}
 get run(){return !!this.axis&&(this.sprintDirection===this.axis||this.keys.has('Space'));}
}
