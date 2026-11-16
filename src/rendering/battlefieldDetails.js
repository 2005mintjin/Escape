import * as THREE from 'three';
// Decorative geometry stays behind the patrol lane or below foreground feet.
// Cover, gaps, interactive lights and traps remain the level's gameplay objects.
export function addBattlefieldDetails(scene,level,{box,materials,prop}){
 const mark=node=>{node.userData.environment=true;scene.add(node);return node;};
 const board=(text,x,y,z,width=1.5)=>{const canvas=document.createElement('canvas');canvas.width=384;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#272820';ctx.fillRect(0,0,384,128);ctx.strokeStyle='#8f8060';ctx.lineWidth=8;ctx.strokeRect(6,6,372,116);ctx.fillStyle='#cebd91';ctx.textAlign='center';ctx.font='bold 33px monospace';ctx.fillText(text,192,80);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width/3),new THREE.MeshStandardMaterial({map:texture,roughness:1}));mesh.position.set(x,y,z);mark(mesh);};
 const drum=(x,z,broken=false)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.28,.29,.83,10),materials.rust);mesh.position.set(x,.44,z);mark(mesh);for(const y of [.16,.7]){const band=new THREE.Mesh(new THREE.TorusGeometry(.29,.025,4,10),materials.metal);band.rotation.x=Math.PI/2;band.position.set(x,y,z);mark(band);}if(broken)prop('brokenBarrel',x+.65,z+.2,.7);};
 const crate=(x,y,z)=>{box(x,y+.48,z,1,.96,.8,materials.wood);for(const side of [-1,1]){box(x+side*.42,y+.48,z+.415,.08,.96,.035,materials.metal);box(x,y+.48+side*.38,z+.425,1,.07,.04,materials.metal);}box(x,y+.48,z+.44,.06,1.1,.035,materials.wood,-.65);};
 const labels=level.id==='blackout'?['DANGER  /  POWER','SECTOR 02','NO ENTRY']:level.id==='arsenal'?['AMMUNITION','KEEP DRY','DEPOT 03']:['CHECKPOINT 01','PAPERS READY','ROAD CLOSED'];
 // Different recognizable supply clusters, fences and wreckage for each stage.
 for(let i=0;i<7;i++){const x=4+i*7.5,z=-7.5-(i%3)*.55;
  prop(i%3===0?'fence':i%3===1?'brokenFence':'wallRuin',x,z-2,2.3+(i%2)*.7);
  prop(['openCrate','brokenCrate','fallenBarrel','rubbleLarge'][i%4],x+1.2,z,1+(i%3)*.2);
  prop(i%2?'planks':'smallBricks',x-1.6,z+.7,.9);
  if(i%2===0){crate(x,0,z);if(level.id==='arsenal')crate(x+.35,.96,z-.2);drum(x+1.8,z-.7,i%3===0);}
  if(i%3===0)board(labels[Math.floor(i/3)],x,1.6,z-.35,2);
 }
 // Facade planks, ventilation housings, rain pipes and broken window ledges.
 for(let i=0;i<9;i++){const x=i*7-3,z=i%2?-13.6:-18.6;
  box(x,2.1,z,.12,3.9,.15,materials.metal);box(x+.75,1.6,z,.85,.65,.3,materials.metal);
  for(let slat=0;slat<4;slat++)box(x+.75,1.4+slat*.12,z+.17,.72,.025,.04,materials.rust);
  box(x+2,2.1,z+.07,1.45,.14,.08,materials.wood,.22);box(x+2,2.1,z+.1,1.4,.14,.08,materials.wood,-.45);
  box(x+2,1.2,z+.2,1.6,.13,.45,materials.stone);
 }
 // Short rusted poles and sagging wires form a rear utility line, away from targets.
 for(let x=1;x<level.length;x+=11){box(x,2.2,-10,.12,4.4,.13,materials.wood);box(x,4.1,-10,1.3,.1,.1,materials.metal);for(let j=0;j<6;j++){const dx=11/6,mid=(j+.5)/6,sag=Math.sin(mid*Math.PI)*.45;box(x+j*dx+dx/2,4.05-sag,-10,dx+.06,.025,.025,materials.metal,(Math.cos(mid*Math.PI)*-.45*Math.PI)/11);}}
 // Wet ground patches, broken masonry and small dropped boards frame the lane.
 for(let i=0;i<9;i++){const x=3+i*6.3,z=5.7+(i%2)*.5;const patch=new THREE.Mesh(new THREE.CircleGeometry(1,13),new THREE.MeshStandardMaterial({color:'#141d21',roughness:.2,metalness:.45,transparent:true,opacity:.7}));patch.rotation.x=-Math.PI/2;patch.scale.set(.8+(i%3)*.25,.25+(i%2)*.1,1);patch.position.set(x,.032,z);mark(patch);prop(i%2?'smallBricks':'planks',x+.9,6.4,.6);for(let j=0;j<3;j++)box(x-.45+j*.27,.06,5.25+j*.13,.13,.08,.11,materials.stone);}
 if(level.id==='blackout')for(const x of [17,32]){box(x,1.25,-8.5,1.8,2.5,.8,materials.metal);for(const dx of [-.55,0,.55]){box(x+dx,1.5,-8.05,.32,1.6,.06,materials.rust);box(x+dx,2.65,-8.5,.15,.5,.15,materials.wood);}board('HIGH VOLTAGE',x,2.2,-8.02,1.5);}
 if(level.id==='arsenal')for(const x of [12,29,46]){crate(x,0,-9);crate(x+1.1,0,-9);crate(x+.55,.96,-9);drum(x+2.2,-9);board('EXPLOSIVES',x+.6,2.2,-8.5,1.8);}
 if(level.id==='checkpoint')for(const x of [8,29,47]){prop('hedgehog',x,-7,1.7);prop('sandbags',x+2,-8,2.5);}
}
