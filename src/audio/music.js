import {assetUrl} from '../core/assets.js';
export class Music {
 constructor(makeAudio=url=>new Audio(url)){this.audio=makeAudio(assetUrl('/audio/below-the-rafters.mp3'));this.homeAudio=makeAudio(assetUrl('/audio/midnight-at-the-harbor.mp3'));for(const track of [this.audio,this.homeAudio]){track.loop=true;track.preload='metadata';}this.enabled=true;this.unlocked=false;this.requests=new Map();this.failedTracks=new Set();this.failed=false;this.state='title';this.hidden=false;this.scene=null;}
 unlock(){this.unlocked=true;if(this.failed){this.failedTracks.clear();this.requests.clear();this.failed=false;}this.sync();}
 toggle(){this.enabled=!this.enabled;if(this.enabled)this.unlock();else this.sync();}
 update(state,hidden=false,scene=null){this.state=state;this.hidden=hidden;this.scene=scene;this.sync();}
 track(audio,volume){audio.volume=volume;if(volume<=0){if(!audio.paused)audio.pause();this.requests.delete(audio);return;}if(audio.paused&&!this.requests.has(audio)&&!this.failedTracks.has(audio)){this.requests.set(audio,true);Promise.resolve(audio.play()).catch(error=>{if(error?.name!=='AbortError'){this.failedTracks.add(audio);this.failed=true;}});}}
 sync(){const allowed=this.enabled&&this.unlocked&&!this.hidden,home=this.state==='intro'&&this.scene&&!this.scene.paused&&!['opening','fade','warcard','cutscene'].includes(this.scene.mode);const homeFade=this.scene?.photoHeld?Math.max(0,1-this.scene.photoElapsed/2):1;const combat=['playing','paused','dying','dead','clear','extracting'].includes(this.state);
 this.track(this.audio,allowed&&combat?(this.state==='playing'?.22:.11):0);this.track(this.homeAudio,allowed&&home?.2*homeFade:0);}
}
