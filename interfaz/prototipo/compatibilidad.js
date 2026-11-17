/* Presentación de ejemplos y comparación de especies · Interfaz de Paola
   La evaluación real se delega a AIRICompatibilidad; esta pantalla no contiene reglas biológicas. */
(() => {
  const base="https://raw.githubusercontent.com/Antoniii28/Airi/equipo/yair-compatibilidad/compatibilidad/ejemplos/";
  const moduloUrl="https://raw.githubusercontent.com/Antoniii28/Airi/equipo/yair-compatibilidad/compatibilidad/airi-compatibilidad.js";
  const catalogoUrl="https://raw.githubusercontent.com/Antoniii28/Airi/equipo/brayan-fichas-especies/especies/datos/catalogo_inicial.json";
  const ejemplos=[
    ["01_compatible_sustentado.json","Compatible (orientativo)"],
    ["02_incompatible_rangos.json","Incompatible por rangos"],
    ["03_contradiccion.json","Evidencia contradictoria"],
    ["04_sin_datos.json","Información insuficiente"],
    ["05_precaucion_misma_especie.json","Precaución: misma especie"],
    ["06_acuario_con_motor.json","Acuario y datos del motor"]
  ];
  const select=document.getElementById("compat-ejemplo"), salida=document.getElementById("compat-resultado");
  const opciones=document.getElementById("compat-especies-opciones"), comparar=document.getElementById("compat-comparar");
  const estadoSeleccion=document.getElementById("compat-seleccion-estado");
  if(!select||!salida||!opciones||!comparar)return;

  const estilos=document.createElement("style");
  estilos.textContent=
  '#compatibilidad .compat-intro{line-height:1.65;max-width:850px}'+
  '#compatibilidad .compat-selector,#compatibilidad .compat-bloque{background:#f0f8fc;border:1px solid #c4dce8;border-radius:12px;padding:15px;margin:12px 0;color:#09284d}'+
  '#compatibilidad .compat-selector h3,#compatibilidad .compat-bloque h3{margin:0 0 8px;color:#09284d}'+
  '#compatibilidad .compat-bloque p,#compatibilidad .compat-bloque li,#compatibilidad .compat-bloque small,#compatibilidad .compat-bloque h4{color:#173b56}'+
  '#compatibilidad .compat-estado{display:inline-block;padding:7px 11px;border-radius:9px;font-weight:750;margin:7px 0}'+
  '#compatibilidad .compat-compatible{background:#d8f1df;color:#185b32}#compatibilidad .compat-precaucion{background:#ffedcf;color:#754300}#compatibilidad .compat-incompatible{background:#fbdedc;color:#86251f}#compatibilidad .compat-sin_datos{background:#dce8ee;color:#29485a}'+
  '#compatibilidad .compat-motivo{border-left:3px solid #78b8ce;padding:9px 12px;margin:10px 0;background:#e3f0f6;color:#09284d;border-radius:0 8px 8px 0}#compatibilidad .compat-motivo p,#compatibilidad .compat-motivo small{color:#173b56}'+
  '#compatibilidad .compat-faltante{display:inline-block;background:#ffedcf;color:#754300;border-radius:7px;padding:5px 8px;margin:4px;font-size:13px}'+
  '#compatibilidad .compat-aviso{background:#e1eff7;border:1px solid #a9cbdc;border-radius:10px;padding:13px;line-height:1.55;color:#123b56}'+
  '#compatibilidad .compat-tabla{width:100%;border-collapse:collapse;margin-top:8px}#compatibilidad .compat-tabla th,#compatibilidad .compat-tabla td{text-align:left;padding:8px;border-bottom:1px solid #c4dce8;font-size:14px;color:#173b56}#compatibilidad .compat-tabla th{color:#09284d}'+
  '#compatibilidad .compat-error{padding:12px;border-radius:9px;background:#fbdedc;color:#86251f}#compatibilidad .compat-cargando{color:#47667b;padding:12px}'+
  '#compatibilidad .compat-seleccion{border:1px solid #c4dce8;border-radius:10px;padding:12px;margin:12px 0}#compatibilidad .compat-seleccion legend{font-weight:700;padding:0 6px;color:#09284d}'+
  '#compatibilidad .compat-opciones{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px}#compatibilidad .compat-opcion{display:flex;align-items:center;gap:9px;padding:9px;border-radius:8px;background:#fff;color:#09284d;font-weight:500}#compatibilidad .compat-opcion input{width:auto;margin:0;accent-color:#087dbb}#compatibilidad .compat-selector .muted{color:#36576b}#compatibilidad a{overflow-wrap:anywhere}'+
  'html[data-theme="dark"] #compatibilidad .compat-selector,html[data-theme="dark"] #compatibilidad .compat-bloque{background:#22364a;border-color:#405970;color:#e5edf5}'+
  'html[data-theme="dark"] #compatibilidad .compat-selector h3,html[data-theme="dark"] #compatibilidad .compat-bloque h3,html[data-theme="dark"] #compatibilidad .compat-bloque p,html[data-theme="dark"] #compatibilidad .compat-bloque li,html[data-theme="dark"] #compatibilidad .compat-bloque small,html[data-theme="dark"] #compatibilidad .compat-bloque h4{color:#e5edf5}'+
  'html[data-theme="dark"] #compatibilidad .compat-motivo{background:#172a3d;color:#e5edf5;border-left-color:#65b8df}html[data-theme="dark"] #compatibilidad .compat-motivo p,html[data-theme="dark"] #compatibilidad .compat-motivo small{color:#d3e1ec}'+
  'html[data-theme="dark"] #compatibilidad .compat-aviso{background:#263f55;border-color:#496b87;color:#e5edf5}html[data-theme="dark"] #compatibilidad .compat-tabla th,html[data-theme="dark"] #compatibilidad .compat-tabla td{color:#e5edf5;border-color:#405970}'+
  'html[data-theme="dark"] #compatibilidad .compat-seleccion{border-color:#49647b}html[data-theme="dark"] #compatibilidad .compat-seleccion legend{color:#e5edf5}html[data-theme="dark"] #compatibilidad .compat-opcion{background:#172a3d;color:#e5edf5}html[data-theme="dark"] #compatibilidad .compat-selector .muted{color:#b5c6d6}'+
  '@media(max-width:640px){#compatibilidad .compat-tabla th,#compatibilidad .compat-tabla td{padding:6px;font-size:12px}}';
  document.head.appendChild(estilos);

  const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const estadoClass=estado=>["compatible","precaucion","incompatible","sin_datos"].includes(estado)?estado:"sin_datos";
  const estadoLabel=estado=>({compatible:"Compatible (orientativo)",precaucion:"Precaución",incompatible:"Incompatible",sin_datos:"Información insuficiente"})[estado]||"Estado no especificado";
  const sourceLinks=(ids,sources)=>(ids||[]).map(id=>{
    const source=sources?.[id];if(!source)return "<span>"+esc(id)+" (fuente no registrada)</span>";
    const url=String(source.url||""),safeUrl=/^https?:\/\//i.test(url)?url:"";
    return safeUrl?'<a href="'+esc(safeUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(source.titulo||id)+'</a>':'<span>'+esc(source.titulo||id)+'</span>';
  }).join(" · ")||"Sin fuentes asociadas.";

  function renderFaltantes(items){if(!items?.length)return "";return '<div class="compat-bloque"><h3>Datos faltantes</h3>'+items.map(x=>'<span class="compat-faltante">'+esc(x.especie||"Acuario")+': '+esc(x.campo)+'</span>').join("")+'</div>';}
  function renderMotivos(motivos,sources){
    if(!motivos?.length)return '<p class="muted">No hay motivos detallados para este resultado.</p>';
    return motivos.map(m=>'<div class="compat-motivo"><strong>'+esc(m.nombre||m.criterio||"Motivo")+'</strong>'+
      (m.efecto?' <span class="tag">'+esc(m.efecto)+'</span>':'')+'<p>'+esc(m.texto||"Sin descripción.")+'</p>'+
      '<small>Confianza: '+esc(m.confianza||"No indicada")+' · Fuentes: '+sourceLinks(m.fuentes,sources)+'</small></div>').join("");
  }
  function renderResultado(data,sources,names){
    const n=Array.isArray(data.especies)?data.especies.map(id=>names.get(id)||id).join(" + "):(names.get(data.especie)||data.especie||"Evaluación");
    const contradiction=data.contradiccion?'<p class="compat-error"><strong>Atención:</strong> hay evidencia contradictoria. El módulo aplicó el resultado más restrictivo; requiere revisión humana.</p>':"";
    return '<article class="compat-bloque"><h3>'+esc(n)+'</h3><span class="compat-estado compat-'+estadoClass(data.estado)+'">'+esc(data.etiqueta||estadoLabel(data.estado))+'</span>'+
      '<p>'+esc(data.resumen||"Sin resumen disponible.")+'</p>'+contradiction+'<h4>Motivos</h4>'+renderMotivos(data.motivos,sources)+
      (data.datos_faltantes?.length?'<h4>Datos faltantes en esta evaluación</h4>'+data.datos_faltantes.map(x=>'<span class="compat-faltante">'+esc(x.especie||"Acuario")+': '+esc(x.campo)+'</span>').join(""):"")+'</article>';
  }
  function render(json,ficticio){
    const data=json.salida||{},sources=data.fuentes||{},species=data.especies||[],names=new Map(species.map(s=>[s.id,s.nombre_comun||s.id]));
    let html='<div class="compat-bloque"><small>Versión del módulo: '+esc(data.version||"No indicada")+' · Catálogo: '+esc(data.catalogo_version||"No indicado")+'</small><br><span class="compat-estado compat-'+estadoClass(data.estado_global)+'">'+esc(data.etiqueta_global||estadoLabel(data.estado_global))+'</span><p><strong>Resultado general</strong></p><p>'+esc(data.aviso||"Sin aviso disponible.")+'</p></div>';
    html+='<div class="compat-bloque"><h3>Especies evaluadas</h3><ul>'+species.map(s=>'<li><strong>'+esc(s.nombre_comun||s.id)+'</strong>'+(s.nombre_cientifico?' <em>('+esc(s.nombre_cientifico)+')</em>':"")+' · Cantidad: '+esc(s.cantidad??1)+(s.encontrada===false?' · No encontrada en el catálogo':"")+'</li>').join("")+'</ul></div>';
    if(data.pares?.length)html+='<h3>Evaluación entre especies</h3>'+data.pares.map(x=>renderResultado(x,sources,names)).join("");
    if(data.acuario?.length)html+='<h3>Evaluación frente al acuario</h3>'+data.acuario.map(x=>renderResultado(x,sources,names)).join("");
    const interval=data.intervalo_comun;
    if(interval){const fmt=x=>x?esc(x.min)+" – "+esc(x.max):"Sin intervalo común disponible";html+='<div class="compat-bloque"><h3>Intervalos comunes documentados</h3><p>Temperatura: '+fmt(interval.temperatura_c)+' °C · pH: '+fmt(interval.ph)+'</p><small>'+esc(interval.nota||"")+'</small></div>';}
    html+=renderFaltantes(data.datos_faltantes);
    html+='<div class="compat-bloque"><h3>Fuentes registradas</h3><ul>'+Object.entries(sources).map(([id,s])=>'<li>'+sourceLinks([id],sources)+' <small>('+esc(s.tipo||"tipo no indicado")+')</small></li>').join("")+(Object.keys(sources).length?"":"<li>No se registraron fuentes.</li>")+'</ul></div>';
    html+=ficticio?'<p class="compat-aviso"><strong>Importante:</strong> este es un escenario ficticio de demostración. No representa información biológica real ni una recomendación para introducir organismos.</p>':'<p class="compat-aviso"><strong>Importante:</strong> resultado orientativo basado en las fichas y fuentes disponibles. No garantiza la convivencia ni el bienestar de los organismos. Revisa los motivos, la confianza y las fuentes; la decisión final requiere revisión humana.</p>';
    salida.innerHTML=html;salida.setAttribute("aria-busy","false");
  }
  function mostrarCarga(m){salida.innerHTML='<p class="compat-cargando" role="status">'+esc(m)+'</p>';salida.setAttribute("aria-busy","true");}
  function cargarScript(url){return new Promise((resolve,reject)=>{if(window.AIRICompatibilidad)return resolve();const script=document.createElement("script");script.src=url;script.onload=resolve;script.onerror=()=>reject(new Error("No se pudo cargar el módulo de compatibilidad."));document.head.appendChild(script);});}
  let catalogoPromise=null;
  function obtenerCatalogo(){if(!catalogoPromise)catalogoPromise=fetch(catalogoUrl,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("No se pudo consultar el catálogo de especies ("+r.status+").");return r.json();});return catalogoPromise;}

  const listaEspecies=Array.isArray(window.AIRIListaEspecies)?window.AIRIListaEspecies:[];
  opciones.className="compat-opciones";
  opciones.innerHTML=listaEspecies.map(e=>'<label class="compat-opcion"><input type="checkbox" name="compat-especie" value="'+esc(e.id)+'"> <span>'+esc(e.nombre)+' <em>('+esc(e.cientifico)+')</em></span></label>').join("")||'<p class="muted">No se encontró la lista de especies.</p>';
  ejemplos.forEach(([file,label])=>{const option=document.createElement("option");option.value=file;option.textContent=label;select.appendChild(option);});

  async function cargarEjemplo(){
    const file=select.value;if(!file){salida.innerHTML='<p class="muted">Selecciona un escenario o elige especies para comparar.</p>';salida.setAttribute("aria-busy","false");return;}
    mostrarCarga("Cargando escenario de demostración…");
    try{const response=await fetch(base+encodeURIComponent(file),{cache:"no-store"});if(!response.ok)throw new Error("No fue posible consultar el ejemplo ("+response.status+").");const json=await response.json();if(!json.salida||!json.entrada)throw new Error("El archivo no tiene la estructura esperada.");render(json,true);}
    catch(error){salida.innerHTML='<p class="compat-error" role="alert">'+esc(error.message)+'</p><p class="muted">Comprueba tu conexión y que la rama de ejemplos siga disponible.</p>';salida.setAttribute("aria-busy","false");}
  }
  select.addEventListener("change",cargarEjemplo);

  comparar.addEventListener("click",async()=>{
    const ids=Array.from(opciones.querySelectorAll('input[name="compat-especie"]:checked')).map(x=>x.value);
    if(ids.length<2){estadoSeleccion.textContent="Selecciona al menos dos especies para realizar la comparación.";return;}
    if(ids.length>6){estadoSeleccion.textContent="Puedes seleccionar hasta seis especies.";return;}
    estadoSeleccion.textContent="Preparando la comparación…";select.value="";mostrarCarga("Consultando el módulo y el catálogo de especies…");comparar.disabled=true;
    try{
      await cargarScript(moduloUrl);const catalogo=await obtenerCatalogo();
      if(!window.AIRICompatibilidad||typeof window.AIRICompatibilidad.evaluar!=="function")throw new Error("El módulo de compatibilidad no está disponible.");
      const resultado=window.AIRICompatibilidad.evaluar({especies:ids},catalogo);
      render({salida:resultado},false);estadoSeleccion.textContent="Comparación generada con el módulo de compatibilidad.";
    }catch(error){
      salida.innerHTML='<p class="compat-error" role="alert">'+esc(error.message)+'</p><p class="muted">La comparación requiere conexión a internet y que estén disponibles las ramas del módulo y del catálogo.</p>';
      salida.setAttribute("aria-busy","false");estadoSeleccion.textContent="No fue posible completar la comparación.";
    }finally{comparar.disabled=false;}
  });
  cargarEjemplo();
})();