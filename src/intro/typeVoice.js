import {assetUrl} from '../core/assets.js';
// Decode the supplied MP3 once; every non-space character starts the same short sample.
export class TypeVoice{
 constructor(){this.context=null;this.buffer=null;this.current=null;this.starts=0;}
 async unlock(){if(!this.context){const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;this.context=new Context();this.ready=fetch(assetUrl('/audio/adele-type.mp3')).then(r=>{if(!r.ok)throw new Error('type voice unavailable');return r.arrayBuffer();}).then(b=>this.context.decodeAudioData(b)).then(buffer=>{this.buffer=buffer;}).catch(()=>{});}await this.context.resume();}
 play(){if(!this.buffer||this.context.state!=='running')return;this.stop();const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=this.buffer;gain.gain.value=.25;source.connect(gain);gain.connect(this.context.destination);source.start(0,.02);this.current=source;this.starts++;source.onended=()=>{source.disconnect();gain.disconnect();if(this.current===source)this.current=null;};}
 stop(){if(this.current){try{this.current.stop();}catch{}this.current=null;}}
}
