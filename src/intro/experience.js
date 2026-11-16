import {IntroStory} from './story.js';
import {HomeView} from './homeView.js';
import {IntroUI} from './interface.js';
import {TypeVoice} from './typeVoice.js';
export class IntroExperience{
 constructor(renderer,onComplete){this.story=new IntroStory();this.view=new HomeView(renderer);this.voice=new TypeVoice();this.onComplete=onComplete;this.ui=new IntroUI(this.story,{interact:()=>this.interact(),pause:()=>this.pause()});this.ready=this.view.ready;}
 get active(){return this.story.active;}
 start(){this.story.start();this.voice.unlock();this.ui.clear();document.body.classList.add('in-prologue');document.querySelector('#menu').innerHTML='';document.querySelector('#menu').dataset.state='';}
 interact(){this.voice.unlock();this.story.interact();this.flushVoice();}
 flushVoice(){for(let n=0;n<this.story.letterTicks;n++)this.voice.play();this.story.letterTicks=0;}
 pause(){this.story.togglePause();this.voice.stop();this.ui.clear();}
 preview(dt){this.story.time+=dt;this.view.draw(this.story,dt);}
 update(dt,input){if(this.view.loaded&&!document.hidden)this.story.update(dt,input.axis||this.ui.axis);if(this.story.paused||document.hidden)this.voice.stop();else this.flushVoice();this.view.draw(this.story,dt);this.ui.update(!!this.view.loaded);if(this.story.completed){this.story.completed=false;this.voice.stop();this.ui.clear();document.body.classList.remove('in-prologue');this.ui.root.hidden=true;this.onComplete();}}
}
