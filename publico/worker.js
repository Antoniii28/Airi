// AIRI v0.7 E2 — prototipo de Worker. NO DESPLEGAR: faltan cuotas compartidas y validación final.
const MAX_BODY=64*1024, MAX_MESSAGES=12, MAX_USER=2500, MAX_MODEL=12000, MAX_TOTAL=40000;
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","x-frame-options":"DENY","referrer-policy":"no-referrer"}});
const blocked=new Set(["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","CH","GB"]);
export function validarMensajes(datos){
  if(!datos || !Array.isArray(datos.messages) || datos.messages.length<1 || datos.messages.length>MAX_MESSAGES)return null;
  let total=0;const out=[];
  for(const m of datos.messages){
    if(!m || !["user","model"].includes(m.role) || typeof m.text!=="string")return null;
    if(m.role !== (out.length%2===0?"user":"model"))return null;
    if(m.text.length<1 || m.text.length>(m.role==="user"?MAX_USER:MAX_MODEL))return null;
    total+=m.text.length;out.push({role:m.role,parts:[{text:m.text}]});
  }
  if(total>MAX_TOTAL || out[0].role!=="user" || out.at(-1).role!=="user")return null;
  return out;
}
export async function manejar(request,env){
  const url=new URL(request.url);
  if(url.pathname!=="/api/chat")return json({error:"Ruta inexistente"},404);
  if(request.method!=="POST")return json({error:"Método no permitido"},405);
  if(env.AIRI_CHAT_APAGADO!=="0")return json({error:"Chat desactivado hasta completar las verificaciones de publicación."},503);
  if(!env.AIRI_ORIGEN || request.headers.get("origin")!==env.AIRI_ORIGEN || url.origin!==env.AIRI_ORIGEN)return json({error:"Origen no permitido"},403);
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))return json({error:"Se esperaba JSON"},415);
  const country=request.cf?.country;
  if(typeof country!=="string" || !/^[A-Z]{2}$/.test(country) || blocked.has(country))return json({error:"Servicio no disponible en esta región."},403);
  if(!env.AIRI_CODIGO_ACCESO || request.headers.get("x-airi-access")!==env.AIRI_CODIGO_ACCESO)return json({error:"Acceso no autorizado"},403);
  const len=Number(request.headers.get("content-length"));
  if(request.headers.has("content-length") && (!Number.isSafeInteger(len) || len<0 || len>MAX_BODY))return json({error:"Solicitud demasiado grande"},413);
  let raw;try{raw=await request.text()}catch{return json({error:"No se pudo leer la solicitud"},400)}
  if(new TextEncoder().encode(raw).length>MAX_BODY)return json({error:"Solicitud demasiado grande"},413);
  let data;try{data=JSON.parse(raw)}catch{return json({error:"JSON inválido"},400)}
  const contents=validarMensajes(data);
  if(!contents)return json({error:"Conversación inválida"},400);
  // Fail-closed: NO llamar a Gemini hasta implementar/verificar Turnstile y cuotas atómicas compartidas.
  return json({error:"Backend público en preparación. Falta validar protección antibots y cuotas compartidas."},503);
}
export default {fetch:manejar};
