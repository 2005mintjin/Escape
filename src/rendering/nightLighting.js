import * as THREE from 'three';
export const lampPositions=[6,19,34,48];
export function setupNightLighting(scene){
 scene.fog=new THREE.Fog('#0b121e',24,94);
 scene.add(new THREE.HemisphereLight('#7892ba','#13151b',.38));
 const moon=new THREE.DirectionalLight('#8ba4d0',.5);moon.position.set(-12,18,-9);scene.add(moon);
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),radial=g.createRadialGradient(32,32,0,32,32,32);radial.addColorStop(0,'rgba(255,218,146,.75)');radial.addColorStop(.2,'rgba(255,193,95,.22)');radial.addColorStop(1,'rgba(255,180,80,0)');g.fillStyle=radial;g.fillRect(0,0,64,64);const glow=new THREE.CanvasTexture(c);
 for(const x of lampPositions){
  const light=new THREE.SpotLight('#ffcf8c',180,19,.63,.8,1.5);light.position.set(x,3.05,-7.8);light.target.position.set(x+.8,0,1);light.userData.stageLamp=true;scene.add(light,light.target);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:'#ffe2a4'}));bulb.position.copy(light.position);scene.add(bulb);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));halo.position.copy(light.position);halo.scale.set(1,1,1);scene.add(halo);
  const lantern=new THREE.PointLight('#ffbe70',7,5,1.5);lantern.position.copy(light.position);scene.add(lantern);
 }
 // Small lights in surviving windows break up the dark facades.
 for(const x of [1,25,43,58]){const light=new THREE.PointLight('#d18b55',9,7,1.5);light.position.set(x,2.2,-13);scene.add(light);const window=new THREE.Mesh(new THREE.PlaneGeometry(.3,.5),new THREE.MeshBasicMaterial({color:'#986c3b'}));window.position.set(x,2.2,-12.9);scene.add(window);}
}
export function tintCharacter(material,x,flash=false){
 const pool=Math.max(...lampPositions.map(lamp=>Math.exp(-(((x-lamp)/4.5)**2))));
 material.color.setRGB(.42+pool*.48,.49+pool*.35,.61+pool*.2);
 if(flash)material.color.set('#ffe5ab');
}
