import {assetUrl} from '../core/assets.js';
import {warShot} from './warSequence.js';
// Timed foley belongs to the cinematic, never the playable home's sound bus.
export class WarAudio{
 constructor(makeAudio=url=>new Audio(url)){this.impact=makeAudio(assetUrl('/audio/trap-impact.mp3'));this.steps=makeAudio(assetUrl('/audio/escape-steps.mp3'));this.impact.volume=.65;this.impact.playbackRate=.65;this.steps.volume=.35;this.steps.loop=true;this.seen=new Set();this.last=0;}
 stop(){for(const a of [this.impact,this.steps]){a.pause();a.currentTime=0;}this.seen.clear();this.last=0;}
 update(story,hidden=false){if(!story.active||story.mode!=='cutscene'){this.stop();return;}if(story.paused||hidden){this.impact.pause();this.steps.pause();return;}const t=story.cutsceneElapsed;if(t<this.last)this.stop();this.last=t;for(const cue of [11.15,12.8,14.1])if(t>=cue&&!this.seen.has(cue)){this.seen.add(cue);this.impact.currentTime=0;this.impact.play().catch(()=>{});}if(warShot(t).id==='escape'){if(this.steps.paused)this.steps.play().catch(()=>{});}else this.steps.pause();}
}
