// Segment vs axis-aligned 3D box. Shared by vision and both weapons.
export function segmentBox(a,b,box){
 let lo=0,hi=1;
 for(const k of ['x','y','z']){const d=b[k]-a[k];if(Math.abs(d)<1e-8){if(a[k]<box.min[k]||a[k]>box.max[k])return false;}else{let u=(box.min[k]-a[k])/d,v=(box.max[k]-a[k])/d;if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v);if(lo>hi)return false;}}
 return true;
}
export const blocked=(a,b,walls)=>walls.some(w=>segmentBox(a,b,w));
export function shotImpact(a,b,walls){
 if(!blocked(a,b,walls))return {point:b,blocked:false};
 let lo=0,hi=1;for(let i=0;i<18;i++){const t=(lo+hi)/2,q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};if(blocked(a,q,walls))hi=t;else lo=t;}
 return {point:{x:a.x+(b.x-a.x)*lo,y:a.y+(b.y-a.y)*lo,z:a.z+(b.z-a.z)*lo},blocked:true};
}
