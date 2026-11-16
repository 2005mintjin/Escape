import * as THREE from 'three';
// Short moving bullet bodies replace full muzzle-to-target lines. Reuse both GPU pools.
export function createProjectileView(scene){
 const pools=[false,true].map(enemy=>{const mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,4),new THREE.MeshBasicMaterial({color:enemy?'#ffad58':'#fff0b1'}),128);mesh.count=0;mesh.frustumCulled=false;mesh.name=enemy?'enemy-bullets':'player-bullets';scene.add(mesh);return mesh;});
 const transform=new THREE.Object3D(),axis=new THREE.Vector3(0,0,1),direction=new THREE.Vector3();
 return {pools,update(bullets=[]){pools.forEach((mesh,i)=>{let count=0;for(const bullet of bullets)if(Number(bullet.enemy)===i&&count<128){transform.position.set(bullet.position.x,bullet.position.y,bullet.position.z);direction.set(bullet.direction.x,bullet.direction.y,bullet.direction.z);transform.quaternion.setFromUnitVectors(axis,direction);transform.scale.set(.055,.055,.18);transform.updateMatrix();mesh.setMatrixAt(count++,transform.matrix);}mesh.count=count;mesh.instanceMatrix.needsUpdate=true;});}};
}
