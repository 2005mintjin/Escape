import {test} from 'node:test';
import assert from 'node:assert/strict';
import {enemyDeathFrame,EnemyDeathClock} from '../src/rendering/enemyAnimation.js';
import combat from '../data/spriteFrames.json' with {type:'json'};
import cinematic from '../data/cutsceneFrames.json' with {type:'json'};
test('enemy fall advances once and holds the lying corpse rather than wrapping',()=>{assert.equal(enemyDeathFrame(-1,6),0);assert.equal(enemyDeathFrame(.31,6),2);assert.equal(enemyDeathFrame(.75,6),5);assert.equal(enemyDeathFrame(50,6),5);});
test('death clock freezes with game time and resets for a revived or restarted enemy',()=>{const c=new EnemyDeathClock(),a={};assert.equal(c.frame(a,10,6),0);assert.equal(c.frame(a,10.3,6),2);assert.equal(c.frame(a,10.3,6),2);assert.equal(c.frame(a,12,6),5);c.alive(a);assert.equal(c.frame(a,20,6),0);assert.equal(c.frame({},20,6),0);});
test('combat and cutscene share the six fall images, preserving per-sequence pixel scale and lower corpse silhouette',()=>{assert.equal(combat.enemyDeath.length,6);assert.equal(cinematic.guardDeath.length,6);for(let i=0;i<6;i++){assert.deepEqual(combat.enemyDeath[i].rect,cinematic.guardDeath[i].rect);assert.equal(combat.enemyDeath[i].unit,combat.enemyDeath[0].unit);assert.equal(cinematic.guardDeath[i].unit,cinematic.guardDeath[0].unit);}assert.ok(combat.enemyDeath.at(-1).rect[3]<combat.enemyDeath[0].rect[3]*.45);});
