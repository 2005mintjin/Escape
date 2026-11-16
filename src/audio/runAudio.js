import {assetUrl} from '../core/assets.js';
export class RunAudio{
 constructor(makeAudio=url=>new Audio(url)){this.audio=makeAudio(assetUrl('/audio/run-steps.mp3'));this.audio.loop=true;this.audio.preload='auto';this.audio.volume=.3;this.unlocked=false;this.requested=false;this.failed=false;this.allowed=false;}
 unlock(){this.unlocked=true;if(this.failed){this.failed=false;this.requested=false;}this.sync();}
 update(game,hidden=false){const p=game.player;this.allowed=game.state==='playing'&&!hidden&&!!p?.moving&&!!p.running&&!p.crouch&&!p.dead&&!p.burst;this.sync();}
 sync(){if(!this.allowed||!this.unlocked){if(!this.audio.paused)this.audio.pause();if(this.audio.currentTime)this.audio.currentTime=0;this.requested=false;return;}if(this.audio.paused&&!this.requested&&!this.failed){this.requested=true;Promise.resolve(this.audio.play()).catch(error=>{if(error?.name!=='AbortError')this.failed=true;});}}
}
