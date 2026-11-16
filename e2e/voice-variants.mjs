import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage();await page.goto('http://localhost:5173/');await page.getByRole('button',{name:'작전 시작'}).click();const result=await page.evaluate(async()=>{
 const {Voices}=await import('/src/audio/voices.js');const {default:catalog}=await import('/data/voices.json');const states={suspicious:'Suspicious',spotted:'Alert',gunfire:'Investigate',radio:'Radio'},played=[];
 for(const [key,entry] of Object.entries(catalog))for(let i=1;i<entry.variants.length;i++){
  const clip=entry.variants[i],voice=new Voices(undefined,()=>(i+.5)/entry.variants.length);voice.unlock();const enemy={state:states[key],meter:0,radio:0};const game={state:'playing',enemies:[enemy]};voice.update(game);const channel=voice.channels.get(enemy);if(channel.clip.url!==clip.url)throw new Error('wrong random variant');await channel.audio.play();await new Promise(resolve=>setTimeout(resolve,80));if(channel.audio.paused||channel.audio.currentTime<=0)throw new Error('MP3 did not play');if(Math.abs(channel.audio.duration-clip.duration)>.1)throw new Error('duration mismatch');enemy.dead=true;voice.update(game);if(!channel.audio.paused)throw new Error('voice did not stop on death');played.push(clip.url);
 }return played;
});assert.equal(result.length,6);console.log('PASS: all six new random voice variants actually play, metadata durations match and death stops playback');}finally{await browser.close();}
