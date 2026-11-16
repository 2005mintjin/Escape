import {assetUrl} from '../core/assets.js';
export class BattlefieldAmbience{
 constructor(makeAudio=url=>new Audio(url)){this.audio=makeAudio(assetUrl('/audio/battlefield-ambience.mp3'));this.audio.loop=true;this.audio.volume=.14;this.audio.preload='metadata';this.unlocked=false;this.requested=false;this.failed=false;this.allowed=false;}
 unlock(){this.unlocked=true;if(this.failed)this.requested=false;this.failed=false;this.sync();}
 update(state,hidden=false){this.allowed=state==='playing'&&!hidden;this.sync();}
 sync(){if(!this.allowed||!this.unlocked){if(!this.audio.paused)this.audio.pause();this.requested=false;return;}if(this.audio.paused&&!this.requested&&!this.failed){this.requested=true;Promise.resolve(this.audio.play()).catch(error=>{if(error?.name!=='AbortError')this.failed=true;});}}
}
export class IntroTransitionAudio{
 constructor(makeAudio=url=>new Audio(url)){this.audio=makeAudio(assetUrl('/audio/intro-transition.mp3'));this.audio.volume=.45;this.audio.loop=false;this.audio.preload='auto';this.serial=null;this.finished=true;this.requested=false;this.audio.onended=()=>{this.finished=true;};}
 stop(){this.audio.pause();this.audio.currentTime=0;this.finished=true;this.requested=false;this.serial=null;}
 update(story,hidden=false){if(!story.active||!story.transitionSerial){this.stop();return;}if(this.serial!==story.transitionSerial){this.audio.pause();this.audio.currentTime=0;this.serial=story.transitionSerial;this.finished=false;this.requested=false;}if(story.paused||hidden){this.audio.pause();this.requested=false;return;}if(!this.finished&&this.audio.paused&&!this.requested){this.requested=true;Promise.resolve(this.audio.play()).catch(error=>{if(error?.name!=='AbortError')this.finished=true;});}}
}
