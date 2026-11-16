import * as THREE from 'three';
import {assetUrl} from '../core/assets.js';
export async function textureHome(scene){
 const atlas=await new THREE.TextureLoader().loadAsync(assetUrl('/intro/home-textures.png')),image=atlas.image,W=image.width/4,H=image.height/2;
 const repeats=[[1,1],[9,2],[2,2],[2,2],[3,2],[2,2],[2,1],[2,2]];
 const maps=Array.from({length:8},(_,i)=>{const c=document.createElement('canvas');c.width=Math.floor(W)-4;c.height=Math.floor(H)-4;c.getContext('2d').drawImage(image,(i%4)*W+2,Math.floor(i/4)*H+2,W-4,H-4,0,0,c.width,c.height);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeats[i]);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;});atlas.dispose();
 const surfaces={'745239':[5,'#f6e9d3'],'3a2a21':[5,'#98836c'],'b9a88d':[1,'#fff3da'],'8b765c':[5,'#c6b595'],'d4c3a1':[3,'#fff0d4'],'eadcc0':[3,'#fff7e2'],'79543b':[2,'#f0d2b4'],'8b674d':[2,'#f4dfc1'],'896148':[2,'#e4c7a7'],'665f4e':[7,'#ded3ba'],'866146':[0,'#f3e5d0'],'78543d':[0,'#d5c3aa'],'9f8058':[4,'#e5d0b2'],'8f8170':[3,'#c1b49c'],'a89880':[3,'#ded1b4'],'6a6658':[3,'#9d9c8e'],'8c8472':[3,'#cbc1a9'],'b5ae96':[7,'#fff3dc'],'ded9c6':[6,'#fff6e8'],'e7ddc8':[6,'#f6efdd']};
 const seen=new Set();scene.traverse(node=>{if(!node.material)return;for(const material of Array.isArray(node.material)?node.material:[node.material]){if(seen.has(material)||!material.color)continue;seen.add(material);const entry=surfaces[material.color.getHexString()];if(entry){material.map=maps[entry[0]];material.color.set(entry[1]);material.needsUpdate=true;material.userData.homeTexture=entry[0];}}});return maps;
}
