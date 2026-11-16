import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game,config} from '../src/core/game.js';
import {levels} from '../src/levels/campaign.js';
import {visible} from '../src/systems/detection.js';
import {exitOpen,inShadow} from '../src/systems/stageObjects.js';
const idle={axis:0,crouch:true};
function step(g,seconds,input=idle){for(let t=0;t<seconds-1e-8;t+=1/60)g.update(Math.min(1/60,seconds-t),input);}
test('crouched gap is visible through neighboring cover at rifle range but not beyond it',()=>{const p={x:11.5,z:3,crouch:true},g=new Game();assert.equal(visible({x:4,z:-3,direction:-1,range:14,fov:90},p,g.level.walls),true);assert.equal(visible({x:3,z:-3,direction:1,range:14,fov:160},p,g.level.walls),false);assert.equal(visible({x:15,z:-3,direction:-1,range:14,fov:130},{x:16,z:3,crouch:true},g.level.walls),false);});
test('Q dash/roll uses stamina and cooldown; pause and action guards prevent duplicate bursts',()=>{const g=new Game();g.enemies=[];assert.equal(g.dash({axis:1,crouch:false}),true);assert.equal(g.player.burst.rolling,false);assert.equal(g.dash(idle),false);step(g,.3);assert.ok(Math.abs(g.player.x-6.2)<.01);assert.ok(g.player.stamina<4);assert.equal(g.dash(idle),false);step(g,2.5);assert.equal(g.dash({axis:-1,crouch:true}),true);assert.equal(g.player.burst.rolling,true);step(g,.3);assert.ok(Math.abs(g.player.x-2)<.01);g.reset();g.player.stamina=.2;assert.equal(g.dash(idle),false);g.player.stamina=4;g.state='paused';assert.equal(g.dash(idle),false);});
test('panel interaction opens gate, crushes nearby guards at impact and resets on retry',()=>{const g=new Game();g.player.x=11.5;g.player.crouch=true;g.enemies=g.enemies.slice(0,1);g.enemies[0].x=18;g.enemies[0].speed=0;assert.equal(exitOpen(g),false);assert.equal(g.knife(),true);step(g,.34);assert.equal(g.panels[0].active,true);assert.equal(g.enemies[0].dead,false);step(g,.32);assert.equal(g.enemies[0].dead,true);assert.equal(exitOpen(g),true);g.reset();assert.equal(g.panels[0].active,false);assert.equal(g.stageIndex,0);});
test('lights are hit by actual shot ray within gun range; stage objectives gate tunnel',()=>{const g=new Game();g.stageIndex=1;g.reset();g.enemies=[];g.player.x=2;g.player.aiming=true;g.shoot(g.lamps[0]);assert.equal(g.lamps[0].broken,true);assert.equal(exitOpen(g),false);assert.equal(inShadow({...g,player:{x:9}}),true);g.player.x=15;g.player.shot=0;g.player.aiming=true;g.shoot(g.lamps[1]);assert.equal(g.lamps[1].broken,true);assert.equal(exitOpen(g),true);g.player.x=54;g.update(.01,idle);assert.equal(g.state,'clear');assert.equal(g.nextStage(),true);assert.equal(g.stageIndex,2);assert.equal(g.player.health,3);assert.ok(g.lamps.every(l=>!l.broken));g.reset();assert.equal(g.stageIndex,2);});
test('arsenal control requires lights first and campaign cannot skip closed exits',()=>{const g=new Game();g.stageIndex=2;g.reset();g.enemies=[];g.player.x=24.5;g.knife();step(g,.7);assert.equal(g.panels[0].active,false);g.player.x=56;g.update(.01,idle);assert.equal(g.state,'playing');g.state='clear';assert.equal(g.nextStage(),false);g.startCampaign();assert.equal(g.stageIndex,0);assert.equal(g.level,levels[0]);});
// Complete all objectives with living patrol AI, normal damage and normal ammunition.
test('all three stages can be completed using cover, roll, shooting lights and knife controls',()=>{
 const g=new Game(()=>0),input={axis:1,crouch:true};
 const tick=(s=1/60,i=idle)=>{step(g,s,i);assert.ok(g.state==='playing'||g.state==='clear',`stage ${g.stageIndex+1} died at ${g.player.x.toFixed(2)}`);};
 const walk=x=>{for(let n=0;Math.abs(g.player.x-x)>.04&&n<4000&&g.state==='playing';n++)tick(1/60,{axis:Math.sign(x-g.player.x),crouch:true});};
 const burst=()=>{while(g.player.dashCooldown>0||g.player.stamina<config.dashCost)tick();assert.equal(g.dash(input),true);while(g.player.burst&&g.state==='playing')tick();};
 const navigate=x=>{const gaps=g.level.walls.map((w,i)=>({start:w.max.x,end:g.level.walls[i+1]?.min.x??g.level.length}));for(const gap of gaps)if(g.player.x<gap.end&&x>gap.start-.5&&g.state==='playing'){walk(gap.start-.5);burst();}if(g.state==='playing')walk(x);};
 const shoot=lamp=>{while(g.player.shot>0)tick();g.player.aiming=true;assert.equal(g.shoot(lamp,g.enemies.filter(e=>Math.abs(e.x-g.player.x)<15)),true);assert.equal(lamp.broken,true);tick();};
 const control=()=>{const panel=g.panels[0],wall=g.level.walls.find(w=>w.max.x<panel.x&&panel.x-w.max.x<4);navigate(wall.max.x-2);burst();assert.ok(Math.abs(g.player.x-panel.x)<config.knifeReach);assert.equal(g.knife(),true);while(g.player.melee&&g.state==='playing')tick();walk(g.level.walls.find(w=>w.min.x>panel.x).min.x+.3);assert.equal(panel.active,true);};
 control();navigate(g.level.exit);assert.equal(g.state,'clear');assert.equal(g.nextStage(),true);
 shoot(g.lamps[0]);navigate(15);shoot(g.lamps[1]);navigate(g.level.exit);assert.equal(g.state,'clear');assert.equal(g.nextStage(),true);
 navigate(3);shoot(g.lamps[0]);control();navigate(g.level.exit);assert.equal(g.state,'clear');assert.equal(g.stageIndex,2);assert.ok(g.player.health>0);
});
