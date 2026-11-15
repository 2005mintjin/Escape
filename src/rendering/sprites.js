import * as THREE from 'three';
// Load once and share the decoded image between UV frames. No per-frame canvas work.
export async function loadAtlas(url,columns,rows){
 const image=await new THREE.TextureLoader().loadAsync(url);image.colorSpace=THREE.SRGBColorSpace;image.magFilter=THREE.NearestFilter;image.minFilter=THREE.LinearFilter;image.generateMipmaps=false;
 return rows.map(([top,bottom,count=columns])=>Array.from({length:count},(_,column)=>{const t=image.clone();t.repeat.set(1/columns,bottom-top);t.offset.set(column/columns,1-bottom);t.needsUpdate=true;return t;}));
}
export function makeSprite(){const s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,alphaTest:.15,depthTest:true}));s.visible=false;s.center.set(.5,0);s.scale.set(2.4,2.5,1);return s;}
export async function loadCharacters(){
 const [player,enemy]=await Promise.all([loadAtlas('/sprites/player.png',4,[[0,270/1536],[280/1536,512/1536],[512/1536,775/1536],[775/1536,1024/1536],[1024/1536,1282/1536],[1282/1536,1]]),loadAtlas('/sprites/enemies.png',8,[[0,.31],[.325,.625],[.64,.99]])]);
 return {player:Object.fromEntries(['idle','crouch','walk','run','aim','shoot'].map((name,i)=>[name,player[i]])),enemy};
}
