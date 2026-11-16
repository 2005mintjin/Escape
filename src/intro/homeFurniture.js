import * as THREE from 'three';
import {assetUrl} from '../core/assets.js';
import frames from '../../data/homeFurniture.json' with {type:'json'};
export async function homeFurniture(scene){
 const [atlas,drawerAtlas]=await Promise.all(['furniture.png','drawer-aligned.png'].map(name=>new THREE.TextureLoader().loadAsync(assetUrl('/intro/'+name))));for(const t of [atlas,drawerAtlas]){t.colorSpace=THREE.SRGBColorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;}
 const place=(name,x,y,z,height)=>{const source=frames[name].source?drawerAtlas:atlas,[a,b,w,h]=frames[name].rect,W=source.image.width,H=source.image.height,map=source.clone();map.repeat.set((w-1)/W,(h-1)/H);map.offset.set((a+.5)/W,1-(b+h-.5)/H);map.needsUpdate=true;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.9}));sprite.center.set(.5,0);sprite.scale.set(height*w/h,height,1);sprite.position.set(x,y,z);sprite.userData.furniture=name;scene.add(sprite);return sprite;};
 place('window',2.7,1.8,-2.25,2.6);place('bed',2.6,0,-.7,1.9);place('wardrobe',5.8,0,-1.2,3.3);place('bookcase',8.3,0,-1.4,3.35);place('sofa',11.5,0,-.4,2.05);place('coffee',11.4,0,1.4,1.4);place('dining',18.3,0,-.1,2.05);place('fridge',20.4,0,-1,3.15);place('kitchen',23.3,0,-1.25,4.05);place('pictures',11.6,2.65,-2.25,1.3);place('pictures',16,2.7,-2.25,.8);
 for(const x of [4.8,12.5,22.2])place('lamp',x,3.8,-.6,.85);
 const drawer=new THREE.Group();drawer.position.set(8.3,.18,-1.05);scene.add(drawer);
 // The front face is the exact same fixed sprite in both states; only the symmetric interior appears behind it.
 const closed=place('drawerClosed',0,0,.002,1.62*267/862),open=place('drawer',0,closed.scale.y-.018,0,1.62*110/888);drawer.add(open,closed);open.visible=false;
 const updateDrawer=progress=>{open.visible=progress>.2;closed.visible=true;};
 // A small pixel drawing for the tie is a rendering primitive, like the stage's sign canvases.
 const c=document.createElement('canvas');c.width=12;c.height=32;const g=c.getContext('2d');g.fillStyle='#34405a';g.fillRect(4,1,4,5);g.fillRect(3,7,6,20);g.fillRect(4,27,4,3);const tie=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true}));tie.center.set(.5,0);tie.scale.set(.13,.35,1);tie.position.set(8.3,.4,-.9);scene.add(tie);return {drawer,tie,updateDrawer};
}
