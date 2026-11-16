import * as THREE from 'three';
import {tutorialLessons} from '../systems/tutorial.js';
export function createTutorialView(root,level){
 const boards=[];const label=(text,x,y,z)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#242419';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#b8a77a';ctx.lineWidth=5;ctx.strokeRect(3,3,506,90);ctx.fillStyle='#e1d2a9';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,60);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.position.set(x,y,z);s.scale.set(2.6,.49,1);root.add(s);return s;};
 for(const [i,e] of level.guards.entries())boards.push({target:e.id,node:label(['01 소총 표적','02 권총 표적','03 칼 표적','04 함정 표적'][i],e.x,3.4,-3)});
 const gate=new THREE.Group();root.add(gate);for(const z of [1.3,4.7]){const p=new THREE.Mesh(new THREE.BoxGeometry(.12,1.15,.12),new THREE.MeshStandardMaterial({color:'#ba995d'}));p.position.set(0,.57,z);gate.add(p);}const tape=new THREE.Mesh(new THREE.BoxGeometry(.07,.13,3.4),new THREE.MeshBasicMaterial({color:'#d6bb6b'}));tape.position.set(0,.9,3);gate.add(tape);const sign=label('연습 완료 후 통과',0,2.5,3);
 return {update(game){for(const {target,node} of boards){const e=game.enemies.find(e=>e.id===target);node.visible=!!e&&!e.dead;node.material.color.set(tutorialLessons[game.tutorial.step].target===target?'#ffffff':'#969688');}gate.visible=sign.visible=!game.tutorial.complete;gate.position.x=sign.position.x=tutorialLessons[game.tutorial.step].maxX+.15;}};
}
