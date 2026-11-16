import {level as first} from './level01.js';
import guards from '../../data/enemies.json' with {type:'json'};
export const makeWalls=segments=>segments.map(([a,b])=>({min:{x:a,y:0,z:-.45},max:{x:b,y:1.25,z:.45}}));
const panel=(id,x,trapX,requiresLights=false)=>({id,x,z:-3,y:1.1,trapX,requiresLights});
const lamp=(id,x,required=true)=>({id,x,z:-3,y:2.7,required});
export const levels=[
 {...first,id:'checkpoint',number:1,name:'붕괴된 검문소',length:58,exitStyle:'door',brief:'틈 너머 제어판을 F로 작동시켜 낙하물을 떨어뜨리고 방호문을 열어라.',walls:first.walls,guards,panels:[panel('winch',11.5,18)],lamps:[lamp('checkpoint-light',25.5,false)],palette:'#0b121e'},
 {id:'blackout',number:2,name:'정전 골목',start:2,exit:54,length:56,exitStyle:'tunnel',brief:'금빛 감시등 두 개를 사격해 차단하라. 어두운 구역에서는 발견이 느려진다.',walls:makeWalls([[0,8],[11,21],[24,34],[37,52]]),guards:guards.map((g,i)=>({...g,x:[14,19,28,35,43,50][i],min:4,max:52})),panels:[],lamps:[lamp('lamp-a',9.5),lamp('lamp-b',22.5),lamp('lamp-c',35.5,false)],palette:'#101524'},
 {id:'arsenal',number:3,name:'탄약고 탈출',start:2,exit:56,length:58,exitStyle:'bunker',brief:'감시등을 파괴한 뒤 중앙 틈의 제어판을 F로 절단하라. 적은 낙하물로 제압할 수 있다.',walls:makeWalls([[0,9],[12,23],[26,38],[41,54]]),guards:guards.map((g,i)=>({...g,x:[15,22,31,37,45,51][i],min:5,max:54,speed:g.speed*1.1})),panels:[panel('power',24.5,44,true)],lamps:[lamp('power-light',10.5),lamp('yard-light',39.5,false)],palette:'#191217'}
];
