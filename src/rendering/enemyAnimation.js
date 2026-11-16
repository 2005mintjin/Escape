export const ENEMY_FALL_SECONDS=.9;
export function enemyDeathFrame(elapsed,count){return Math.min(count-1,Math.floor(Math.max(0,elapsed)/ENEMY_FALL_SECONDS*count));}
// Enemy objects are replaced at restart. Paused game time keeps a falling body on its current frame.
export class EnemyDeathClock{
 constructor(){this.starts=new WeakMap();}
 frame(enemy,time,count){if(!this.starts.has(enemy))this.starts.set(enemy,time);return enemyDeathFrame(time-this.starts.get(enemy),count);}
 alive(enemy){this.starts.delete(enemy);}
}
