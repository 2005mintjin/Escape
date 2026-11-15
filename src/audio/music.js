import {assetUrl} from '../core/assets.js';
export class Music {
 constructor(makeAudio=url=>new Audio(url)){this.audio=makeAudio(assetUrl('/audio/below-the-rafters.mp3'));this.audio.loop=true;this.audio.preload='metadata';this.enabled=true;this.unlocked=false;this.requested=false;this.failed=false;this.state='title';this.hidden=false;}
 unlock(){this.unlocked=true;if(this.failed){this.requested=false;this.failed=false;}this.sync();}
 toggle(){this.enabled=!this.enabled;if(this.enabled)this.unlock();else this.sync();}
 update(state,hidden=false){this.state=state;this.hidden=hidden;this.sync();}
 sync(){
  if(!this.enabled||!this.unlocked||this.hidden){if(!this.audio.paused)this.audio.pause();this.requested=false;return;}
  this.audio.volume=this.state==='playing'?.22:.11;
  if(this.audio.paused&&!this.requested){this.requested=true;Promise.resolve(this.audio.play()).catch(()=>{this.failed=true;});}
 }
}
