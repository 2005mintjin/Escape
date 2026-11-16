import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game,config} from '../src/core/game.js';
import {advanceDetection} from '../src/systems/detection.js';
import {Voices} from '../src/audio/voices.js';
import {guardIndicator} from '../src/ui/guardIndicator.js';
const step=(g,t,input={axis:0,crouch:true})=>{for(let n=0;n<t-1e-8;n+=.01)g.update(Math.min(.01,t-n),input);};
test('incomplete detection decays in cover; recognized guard keeps firing but concrete stops damage',()=>{
 const g=new Game();g.enemies=[g.enemies[0]];const e=g.enemies[0];g.player.x=15;Object.assign(e,{x:15,direction:1,meter:.5,hasDetectionStarted:true});
 step(g,.1);assert.ok(e.meter<.5);assert.equal(e.detected,false);e.meter=1;step(g,2.5);assert.equal(e.detected,true);assert.equal(e.meter,1);assert.equal(e.state,'Attack');assert.ok(g.soundEvents.filter(s=>s.key==='enemy').length>=3);assert.equal(g.player.health,3);
 g.reset();assert.equal(g.player.health,3);assert.ok(g.enemies.every(e=>!e.detected));
});
test('recognized guard in gap fires after reaction and damages only after bullet flight; three hits kill',()=>{const g=new Game();g.enemies=[g.enemies[0]];Object.assign(g.enemies[0],{x:11.5,meter:1});g.player.x=11.5;step(g,.84);assert.equal(g.player.health,3);step(g,.04);assert.equal(g.player.health,3);assert.ok(g.projectiles.length>0);step(g,.2);assert.equal(g.player.health,2);step(g,1.2);assert.equal(g.state,'dying');assert.equal(g.player.health,0);step(g,1);assert.equal(g.state,'dead');g.damagePlayer();assert.equal(g.player.health,0);});
test('pre-detection reaction leaves gauge empty, and happens only before first charging',()=>{const e={meter:0};assert.equal(advanceDetection(e,true,.1,config,false,.1),true);assert.equal(e.meter,0);advanceDetection(e,true,.5,config,false,.6);assert.ok(e.meter>0);assert.equal(e.hasDetectionStarted,true);e.meter=0;assert.equal(advanceDetection(e,true,.01,config,false,.61),false);assert.ok(e.meter>0);});
test('suspicion audio stops on first gauge increase and never returns even after pause',()=>{
 const made=[];const voice=new Voices(url=>{const a={url,paused:true,currentTime:0,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}};made.push(a);return a;});voice.unlock();const e={meter:0,state:'Suspicious'},game={state:'playing',enemies:[e]};voice.update(game);assert.equal(made.length,1);assert.equal(made[0].paused,false);
 e.meter=.01;voice.update(game);assert.equal(made[0].paused,true);e.state='Patrol';e.meter=0;voice.update(game);e.state='Suspicious';voice.update(game);assert.equal(made.length,1);
 game.state='paused';voice.update(game);game.state='playing';voice.update(game);assert.equal(made.length,1);
 const next={meter:0,state:'Suspicious'};game.enemies=[next];voice.update(game);assert.equal(made.length,2,'new stage can play suspicion again');
});
test('guard indicators use clipped shapes with no visible state text',()=>{const pos={x:100,y:80};const partial=guardIndicator({meter:.5,charging:true,state:'Suspicious'},0,pos);assert.match(partial,/aria-valuenow="50"/);assert.match(partial,/y="21"/);assert.ok(!partial.includes('%'));assert.match(guardIndicator({meter:1,detected:true,charging:true},1,pos),/guard-indicator detected/);assert.match(guardIndicator({meter:0,radio:.25,state:'Radio'},2,pos),/guard-indicator radio/);assert.match(guardIndicator({meter:0,radio:.25,state:'Radio'},2,pos),/aria-valuenow="25"/);});

test('exclamation appears only when gauge rises; idle, decay and full detection are hidden',()=>{const e={meter:0};const pos={x:0,y:0};assert.equal(guardIndicator(e,0,pos),'');advanceDetection(e,true,.1,config,false,.1);assert.equal(guardIndicator(e,0,pos),'');advanceDetection(e,true,.5,config,false,.6);assert.ok(guardIndicator(e,0,pos).includes('progressbar'));advanceDetection(e,false,.01,config,false,.61);assert.equal(guardIndicator(e,0,pos),'');e.meter=1;advanceDetection(e,false,.01,config,false,.62);assert.equal(guardIndicator(e,0,pos),'');assert.ok(guardIndicator({state:'Radio',radio:.3},0,pos).includes('radio'));});
test('three simultaneous projectiles deal separate hits after travel',()=>{const g=new Game();g.player.x=11.5;g.enemies=g.enemies.slice(0,3);g.enemies.forEach(e=>{e.x=11.5;e.meter=1;});step(g,.88);assert.equal(g.player.health,3);assert.equal(g.projectiles.length,3);step(g,.2);assert.equal(g.player.health,0);assert.equal(g.state,'dying');});
