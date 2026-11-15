// Keep the actual button node alive across HUD frames so pointer clicks and keyboard focus survive.
export function pauseControl(game){
 const button=document.createElement('button');button.id='pause';button.textContent='Ⅱ 일시정지';document.body.append(button);
 button.onclick=()=>{if(game.state==='playing')game.state='paused';};
 return ()=>{button.disabled=game.state!=='playing';};
}
