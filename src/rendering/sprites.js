import * as THREE from 'three';
import definitions from '../../data/spriteFrames.json' with {type:'json'};
export function makeSprite(){const s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,alphaTest:.2,depthTest:true}));s.visible=false;return s;}
export async function loadCharacters(){
 const sources=[...new Set(Object.values(definitions).flat().map(f=>f.source))];
 const images=Object.fromEntries(await Promise.all(sources.map(async source=>{const texture=await new THREE.TextureLoader().loadAsync('/sprites/'+source);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;return [source,texture];})));
 const bank=Object.fromEntries(Object.entries(definitions).map(([name,frames])=>[name,frames.map(data=>{
  const source=images[data.source],[x,y,w,h]=data.rect,W=source.image.width,H=source.image.height;
  const map=source.clone();map.repeat.set((w-1)/W,(h-1)/H);map.offset.set((x+.5)/W,1-(y+h-.5)/H);map.needsUpdate=true;
  const mirror=map.clone();mirror.repeat.x=-map.repeat.x;mirror.offset.x=(x+w-.5)/W;mirror.needsUpdate=true;
  return {...data,map,mirror};
 })]));
 return {player:bank,enemy:[bank.enemyRight,bank.enemyLeft,bank.enemyAction]};
}
export function applyFrame(sprite,frame,mirrored=false){
 const [, ,w,h]=frame.rect;sprite.material.map=mirrored?frame.mirror:frame.map;
 // One world scale per source pixel, for EVERY pose. Crouching changes the art, never its aspect ratio.
 sprite.scale.set(w*frame.unit,h*frame.unit,1);sprite.center.set(mirrored?1-frame.anchor/w:frame.anchor/w,0);sprite.visible=true;
}
