/* Visualización de ejemplos JSON de compatibilidad · Interfaz de Paola
   Solo presenta la salida recibida. No ejecuta reglas ni calcula estados. */
(() => {
  const base = "https://raw.githubusercontent.com/Antoniii28/Airi/equipo/yair-compatibilidad/compatibilidad/ejemplos/";
  const ejemplos = [
    ["01_compatible_sustentado.json", "Compatible (orientativo)"],
    ["02_incompatible_rangos.json", "Incompatible por rangos"],
    ["03_contradiccion.json", "Evidencia contradictoria"],
    ["04_sin_datos.json", "Información insuficiente"],
    ["05_precaucion_misma_especie.json", "Precaución: misma especie"],
    ["06_acuario_con_motor.json", "Acuario y datos del motor"]
  ];
  const select = document.getElementById("compat-ejemplo");
  const salida = document.getElementById("compat-resultado");
  if (!select || !salida) return;

  const estilos = document.createElement("style");
  estilos.textContent = `
    #compatibilidad .compat-intro{line-height:1.65;max-width:850px}
    #compatibilidad .compat-estado{display:inline-block;padding:7px 11px;border-radius:9px;font-weight:750;margin:7px 0}
    #compatibilidad .compat-compatible{background:#e1f6e8;color:#185b32}
    #compatibilidad .compat-precaucion{background:#fff1df;color:#85500a}
    #compatibilidad .compat-incompatible{background:#fde8e7;color:#922d28}
    #compatibilidad .compat-sin_datos{background:#eaf0f3;color:#405867}
    #compatibilidad .compat-bloque{background:#f7fcfd;border:1px solid #d6eaf1;border-radius:12px;padding:15px;margin:12px 0}
    #compatibilidad .compat-bloque h3{margin:0 0 8px;color:#09284D}
    #compatibilidad .compat-bloque p{line-height:1.55}
    #compatibilidad .compat-motivo{border-left:3px solid #9bcbd7;padding:8px 12px;margin:10px 0;background:white;border-radius:0 8px 8px 0}
    #compatibilidad .compat-faltante{display:inline-block;background:#fff1df;border-radius:7px;padding:5px 8px;margin:4px;font-size:13px}
    #compatibilidad .compat-aviso{background:#eef6fb;border:1px solid #b9d8e7;border-radius:10px;padding:13px;line-height:1.55}
    #compatibilidad .compat-tabla{width:100%;border-collapse:collapse;margin-top:8px}
    #compatibilidad .compat-tabla th,#compatibilidad .compat-tabla td{text-align:left;padding:8px;border-bottom:1px solid #d6eaf1;font-size:14px}
    #compatibilidad .compat-tabla th{color:#36576b}
    #compatibilidad .compat-error{padding:12px;border-radius:9px;background:#fde8e7;color:#922d28}
    #compatibilidad .compat-cargando{color:#47667b;padding:12px}
    #compatibilidad a{overflow-wrap:anywhere}
    @media(max-width:640px){#compatibilidad .compat-tabla th,#compatibilidad .compat-tabla td{padding:6px;font-size:12px}}
  `;
  document.head.appendChild(estilos);

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
  const estadoClass = estado => ["compatible","precaucion","incompatible","sin_datos"].includes(estado) ? estado : "sin_datos";
  const estadoLabel = estado => ({
    compatible:"Compatible (orientativo)", precaucion:"Precaución",
    incompatible:"Incompatible", sin_datos:"Información insuficiente"
  })[estado] || "Estado no especificado";
  const sourceLinks = (ids, sources) => (ids || []).map(id => {
    const source = sources?.[id];
    if (!source) return "<span>" + esc(id) + " (fuente no registrada)</span>";
    const url = String(source.url || "");
    const safeUrl = /^https?:\/\//i.test(url) ? url : "";
    return safeUrl
      ? '<a href="' + esc(safeUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(source.titulo || id) + '</a>'
      : '<span>' + esc(source.titulo || id) + '</span>';
  }).join(" · ") || "Sin fuentes asociadas.";

  function renderFaltantes(items) {
    if (!items?.length) return "";
    return '<div class="compat-bloque"><h3>Datos faltantes</h3>' +
      items.map(x => '<span class="compat-faltante">' + esc(x.especie || "Acuario") + ': ' + esc(x.campo) + '</span>').join("") +
      '</div>';
  }

  function renderMotivos(motivos, sources) {
    if (!motivos?.length) return '<p class="muted">El ejemplo no incluye motivos detallados para este resultado.</p>';
    return motivos.map(m => '<div class="compat-motivo">' +
      '<strong>' + esc(m.nombre || m.criterio || "Motivo") + '</strong>' +
      (m.efecto ? ' <span class="tag">' + esc(m.efecto) + '</span>' : '') +
      '<p>' + esc(m.texto || "Sin descripción.") + '</p>' +
      '<small>Confianza: ' + esc(m.confianza || "No indicada") + ' · Fuentes: ' + sourceLinks(m.fuentes, sources) + '</small>' +
      '</div>').join("");
  }

  function renderResultado(data, sources, names) {
    const evaluatedNames = Array.isArray(data.especies)
      ? data.especies.map(id => names.get(id) || id).join(" + ")
      : (names.get(data.especie) || data.especie || "Evaluación");
    const contradiction = data.contradiccion
      ? '<p class="compat-error"><strong>Atención:</strong> hay evidencia contradictoria. El módulo aplicó el resultado más restrictivo; requiere revisión humana.</p>' : "";
    return '<article class="compat-bloque"><h3>' + esc(evaluatedNames) + '</h3>' +
      '<span class="compat-estado compat-' + estadoClass(data.estado) + '">' + esc(data.etiqueta || estadoLabel(data.estado)) + '</span>' +
      '<p>' + esc(data.resumen || "Sin resumen disponible.") + '</p>' + contradiction +
      '<h4>Motivos</h4>' + renderMotivos(data.motivos, sources) +
      (data.datos_faltantes?.length ? '<h4>Datos faltantes en esta evaluación</h4>' + data.datos_faltantes.map(x => '<span class="compat-faltante">' + esc(x.especie || "Acuario") + ': ' + esc(x.campo) + '</span>').join("") : '') +
      '</article>';
  }

  function render(json) {
    const data = json.salida || {};
    const sources = data.fuentes || {};
    const species = data.especies || [];
    const names = new Map(species.map(s => [s.id, s.nombre_comun || s.id]));
    let html = '<div class="compat-bloque"><small>Versión del módulo: ' + esc(data.version || "No indicada") +
      ' · Catálogo: ' + esc(data.catalogo_version || "No indicado") + '</small><br>' +
      '<span class="compat-estado compat-' + estadoClass(data.estado_global) + '">' +
      esc(data.etiqueta_global || estadoLabel(data.estado_global)) + '</span>' +
      '<p><strong>Resultado general</strong></p><p>' + esc(data.aviso || "Sin aviso disponible.") + '</p></div>';

    html += '<div class="compat-bloque"><h3>Especies evaluadas</h3><ul>' + species.map(s =>
      '<li><strong>' + esc(s.nombre_comun || s.id) + '</strong>' +
      (s.nombre_cientifico ? ' <em>(' + esc(s.nombre_cientifico) + ')</em>' : '') +
      ' · Cantidad: ' + esc(s.cantidad ?? 1) +
      (s.encontrada === false ? ' · No encontrada en el catálogo' : '') + '</li>'
    ).join("") + '</ul></div>';

    if (data.pares?.length) html += '<h3>Evaluación entre especies</h3>' + data.pares.map(x => renderResultado(x, sources, names)).join("");
    if (data.acuario?.length) html += '<h3>Evaluación frente al acuario</h3>' + data.acuario.map(x => renderResultado(x, sources, names)).join("");

    const conditions = json.entrada?.acuario?.condiciones;
    if (conditions?.condiciones) {
      html += '<div class="compat-bloque"><h3>Datos recibidos del motor de agua</h3>' +
        '<p>Volumen: ' + esc(json.entrada.acuario.volumen_l ?? "No indicado") + ' L · Tipo: ' + esc(json.entrada.acuario.tipo || "No indicado") + '</p>' +
        '<table class="compat-tabla"><thead><tr><th>Parámetro</th><th>Valor recibido</th><th>Estado del motor</th></tr></thead><tbody>' +
        Object.values(conditions.condiciones).map(c => '<tr><td>' + esc(c.nombre) + '</td><td>' +
          (c.disponible ? esc(c.valor) + ' ' + esc(c.unidad) : 'No disponible') +
          '</td><td>' + esc(c.estado || "No indicado") + '</td></tr>').join("") +
        '</tbody></table><p><small>Se muestran los datos recibidos; la interfaz no vuelve a evaluarlos.</small></p></div>';
    }

    const interval = data.intervalo_comun;
    if (interval) {
      const fmt = x => x ? esc(x.min) + " – " + esc(x.max) : "Sin intervalo común disponible";
      html += '<div class="compat-bloque"><h3>Intervalos comunes documentados</h3><p>Temperatura: ' +
        fmt(interval.temperatura_c) + ' °C · pH: ' + fmt(interval.ph) + '</p><small>' + esc(interval.nota || "") + '</small></div>';
    }
    html += renderFaltantes(data.datos_faltantes);
    html += '<div class="compat-bloque"><h3>Fuentes registradas en el ejemplo</h3><ul>' +
      Object.entries(sources).map(([id, s]) => '<li>' + sourceLinks([id], sources) + ' <small>(' + esc(s.tipo || "tipo no indicado") + ')</small></li>').join("") +
      (Object.keys(sources).length ? '' : '<li>No se registraron fuentes.</li>') + '</ul></div>';
    html += '<p class="compat-aviso"><strong>Importante:</strong> este es un escenario ficticio de demostración. No representa información biológica real ni una recomendación para introducir organismos.</p>';
    salida.innerHTML = html;
  }

  ejemplos.forEach(([file, label]) => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = label;
    select.appendChild(option);
  });

  async function cargar() {
    const file = select.value;
    if (!file) { salida.innerHTML = '<p class="muted">Selecciona un escenario para consultar su resultado.</p>'; return; }
    salida.innerHTML = '<p class="compat-cargando" role="status">Cargando ejemplo de prueba…</p>';
    try {
      const response = await fetch(base + encodeURIComponent(file), { cache: "no-store" });
      if (!response.ok) throw new Error("No fue posible consultar el archivo (" + response.status + ").");
      const json = await response.json();
      if (!json.salida || !json.entrada) throw new Error("El archivo no tiene la estructura de ejemplo esperada.");
      render(json);
    } catch (error) {
      salida.innerHTML = '<p class="compat-error" role="alert">' + esc(error.message) +
        '</p><p class="muted">Comprueba tu conexión a internet y que la rama de ejemplos siga disponible. Esta pantalla no modifica ni copia los JSON.</p>';
    }
  }
  select.addEventListener("change", cargar);
  cargar();
})();
