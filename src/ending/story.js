import shots from '../../data/endingDialogue.json' with {type:'json'};
export {shots as endingShots};
export class EndingStory{
 constructor(){this.active=false;this.completed=false;this.paused=false;this.index=0;this.elapsed=0;this.time=0;}
 start(){Object.assign(this,new EndingStory());this.active=true;}
 get shot(){return shots[this.index];}
 get progress(){return Math.min(1,this.elapsed/this.shot.duration);}
 get visibleText(){return Array.from(this.shot.text).slice(0,Math.floor(this.elapsed*26)).join('');}
 next(){if(!this.active||this.paused)return;if(this.visibleText!==this.shot.text){this.elapsed=Math.max(this.elapsed,Array.from(this.shot.text).length/26);return;}this.advance();}
 advance(){if(this.index===shots.length-1){this.active=false;this.completed=true;}else{this.index++;this.elapsed=0;}}
 update(dt){if(!this.active||this.paused)return;const step=Math.min(1,Math.max(0,dt));this.time+=step;this.elapsed+=step;if(this.elapsed>=this.shot.duration)this.advance();}
}
