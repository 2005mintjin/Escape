import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1000,height:600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__render_fixes',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0"><canvas></canvas></body>'}));
 await page.goto('http://localhost:5173/__render_fixes');
 const result=await page.evaluate(async()=>{
  const THREE=await import('/node_modules/.vite/deps/three.js');
  const {World}=await import('/src/rendering/world.js'),{Game}=await import('/src/core/game.js');
  const {HomeView}=await import('/src/intro/homeView.js'),{IntroStory}=await import('/src/intro/story.js');
  const world=new World(document.querySelector('canvas'));await world.ready;const g=new Game();g.startTutorial();await world.loadLevel(g.level);
  // Check the actual generated ground instances, including the entire extended tutorial.
  const ground=world.stageRoot.children.filter(n=>n.userData.ground),matrix=new THREE.Matrix4(),cells=new Set();
  for(const mesh of ground)for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);const p=new THREE.Vector3().setFromMatrixPosition(matrix);cells.add(`${p.x},${p.z}`);}
  for(let x=0;x<=g.level.length+8;x+=2)for(const z of [-4,0,2,4,6])if(!cells.has(`${x},${z}`))throw Error(`Missing ground at ${x},${z}`);
  g.tutorial.step=7;g.player.x=70;world.cameraX=70;world.draw(g,0);g.tutorial.step=8;g.player.x=81;world.cameraX=81;world.draw(g,0);
  g.player.weapon='pistol';g.player.moving=g.player.running=true;const frames=world.characters.player.pistolRun,maps=new Set();
  for(let i=0;i<frames.length;i++){g.time=(i+.1)/16;world.draw(g,0);if(world.player.userData.animation!=='pistolRun')throw Error('Wrong run animation');maps.add(world.player.material.map);}
  if(frames.length!==8||maps.size!==8)throw Error('Missing intermediate running frames');
  const home=new HomeView(world.renderer);await home.ready;const story=new IntroStory();story.start();story.x=8.3;home.cameraX=8.3;home.draw(story,1);
  const book=home.scene.children.find(n=>n.userData.furniture==='bookcase'),position=book.position.clone(),scale=book.scale.clone(),map=book.material.map;
  story.drawerOpen=1;story.photoFall=.5;home.draw(story,1);
  if(!book.position.equals(position)||!book.scale.equals(scale)||book.material.map!==map||!home.photo.visible)throw Error('Bookcase or photo regression');
  if(home.scene.children.some(n=>/drawer/i.test(n.userData.furniture||'')))throw Error('Obsolete drawer overlay');
  window.qa={world,home,story,g};return {cells:cells.size,frames:frames.length};
 });
 assert.equal(result.frames,8);assert.deepEqual(errors,[]);
 await page.screenshot({path:'test-results/fixed-bookcase.png'});
 await page.evaluate(()=>{const {world,g}=qa;g.player.x=70;world.cameraX=70;world.draw(g,0);});
 await page.screenshot({path:'test-results/fixed-tutorial-ground.png'});
 console.log('PASS: continuous tutorial ground through exit, static bookcase with photo interaction, eight distinct pistol running frames, no runtime errors');
}finally{await browser.close();}
