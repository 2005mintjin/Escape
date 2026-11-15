const files={player:'/audio/player-shot.mp3',enemy:'/audio/enemy-shot.mp3',reload:'/audio/reload.mp3'};
export class Effects {
 constructor(){this.active=new Set();this.seen=new WeakSet();this.player=null;this.lastReload=0;}
 play(key){const sound=new Audio(files[key]);sound.volume=key==='reload'?.55:.65;this.active.add(sound);sound.onended=()=>this.active.delete(sound);sound.play().catch(()=>this.active.delete(sound));return sound;}
 update(game){
  if(this.player!==game.player){this.stop();this.player=game.player;this.lastReload=0;}
  if(game.state!=='playing'&&game.state!=='dying'){this.stop();return;}
  if(game.player.reload>0&&this.lastReload===0)this.play('reload');this.lastReload=game.player.reload;
  for(const tracer of game.tracers)if(tracer.enemy&&!this.seen.has(tracer)){this.seen.add(tracer);this.play('enemy');}
 }
 stop(){for(const sound of this.active){sound.pause();sound.currentTime=0;}this.active.clear();}
}
