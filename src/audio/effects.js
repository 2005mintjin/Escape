import {assetUrl} from '../core/assets.js';
const files={player:'/audio/player-shot.mp3',enemy:'/audio/enemy-shot.mp3',reload:'/audio/reload.mp3',escape:'/audio/escape-steps.mp3',panel:'/audio/panel-hit.mp3',light:'/audio/light-break.mp3',trap:'/audio/trap-impact.mp3'};
export class Effects {
 constructor(makeAudio=url=>new Audio(url)){this.makeAudio=makeAudio;this.active=new Set();this.seen=new WeakSet();this.player=null;this.lastReload=0;this.lastState=null;}
 play(key){const sound=this.makeAudio(assetUrl(files[key]));sound.volume=key==='reload'?.55:.65;this.active.add(sound);sound.onended=()=>this.active.delete(sound);sound.play().catch(()=>this.active.delete(sound));return sound;}
 update(game){
  if(this.player!==game.player){this.stop();this.player=game.player;this.lastReload=0;}
  if(game.state==='extracting'&&this.lastState!=='extracting')this.stop();this.lastState=game.state;
  if(game.state!=='playing'&&game.state!=='dying'&&game.state!=='extracting'){this.stop();return;}
  for(const event of game.soundEvents||[])if(!this.seen.has(event)){this.seen.add(event);this.play(event.key);}
  if(game.player.reload>0&&this.lastReload===0)this.play('reload');this.lastReload=game.player.reload;
 }
 stop(){for(const sound of this.active){sound.pause();sound.currentTime=0;}this.active.clear();}
}
