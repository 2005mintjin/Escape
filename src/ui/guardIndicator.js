export function guardIndicator(enemy,index,position){
 const radio=enemy.state==='Radio',progress=Math.max(0,Math.min(1,radio?enemy.radio:enemy.meter));
 const full=!radio&&(enemy.detected||progress>=1),id=`guard-shape-${index}`,clip=`guard-fill-${index}`;
 const shape=radio?'M25 1h3v12h-3z M5 12h26v27H5z M8 16v4h14v-4z M8 24v2h11v-2z M8 29v2h11v-2z M25 25v8h3v-8z':'M14 2h9l-1.5 23h-6z M14 29h9v9h-9z';
 return `<div class="guard-indicator ${radio?'radio':full?'detected':''}" style="left:${position.x}px;top:${position.y}px" role="progressbar" aria-label="${radio?'무전':'발각'}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress*100)}"><svg viewBox="0 0 36 42" aria-hidden="true"><defs><path id="${id}" d="${shape}" fill-rule="evenodd"/><clipPath id="${clip}"><rect x="0" y="${42*(1-progress)}" width="36" height="42"/></clipPath></defs><use href="#${id}" class="gauge-outline"/><use href="#${id}" class="gauge-fill" clip-path="url(#${clip})"/></svg></div>`;
}
