import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game,config} from '../src/core/game.js';
import {advanceDetection} from '../src/systems/detection.js';
import {Voices} from '../src/audio/voices.js';
import {guardIndicator} from '../src/ui/guardIndicator.js';
test('incomplete detection decays in cover; full detection persists and fires into cover',()=>{
 const g=new Game();g.enemies=[g.enemies[0]];const e=g.enemies[0];g.player.x=15;e.x=15;e.direction=1;e.meter=.5;e.hasDetectionStarted=true;
 g.update(.1,{axis:0,crouch:true});assert.ok(e.meter<.5);assert.equal(e.detected,false);
 e.meter=1;g.update(.05,{axis:0,crouch:true});assert.equal(e.detected,true);assert.equal(e.state,'Alert');
 g.update(.85,{axis:0,crouch:true});assert.equal(e.meter,1);assert.equal(e.state,'Attack');assert.equal(g.state,'playing');assert.equal(g.tracers.length,1);assert.ok(g.tracers[0].b.z<=-.45&&g.tracers[0].b.z>-.46,'bullet ends at guard-facing side of cover');
 for(let i=0;i<65;i++)g.update(.05,{axis:0,crouch:true});assert.equal(e.meter,1);assert.equal(e.state,'Attack');assert.equal(g.player.dead,false);
 g.reset();assert.ok(g.enemies.every(e=>!e.detected&&!e.hasDetectionStarted));
});
test('recognized guard fires at crouching player in a gap after reaction delay',()=>{const g=new Game();g.enemies=[g.enemies[0]];const e=g.enemies[0];e.x=11.5;g.player.x=11.5;e.meter=1;g.update(.05,{axis:0,crouch:true});assert.equal(g.state,'playing');g.update(.85,{axis:0,crouch:true});assert.equal(g.state,'dying');assert.equal(g.player.dead,true);});
test('pre-detection reaction leaves gauge empty, and happens only before first charging',()=>{const e={meter:0};assert.equal(advanceDetection(e,true,.1,config,false,.1),true);assert.equal(e.meter,0);advanceDetection(e,true,.5,config,false,.6);assert.ok(e.meter>0);assert.equal(e.hasDetectionStarted,true);e.meter=0;assert.equal(advanceDetection(e,true,.01,config,false,.61),false);assert.ok(e.meter>0);});
test('suspicion audio stops on first gauge increase and never returns even after pause',()=>{
 const made=[];const voice=new Voices(url=>{const a={url,paused:true,currentTime:0,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}};made.push(a);return a;});voice.unlock();const e={meter:0,state:'Suspicious'},game={state:'playing',enemies:[e]};voice.update(game);assert.equal(made.length,1);assert.equal(made[0].paused,false);
 e.meter=.01;voice.update(game);assert.equal(made[0].paused,true);e.state='Patrol';e.meter=0;voice.update(game);e.state='Suspicious';voice.update(game);assert.equal(made.length,1);
 game.state='paused';voice.update(game);game.state='playing';voice.update(game);assert.equal(made.length,1);
 const next={meter:0,state:'Suspicious'};game.enemies=[next];voice.update(game);assert.equal(made.length,2,'new stage can play suspicion again');
});
test('guard indicators use clipped shapes with no visible state text',()=>{const pos={x:100,y:80};const partial=guardIndicator({meter:.5,state:'Suspicious'},0,pos);assert.match(partial,/aria-valuenow="50"/);assert.match(partial,/y="21"/);assert.ok(!partial.includes('%'));assert.match(guardIndicator({meter:1,detected:true},1,pos),/guard-indicator detected/);assert.match(guardIndicator({meter:0,radio:.25,state:'Radio'},2,pos),/guard-indicator radio/);assert.match(guardIndicator({meter:0,radio:.25,state:'Radio'},2,pos),/aria-valuenow="25"/);});
