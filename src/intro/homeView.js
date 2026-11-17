import {loadTexture,sourceSize} from '../rendering/textures.js';
import * as THREE from 'three';
import {homeFurniture} from './homeFurniture.js';
import {textureHome} from './textures.js';
import {assetUrl} from '../core/assets.js';
import {makeSprite,applyFrame} from '../rendering/sprites.js';
import frames from '../../data/introFrames.json' with {type:'json'};
import {HOME} from './story.js';
export class HomeView{
 constructor(renderer){this.renderer=renderer;this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-8,8,4,-4,.1,80);this.cameraX=HOME.startX;this.build();this.player=makeSprite();this.npc=makeSprite();this.scene.add(this.player,this.npc);this.npc.position.set(HOME.npcX,0,1.2);this.ready=this.load();}
 async load(){const textures={};for(const source of new Set(Object.values(frames).flat().map(f=>f.source))){const t=await loadTexture('/intro/'+source);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;textures[source]=t;}this.bank=Object.fromEntries(Object.entries(frames).map(([key,list])=>[key,list.map(f=>{const t=textures[f.source],[W,H]=sourceSize(t),[x,y,w,h]=f.rect,map=t.clone();map.repeat.set((w-1)/W,(h-1)/H);map.offset.set((x+.5)/W,1-(y+h-.5)/H);map.needsUpdate=true;const mirror=map.clone();mirror.repeat.x=-map.repeat.x;mirror.offset.x=(x+w-.5)/W;mirror.needsUpdate=true;return {...f,map,mirror};})]));const memory=await loadTexture('/intro/memory-photo.png');memory.colorSpace=THREE.SRGBColorSpace;this.photo.material.map=memory;this.photo.material.needsUpdate=true;Object.assign(this,await homeFurniture(this.scene));this.textures=await textureHome(this.scene);this.textures[0].repeat.set(10,4);this.loaded=true;}
 build(){const s=this.scene;
 const box=(x,y,z,w,h,d,color)=>{const node=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.9}));node.position.set(x,y,z);node.userData.homeShell=true;s.add(node);return node;};
 s.add(new THREE.HemisphereLight('#fff7e8','#444a4c',1.65));const sun=new THREE.DirectionalLight('#fff0dc',1.45);sun.position.set(0,7,6);s.add(sun);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,9),new THREE.MeshStandardMaterial({color:'#866146',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.set(13,0,.5);floor.userData.homeShell=true;s.add(floor);
 box(13,2.4,-2.7,26,4.8,.2,'#b9a88d');box(13,.63,-2.54,26,1.25,.11,'#8b765c');box(13,.08,-2.42,26,.14,.12,'#3a2a21');box(13,1.24,-2.4,26,.08,.13,'#745239');box(.1,2.4,.4,.2,4.8,6.3,'#745239');box(25.9,2.4,.4,.2,4.8,6.3,'#745239');box(13,4.65,-1.4,26,.25,2.9,'#3a2a21');
 for(const x of [1,7,14.8,25])box(x,2.5,-2.39,.13,4.25,.2,'#745239');
 for(const x of [4.8,12.5,22.2]){const light=new THREE.PointLight('#ffd59d',6,9,1.4);light.position.set(x,3.65,-.6);s.add(light);}
 this.photo=new THREE.Mesh(new THREE.PlaneGeometry(.42,.56),new THREE.MeshBasicMaterial({color:'#dfd5bf',side:THREE.DoubleSide}));s.add(this.photo);this.photo.visible=false;
 }
 draw(story,dt){const aspect=innerWidth/innerHeight,half=3.65;this.camera.left=-half*aspect;this.camera.right=half*aspect;this.camera.top=half;this.camera.bottom=-half;this.camera.updateProjectionMatrix();const wanted=Math.max(half*aspect+.3,Math.min(HOME.length-half*aspect-.3,story.x));this.cameraX+=(wanted-this.cameraX)*(1-Math.exp(-dt*4));this.camera.position.set(this.cameraX,3.25,18);this.camera.lookAt(this.cameraX,1.75,0);this.camera.updateMatrixWorld();this.renderer.setClearColor('#211b17');
  if(!this.loaded){this.renderer.render(this.scene,this.camera);return;}this.tie.visible=story.drawerOpen>.2&&!story.hasTie;this.tie.position.z=-.97+story.drawerOpen*.5;
  this.photo.visible=story.photoFall>0&&!story.photoHeld;const fall=story.photoFall;this.photo.position.set(HOME.drawerX+.2+fall*.35,.8*(1-fall)+.065,-.7+fall*1.1);this.photo.rotation.set(-Math.PI/2*fall,0,Math.sin(fall*Math.PI)*.8);
  if(this.bank){const name=story.photoHeld?'hold':story.mode==='action'?'reach':story.moving?'walk':'idle',list=this.bank[name];applyFrame(this.player,list[Math.floor(story.time*(story.moving?7:3))%list.length],story.direction===-1);this.player.position.set(story.x,0,3);const npc=this.bank.npc;applyFrame(this.npc,npc[Math.floor(story.time*3)%npc.length]);this.player.userData.animation=name;this.npc.userData.animation='smoking';}
  this.renderer.render(this.scene,this.camera);
 }
}
