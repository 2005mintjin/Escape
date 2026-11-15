import * as THREE from 'three';
import {lampPositions} from './nightLighting.js';
import {level} from '../levels/level01.js';
// UV rectangles select individual source pieces; collision walls remain the actual 3D solids.
function piece(source,[x,y,w,h]){const t=source.clone(),W=source.image.width,H=source.image.height;t.repeat.set((w-1)/W,(h-1)/H);t.offset.set((x+.5)/W,1-(y+h-.5)/H);t.needsUpdate=true;return t;}
export async function buildEnvironment(scene){
 const loader=new THREE.TextureLoader();const [tiles,props,walls,buildings,backdrop]=await Promise.all(['materials','props','walls','buildings','reference'].map(name=>loader.loadAsync('/environment/'+name+'.png')));
 for(const t of [tiles,props,walls,buildings,backdrop]){t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;}
 const xs=[7,168,322,477,634,788,944,1102],ys=[7,168,322,474,628,782,916,1077],widths=[148,144,145,145,145,145,146,144],heights=[152,145,145,145,145,126,151,165];
 const tile=(col,row)=>piece(tiles,[xs[col]+3,ys[row]+3,widths[col]-6,heights[row]-6]);
 const materials={brick:new THREE.MeshStandardMaterial({map:tile(1,0),roughness:1}),stone:new THREE.MeshStandardMaterial({map:tile(0,3),roughness:1}),plaster:new THREE.MeshStandardMaterial({map:tile(3,1),roughness:1}),floor:new THREE.MeshStandardMaterial({map:tile(1,7),roughness:1}),curb:new THREE.MeshStandardMaterial({map:tile(0,6),roughness:1})};
 const box=(x,y,z,w,h,d,material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.userData.environment=true;scene.add(mesh);return mesh;};
 const panel=(texture,x,y,z,w,h)=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({roughness:1,map:texture,transparent:true,alphaTest:.3,side:THREE.DoubleSide}));mesh.position.set(x,y+h/2,z);mesh.userData.environment=true;scene.add(mesh);return mesh;};
 // Distant reference matte behind real facades supplies the ruined cathedral and smoke skyline.
 const skyline=panel(backdrop,28,-48,-54,160,90);skyline.material=new THREE.MeshBasicMaterial({map:backdrop,color:'#25354c',fog:true});
 for(let x=-8;x<68;x+=2)for(let z=-22;z<8;z+=2){const ground=new THREE.Mesh(new THREE.PlaneGeometry(2,2),z>1?materials.curb:materials.floor);ground.rotation.x=-Math.PI/2;ground.position.set(x,.015,z);ground.userData.environment=true;scene.add(ground);}
 // Broken 3D buildings: floors, pillars, partial walls and missing bays give depth through windows.
 for(let i=0;i<10;i++){
  const x=i*8-8,z=i%2?-16:-21,stories=2+i%3;
  for(let floor=0;floor<stories;floor++){
   const y=floor*2.8;
   box(x,y+.08,z,6.2,.16,4.5,materials.stone);
   box(x-2.8,y+1.4,z+2,.5,2.8,.65,materials.stone);box(x+2.8,y+1.4,z+2,.5,2.8,.65,materials.brick);
   for(let bay=0;bay<4;bay++)box(x-1.95+bay*1.3,y+.6,z+2,1.3,1.2,.6,floor%2?materials.plaster:materials.brick);
   if(floor<stories-1)box(x,y+2.65,z+2,5.7,.3,.65,materials.stone);
   for(const offset of [-1.5,1.5])panel(piece(buildings,[18,555,110,136]),x+offset,y+1.2,z+2.34,1.25,1.5);
   box(x-2.7,y+1.4,z-1.5,.5,2.8,3.8,materials.brick);
  }
  box(x-1.6,stories*2.8+.5,z+2,2.5,1,.65,materials.brick);
  panel(piece(buildings,[463,710,198,185]),x+3,.02,z+4,3.8,3.55);
 }
 // The cover has solid volume plus source wall facing panels; every segment stays intact for gameplay.
 for(const wall of level.walls){const a=wall.min.x,b=wall.max.x;box((a+b)/2,.625,0,b-a,1.25,.9,materials.stone);
  for(let x=a;x<b;x+=2.4){const width=Math.min(2.4,b-x);panel(piece(walls,[24,266,253,93]),x+width/2,.03,.462,width,1.16);box(x+width/2,1.25,0,width,.09,1,materials.stone);}
 }
 const items={rubble:[280,85,225,112],sandbags:[615,525,303,104],crate:[15,650,113,105],barrel:[742,644,77,115],lamp:[18,756,69,227],sign:[438,800,110,180],barrier:[1038,822,205,164]};
 const prop=(name,x,z,width)=>{const rect=items[name],height=width*rect[3]/rect[2];const sprite=new THREE.Sprite(new THREE.SpriteMaterial({color:'#65748a',map:piece(props,rect),transparent:true,alphaTest:.3}));sprite.center.set(.5,0);sprite.position.set(x,.03,z);sprite.scale.set(width,height,1);sprite.userData.environment=true;scene.add(sprite);};
 for(let i=0;i<14;i++){prop('rubble',i*4.8-4,-8-(i%3),1.8);if(i%3===0)prop('sandbags',i*4.8,-6.5,2.6);}
 for(const x of lampPositions){prop('lamp',x,-8,1);prop('crate',x+1,-7,1.15);prop('barrel',x+2,-7,0.7);}
 prop('sign',52,4.5,1.1);prop('barrier',26,-7,2);prop('rubble',8,6.5,1.5);prop('rubble',35,6.6,1.6);
 return materials;
}
