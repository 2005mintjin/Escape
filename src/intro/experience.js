import {introDelta} from './warSequence.js';
import {WarView} from './warView.js';
import {WarAudio} from './warAudio.js';
import {IntroTransitionAudio} from '../audio/sceneAudio.js';
import {IntroStory} from './story.js';
import {HomeView} from './homeView.js';
import {IntroUI} from './interface.js';
import {TypeVoice} from './typeVoice.js';
export class IntroExperience{
 constructor(renderer,onComplete){this.story=new IntroStory();this.view=new HomeView(renderer);this.war=new WarView(renderer);this.warAudio=new WarAudio();this.voice=new TypeVoice();this.transition=new IntroTransitionAudio();this.onComplete=onComplete;this.ui=new IntroUI(this.story,{interact:()=>this.interact(),pause:()=>this.pause(),skip:()=>this.skip()});this.ready=Promise.all([this.view.ready,this.war.ready]);}
 get active(){return this.story.active;}
 start(){this.story.start();this.warmed=false;this.view.cameraX=this.story.x;this.voice.unlock();this.ui.clear();this.warAudio.stop();this.transition.stop();this.transition.update(this.story);this.ui.update(!!this.view.loaded);document.body.classList.add('in-prologue');document.querySelector('#menu').innerHTML='';document.querySelector('#menu').dataset.state='';}
 interact(){this.voice.unlock();this.story.interact();this.flushVoice();this.transition.update(this.story,document.hidden);}
 flushVoice(){for(let n=0;n<this.story.letterTicks;n++)this.voice.play();this.story.letterTicks=0;}
 pause(){this.story.togglePause();this.voice.stop();this.warAudio.update(this.story,document.hidden);this.transition.update(this.story,document.hidden);if(!this.story.paused)this.voice.unlock();this.ui.clear();}
 skip(){this.story.active=false;this.story.completed=false;this.warAudio.stop();this.transition.stop();this.voice.stop();this.ui.clear();this.ui.root.hidden=true;document.body.classList.remove('in-prologue');this.onComplete();}
 preview(dt){this.story.time+=dt;this.view.draw(this.story,dt);}
 update(dt,input,elapsed=dt){if(this.view.loaded&&(this.story.mode!=='cutscene'||this.war.loaded)&&!document.hidden)this.story.update(introDelta(this.story.mode,dt,elapsed),input.axis||this.ui.axis);if(this.story.paused||document.hidden)this.voice.stop();else this.flushVoice();const size=innerWidth+'x'+innerHeight,covered=['opening','warcard'].includes(this.story.mode)||this.story.photoHeld&&this.story.photoElapsed>.25;const changed=this.viewSize!==size;if(this.story.mode==='cutscene'){this.war.draw(this.story);}else if(!covered||!this.warmed||changed){this.view.draw(this.story,dt);if(this.view.loaded)this.warmed=true;this.viewSize=size;}this.warAudio.update(this.story,document.hidden);this.transition.update(this.story,document.hidden);this.ui.update(!!this.view.loaded&&(this.story.mode!=='cutscene'||this.war.loaded));if(this.story.completed){this.story.completed=false;this.warAudio.stop();this.transition.stop();this.voice.stop();this.ui.clear();document.body.classList.remove('in-prologue');this.ui.root.hidden=true;this.onComplete();}}
}
