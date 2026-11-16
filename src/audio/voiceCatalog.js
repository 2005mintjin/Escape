import catalog from '../../data/voices.json' with {type:'json'};
// Equal independent probability; repeating the previous line is deliberately possible.
export function pickVoice(category,random=Math.random){
 const entry=catalog[category],variants=entry.variants?.length?entry.variants:[entry];
 return variants[Math.min(variants.length-1,Math.max(0,Math.floor(random()*variants.length)))];
}
