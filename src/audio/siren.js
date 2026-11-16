import {assetUrl} from '../core/assets.js';
// One alert per stage. Pause resumes its position; death/restart stops and rewinds it.
export class Siren {
 constructor(makeAudio=url=>new Audio(url)){this.audio=makeAudio(assetUrl('/audio/air-raid-siren.mp3'));this.audio.volume=.35;this.audio.loop=false;this.audio.preload='metadata';this.allowed=false;this.generation=0;this.player=null;this.triggered=false;this.finished=false;this.failed=false;this.starting=false;this.audio.onended=()=>{this.finished=true;};}
 reset(player){this.generation++;this.audio.pause();this.audio.currentTime=0;this.player=player;this.triggered=false;this.finished=false;this.failed=false;this.starting=false;}
 play(){if(!this.audio.paused||this.starting||this.finished||this.failed)return;this.starting=true;const generation=this.generation;Promise.resolve(this.audio.play()).catch(error=>{if(generation===this.generation&&error?.name!=='AbortError')this.failed=true;}).finally(()=>{if(generation===this.generation)this.starting=false;});}
 unlock(){if(this.failed&&this.triggered&&!this.finished){this.failed=false;if(this.allowed)this.play();}}
 update(game,hidden=false){
  if(this.player!==game.player)this.reset(game.player);this.allowed=game.state==='playing'&&!hidden;
  if(['title','dead','dying','extracting','clear'].includes(game.state)){if(this.triggered){this.generation++;this.starting=false;this.audio.pause();this.audio.currentTime=0;this.finished=true;}return;}
  if(hidden||game.state==='paused'){this.generation++;this.starting=false;if(!this.audio.paused)this.audio.pause();return;}
  if(game.state!=='playing')return;
  if(game.lockdown&&!this.triggered)this.triggered=true;
  if(this.triggered)this.play();
 }
}
