import {loadTexture,sourceSize} from '../rendering/textures.js';
import * as THREE from 'three';
import {assetUrl} from '../core/assets.js';
export async function textureHome(scene){
 const atlas=await loadTexture('/intro/home-textures.png'),image=atlas.image,W=image.width/4,H=image.height/2;
 const repeats=[[1,1],[9,2],[2,2],[2,2],[3,2],[2,2],[2,1],[2,2]];
 const maps=Array.from({length:8},(_,i)=>{const c=document.createElement('canvas');c.width=Math.floor(W)-4;c.height=Math.floor(H)-4;const context=c.getContext('2d');context.filter=[1,2,3,7].includes(i)?'grayscale(1)':'none';context.drawImage(image,(i%4)*W+2,Math.floor(i/4)*H+2,W-4,H-4,0,0,c.width,c.height);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeats[i]);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;});atlas.dispose();
 const surfaces={'745239':[5,'#8d745a'],'3a2a21':[5,'#514b44'],'b9a88d':[1,'#c8d4d8'],'8b765c':[5,'#89918b'],'d4c3a1':[3,'#e8dfc5'],'eadcc0':[3,'#f4edda'],'79543b':[2,'#47645c'],'8b674d':[2,'#58746b'],'896148':[2,'#4a655d'],'665f4e':[7,'#ded3ba'],'866146':[0,'#b29c7e'],'78543d':[0,'#95826d'],'9f8058':[4,'#8c9b9c'],'8f8170':[3,'#c1b49c'],'a89880':[3,'#ded1b4'],'6a6658':[3,'#9d9c8e'],'8c8472':[3,'#cbc1a9'],'b5ae96':[7,'#fff3dc'],'ded9c6':[6,'#fff6e8'],'e7ddc8':[6,'#f6efdd']};
 const seen=new Set();scene.traverse(node=>{if(!node.material)return;for(const material of Array.isArray(node.material)?node.material:[node.material]){if(seen.has(material)||!material.color)continue;seen.add(material);const entry=surfaces[material.color.getHexString()];if(entry){material.map=maps[entry[0]];material.color.set(entry[1]);material.needsUpdate=true;material.userData.homeTexture=entry[0];if(material.color.getHexString()==='fff3dc'){material.map=null;material.color.set('#d6e0dc');material.roughness=.3;material.metalness=.15;material.userData.homeTexture='enamel';}}}});return maps;
}
