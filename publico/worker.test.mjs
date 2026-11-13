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

test("rechaza roles consecutivos sin alternancia",()=>assert.equal(validarMensajes({messages:[{role:"user",text:"A"},{role:"user",text:"B"}]}),null));
test("rechaza respuestas incompletas",()=>assert.equal(validarMensajes({messages:[{role:"user",text:"A"},{role:"model",text:"B"}]}),null));
test("acepta seguimiento alternado",()=>assert.equal(validarMensajes({messages:[{role:"user",text:"A"},{role:"model",text:"B"},{role:"user",text:"C"}]}).length,3));
test("rechaza mensajes excesivos",()=>assert.equal(validarMensajes({messages:[{role:"user",text:"x".repeat(2501)}]}),null));
test("rechaza tipos de texto no válidos",()=>assert.equal(validarMensajes({messages:[{role:"user",text:{a:1}}]}),null));
test("rechaza ruta desconocida",async()=>assert.equal((await manejar(new Request("https://airi.example/otra"),env)).status,404));
test("rechaza método GET",async()=>assert.equal((await manejar(new Request("https://airi.example/api/chat"),env)).status,405));
test("rechaza origen sin autorización",async()=>assert.equal((await manejar(req({headers:{"content-type":"application/json"}}),env)).status,403));
test("rechaza tipo de contenido incorrecto",async()=>assert.equal((await manejar(req({headers:{origin:"https://airi.example","x-airi-access":"ficticio","content-type":"text/plain"}}),env)).status,415));
test("rechaza cuerpo mayor al máximo declarado",async()=>{
  const r=req({headers:{origin:"https://airi.example","x-airi-access":"ficticio","content-type":"application/json","content-length":"999999"}});
  Object.defineProperty(r,"cf",{value:{country:"MX"}});
  assert.equal((await manejar(r,env)).status,413);
});
test("no activa Gemini aunque el interruptor esté habilitado",async()=>assert.notEqual((await manejar(req(),env)).status,200));

test("rechaza código de acceso incorrecto en región permitida",async()=>{
  const r=req({headers:{origin:"https://airi.example","content-type":"application/json","x-airi-access":"incorrecto"}});
  Object.defineProperty(r,"cf",{value:{country:"MX"}});
  assert.equal((await manejar(r,env)).status,403);
});
test("rechaza país bloqueado aunque exista código",async()=>{
  const r=req();Object.defineProperty(r,"cf",{value:{country:"ES"}});
  assert.equal((await manejar(r,env)).status,403);
});
test("en región permitida sigue cerrado y no consulta Gemini",async()=>{
  const r=req();Object.defineProperty(r,"cf",{value:{country:"MX"}});
  const response=await manejar(r,env);
  assert.equal(response.status,503);
});
