import clips from '../../data/voices.json' with {type:'json'};
// One channel per guard. State reconciliation also stops voices on death/reset/pause.
export class Voices {
 constructor(makeAudio=url=>new Audio(url)){this.makeAudio=makeAudio;this.channels=new Map();this.previous=new Map();this.enabled=false;}
 unlock(){this.enabled=true;}
 stop(enemy){const ch=this.channels.get(enemy);if(ch){ch.audio.pause();ch.audio.currentTime=0;this.channels.delete(enemy);}}
 update(game){
  for(const enemy of this.channels.keys())if(!game.enemies.includes(enemy)||enemy.dead||game.state!=='playing')this.stop(enemy);
  if(game.state!=='playing'){this.previous.clear();return;}
  for(const enemy of this.previous.keys())if(!game.enemies.includes(enemy))this.previous.delete(enemy);
  for(const enemy of game.enemies){
   if(enemy.dead){this.stop(enemy);this.previous.delete(enemy);continue;}
   const previous=this.previous.get(enemy);this.previous.set(enemy,enemy.state);
   const key=enemy.state==='Radio'?'radio':enemy.state==='Alert'?'spotted':enemy.state==='Investigate'?'gunfire':enemy.state==='Suspicious'?'suspicious':null;
   let channel=this.channels.get(enemy);
   if(channel?.key==='radio'&&key!=='radio'){this.stop(enemy);channel=null;}
   if(!this.enabled)continue;
   if(key&&(previous!==enemy.state||(key==='radio'&&!channel))){
    this.stop(enemy);const audio=this.makeAudio(clips[key].url);audio.volume=key==='radio'?.65:.45;
    if(key==='radio')audio.currentTime=Math.min(enemy.radio,0.999)*clips.radio.duration;
    channel={audio,key};this.channels.set(enemy,channel);
    audio.play().catch(()=>{});
   }
   if(key==='radio'&&channel){const expected=enemy.radio*clips.radio.duration;if(Number.isFinite(channel.audio.duration)&&Math.abs(channel.audio.currentTime-expected)>.2)channel.audio.currentTime=Math.min(expected,channel.audio.duration);}
  }
 }
}
