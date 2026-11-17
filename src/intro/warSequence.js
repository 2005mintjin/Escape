export const WAR_SHOTS=[
 {id:'surrounded',duration:5,speaker:'적 지휘관',text:'포위됐다! 무기를 버리고, 손을 들어!'},
 {id:'captured',duration:6,speaker:'마리아',text:'우리는 포로가 되었다. 분대원들을 두고 혼자 살아남을 수는 없었다.'},
 {id:'shelling',duration:4,speaker:'분대원',text:'포격이다! 고개 숙여!'},
 {id:'escape',duration:6,speaker:'마리아',text:'지금이야! 무기를 챙겨. 잔해 뒤로, 흩어져서 빠져나가!'},
 {id:'blackout',duration:1.5,speaker:'마리아',text:'다시 만날 때까지, 살아 있어.'}
];
export const WAR_DURATION=WAR_SHOTS.reduce((sum,shot)=>sum+shot.duration,0);
export function warShot(elapsed){let start=0;for(const shot of WAR_SHOTS){if(elapsed<start+shot.duration)return {...shot,elapsed:Math.max(0,elapsed-start),progress:Math.max(0,(elapsed-start)/shot.duration)};start+=shot.duration;}return {...WAR_SHOTS.at(-1),elapsed:WAR_SHOTS.at(-1).duration,progress:1};}

// Cinematic cues follow the recording clock; gameplay keeps its bounded physics step.
export const introDelta=(mode,frameDelta,elapsed)=>['cutscene','opening','warcard','fade'].includes(mode)?Math.max(0,Math.min(elapsed,1)):frameDelta;
