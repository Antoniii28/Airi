import test from "node:test";
import assert from "node:assert/strict";
import {manejar,validarMensajes} from "./worker.js";
const env={AIRI_CHAT_APAGADO:"0",AIRI_ORIGEN:"https://airi.example",AIRI_CODIGO_ACCESO:"ficticio"};
const req=(opts={})=>new Request("https://airi.example/api/chat",{method:"POST",headers:{origin:"https://airi.example","content-type":"application/json","x-airi-access":"ficticio"},body:JSON.stringify({messages:[{role:"user",text:"Hola"}]}),...opts});
test("mensajes válidos",()=>assert.equal(validarMensajes({messages:[{role:"user",text:"Hola"}]}).length,1));
test("mensajes inválidos",()=>assert.equal(validarMensajes({messages:[{role:"model",text:"Hola"}]}),null));
test("apagado por defecto",async()=>assert.equal((await manejar(req(),{...env,AIRI_CHAT_APAGADO:undefined})).status,503));
test("origen rechazado",async()=>assert.equal((await manejar(req({headers:{origin:"https://ajeno.example","content-type":"application/json"}}),env)).status,403));
test("región desconocida rechazada",async()=>assert.equal((await manejar(req(),env)).status,403));
test("sin controles compartidos no llama a Gemini",async()=>{
  const r=await manejar(req(),{...env});
  assert.notEqual(r.status,200);
});
