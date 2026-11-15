// Relative to the deployed app, including GitHub project paths such as /Escape/.
export function assetUrl(path){return (import.meta.env?.BASE_URL||'/')+path.replace(/^\/+/, '');}
