import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fittedSize,sourceSize,requestQueue} from '../src/rendering/textures.js';
test('mobile atlas budget fits 1024 pixels without changing the original crop coordinate space',()=>{const [w,h]=fittedSize(2172,724,1024);assert.equal(w,1024);assert.ok(Math.abs(w/h-3)<.01);const texture={userData:{sourceSize:[2172,724]},image:{width:w,height:h}};assert.deepEqual(sourceSize(texture),[2172,724]);assert.deepEqual(fittedSize(100,50,1024),[100,50]);assert.deepEqual(fittedSize(2172,724,Infinity),[2172,724]);});

test('image queue bounds concurrent downloads and prioritizes a waiting essential image',async()=>{const q=requestQueue(1),order=[],release=[];const one=q(()=>new Promise(resolve=>{order.push('one');release.push(resolve);}));const later=q(()=>{order.push('later');});const essential=q(()=>{order.push('essential');},3);await Promise.resolve();assert.deepEqual(order,['one']);release[0]();await Promise.all([one,later,essential]);assert.deepEqual(order,['one','essential','later']);});
