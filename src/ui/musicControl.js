export function musicControl(music){
 const button=document.createElement('button');button.id='music-toggle';button.setAttribute('aria-label','배경음악 전환');document.body.append(button);
 button.onclick=()=>{if(music.failed&&music.enabled)music.unlock();else music.toggle();update();};
 function update(){button.setAttribute('aria-pressed',String(music.enabled));button.textContent=music.failed?'♫ 음악 재시도':music.enabled?'♫ 음악 켜짐':'♫ 음악 꺼짐';}
 update();return update;
}
