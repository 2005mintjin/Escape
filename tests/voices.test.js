import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Voices} from '../src/audio/voices.js';
import {Game} from '../src/core/game.js';
import clips from '../data/voices.json' with {type:'json'};
test('voice transitions map clips; radio stops on death, pause and reset',()=>{
 const made=[];const voices=new Voices(url=>{const audio={url,currentTime:0,duration:clips.radio.duration,paused:true,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}};made.push(audio);return audio;});voices.unlock();
 const e={state:'Suspicious',radio:0,dead:false},game={state:'playing',enemies:[e]};voices.update(game);assert.equal(made[0].url,clips.suspicious.url);
 e.state='Investigate';voices.update(game);assert.equal(made.at(-1).url,clips.gunfire.url);
 e.state='Alert';voices.update(game);assert.equal(made.at(-1).url,clips.spotted.url);
 e.state='Radio';e.radio=.3;voices.update(game);const radio=made.at(-1);assert.equal(radio.url,clips.radio.url);assert.ok(radio.currentTime>0);assert.equal(radio.paused,false);
 e.dead=true;voices.update(game);assert.equal(radio.paused,true);assert.equal(radio.currentTime,0);
 e.dead=false;voices.update(game);const resumed=made.at(-1);game.state='paused';voices.update(game);assert.equal(resumed.paused,true);
 game.state='playing';voices.update(game);const old=made.at(-1);game.enemies=[];voices.update(game);assert.equal(old.paused,true);
});
test('radio follows clip duration and death screen waits one second',()=>{const g=new Game();g.enemies=g.enemies.slice(0,2);const [body,guard]=g.enemies;body.dead=true;body.x=15;guard.x=20;guard.direction=-1;g.update(3,{axis:0,crouch:true});assert.equal(g.lockdown,false);g.update(.32,{axis:0,crouch:true});assert.equal(g.lockdown,true);
 g.reset();g.enemies=[g.enemies[0]];g.player.x=17;g.enemies[0].direction=1;for(let i=0;i<100&&g.state==='playing';i++)g.update(.05,{axis:0,crouch:false});assert.equal(g.state,'dying');assert.equal(g.player.dead,true);const x=g.player.x;g.update(.99,{axis:1,crouch:false});assert.equal(g.state,'dying');assert.equal(g.player.x,x);g.update(.011,{axis:0,crouch:false});assert.equal(g.state,'dead');});
test('weapon switching gates attacks and resets on restart',()=>{const g=new Game();assert.equal(g.player.weapon,'rifle');assert.equal(g.knife(),false);g.switchWeapon();assert.equal(g.player.weapon,'knife');g.player.aiming=true;assert.equal(g.shoot({x:15,y:1.3,z:-3}),false);g.switchWeapon();assert.equal(g.player.weapon,'rifle');g.switchWeapon();g.reset();assert.equal(g.player.weapon,'rifle');});
