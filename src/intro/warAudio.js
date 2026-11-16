import {assetUrl} from '../core/assets.js';
import {warShot} from './warSequence.js';
const IMPACTS=[11.15,12.8,14.1];
export class WarAudio{
 constructor(makeAudio=url=>new Audio(url)){this.impacts=IMPACTS.map(()=>makeAudio(assetUrl('/audio/cinematic-explosion.mp3')));this.impact=this.impacts[0];for(const a of this.impacts){a.volume=.45;a.playbackRate=1;a.onended=()=>this.active.delete(a);}this.steps=makeAudio(assetUrl('/audio/run-steps.mp3'));this.steps.volume=.35;this.steps.loop=true;this.seen=new Set();this.active=new Set();this.pending=new Set();this.last=0;}
 play(a){if(this.pending.has(a))return;this.pending.add(a);Promise.resolve(a.play()).catch(()=>this.active.delete(a)).finally(()=>this.pending.delete(a));}
 stop(){for(const a of [...this.impacts,this.steps]){a.pause();a.currentTime=0;}this.seen.clear();this.active.clear();this.pending.clear();this.last=0;}
 update(story,hidden=false){if(!story.active||story.mode!=='cutscene'){this.stop();return;}if(story.paused||hidden){for(const a of [...this.impacts,this.steps])a.pause();this.pending.clear();return;}const t=story.cutsceneElapsed;if(t<this.last)this.stop();this.last=t;IMPACTS.forEach((cue,i)=>{if(t>=cue&&!this.seen.has(cue)){this.seen.add(cue);const a=this.impacts[i];a.currentTime=0;this.active.add(a);this.play(a);}});for(const a of this.active)if(a.paused)this.play(a);if(warShot(t).id==='escape'){if(this.steps.paused)this.play(this.steps);}else this.steps.pause();}
}
