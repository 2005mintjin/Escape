import {assetUrl} from '../core/assets.js';
import {isRadioActive} from '../systems/guardResponse.js';
import {pickVoice} from './voiceCatalog.js';
const keys={Radio:'radio',Alert:'spotted',Investigate:'gunfire',Suspicious:'suspicious'};
const priority={radio:4,spotted:3,gunfire:2,suspicious:1};
// Global voice bus: one speaker, no queued chorus. Radio can interrupt ordinary chatter.
export class Voices {
 constructor(makeAudio=url=>new Audio(url),random=Math.random){this.makeAudio=makeAudio;this.random=random;this.channels=new Map();this.previous=new Map();this.enabled=false;this.detectionStarted=new WeakSet();}
 unlock(){this.enabled=true;}
 stop(enemy){const channel=this.channels.get(enemy);if(channel){channel.audio.pause();channel.audio.currentTime=0;this.channels.delete(enemy);}}
 update(game){
  for(const enemy of game.enemies)if(enemy.meter>0||enemy.hasDetectionStarted)this.detectionStarted.add(enemy);
  for(const [enemy,channel] of this.channels)if((channel.key==='suspicious'&&this.detectionStarted.has(enemy))||!game.enemies.includes(enemy)||enemy.dead||game.state!=='playing'||channel.audio.ended||(channel.key==='radio'&&!isRadioActive(enemy)))this.stop(enemy);
  if(game.state!=='playing'){this.previous.clear();return;}
  for(const enemy of this.previous.keys())if(!game.enemies.includes(enemy))this.previous.delete(enemy);
  const candidates=[];
  for(const enemy of game.enemies){
   if(enemy.dead){this.previous.delete(enemy);continue;}
   const previous=this.previous.get(enemy);this.previous.set(enemy,enemy.state);let key=isRadioActive(enemy)?'radio':keys[enemy.state];if(key==='suspicious'&&this.detectionStarted.has(enemy))key=null;
   if(key&&(key==='radio'?isRadioActive(enemy)&&this.channels.get(enemy)?.key!=='radio':previous!==enemy.state))candidates.push({enemy,key});
  }
  candidates.sort((a,b)=>priority[b.key]-priority[a.key]||Math.abs(a.enemy.x-(game.player?.x||0))-Math.abs(b.enemy.x-(game.player?.x||0)));
  const next=candidates[0],active=[...this.channels.entries()][0];
  if(this.enabled&&next&&(!active||active[0]===next.enemy||priority[next.key]>priority[active[1].key])){
   for(const enemy of this.channels.keys())this.stop(enemy);
   const clip=next.key==='radio'?(next.enemy.radioClip??=pickVoice('radio',this.random)):pickVoice(next.key,this.random);
   const audio=this.makeAudio(assetUrl(clip.url));audio.volume=next.key==='radio'?.65:.45;
   if(next.key==='radio')audio.currentTime=Math.min(next.enemy.radio,.999)*clip.duration;
   this.channels.set(next.enemy,{audio,key:next.key,clip});audio.play().catch(()=>{});
  }
  for(const [enemy,channel] of this.channels)if(channel.key==='radio'){
   const expected=enemy.radio*channel.clip.duration;
   if(Number.isFinite(channel.audio.duration)&&Math.abs(channel.audio.currentTime-expected)>.2)channel.audio.currentTime=Math.min(expected,channel.audio.duration);
  }
 }
}
