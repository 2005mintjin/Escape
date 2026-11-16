import {isRadioActive} from '../systems/guardResponse.js';
export function guardIndicator(enemy,index,position){
 if(enemy.dead)return '';
 const radio=isRadioActive(enemy)||enemy.state==='Radio';
 const render=(isRadio,progress,x)=>{
  progress=Math.max(0,Math.min(1,progress));const full=!isRadio&&(enemy.detected||progress>=1),id=`guard-shape-${index}-${isRadio?'radio':'detection'}`,clip=`${id}-fill`;
  const shape=isRadio?'M25 1h3v12h-3z M5 12h26v27H5z M8 16v4h14v-4z M8 24v2h11v-2z M8 29v2h11v-2z M25 25v8h3v-8z':'M14 2h9l-1.5 23h-6z M14 29h9v9h-9z';
  return `<div class="guard-indicator ${isRadio?'radio':full?'detected':''}" style="left:${x}px;top:${position.y}px" role="progressbar" aria-label="${isRadio?'무전':'발각'}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress*100)}"><svg viewBox="0 0 36 42" aria-hidden="true"><defs><path id="${id}" d="${shape}" fill-rule="evenodd"/><clipPath id="${clip}"><rect x="0" y="${42*(1-progress)}" width="36" height="42"/></clipPath></defs><use href="#${id}" class="gauge-outline"/><use href="#${id}" class="gauge-fill" clip-path="url(#${clip})"/></svg></div>`;
 };
 return (radio?render(true,enemy.radio,position.x-(enemy.charging?17:0)):'')+(enemy.charging?render(false,enemy.meter,position.x+(radio?17:0)):'');
}
