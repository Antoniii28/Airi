/* Simulador de SpeechRecognition para las pruebas de dictado (v0.6 E5). No usa el micrófono real.
   Configuración previa en window.__CFG_REC:
     sinApi        true → el navegador no ofrece SpeechRecognition
     disponible    respuesta de available(): "available" | "downloadable" | "downloading" | "unavailable"
     instalar      resultado de install() (true = se instala y pasa a "available")
     frase         texto reconocido; error: código de error en lugar de resultado
     retraso       ms hasta el resultado (largo = la escucha dura hasta que la prueba la detenga)
   Registro en window.__rec: creados, inicios [{lang, local, continuo}], paradas, abortos, consultas, instalaciones. */
(() => {
  const cfg = Object.assign({ disponible: "available", instalar: true, frase: "¿Qué comen los peces payaso?",
                              error: null, retraso: 400, sinApi: false }, window.__CFG_REC || {});
  window.__rec = { creados: 0, inicios: [], paradas: 0, abortos: 0, consultas: [], instalaciones: 0, activo: false };
  const def = (n, v) => Object.defineProperty(window, n, { value: v, configurable: true, writable: true });
  if (cfg.sinApi) { def("SpeechRecognition", undefined); def("webkitSpeechRecognition", undefined); return; }

  function SR() { window.__rec.creados++; this.lang = ""; this.processLocally = false; this.continuous = false; this._activo = false; }
  SR.prototype.start = function () {
    if (this._activo) throw new DOMException("ya iniciado", "InvalidStateError");
    this._activo = true; window.__rec.activo = true;
    window.__rec.inicios.push({ lang: this.lang, local: this.processLocally, continuo: this.continuous, parciales: this.interimResults });
    const yo = this;
    this._t = setTimeout(() => {
      if (cfg.error) { yo.onerror && yo.onerror({ error: cfg.error }); yo._fin(); return; }
      const palabras = cfg.frase.split(" ");
      yo.onresult && yo.onresult({ results: [[{ transcript: palabras.slice(0, 2).join(" ") }]] });   // resultado parcial
      yo.onresult && yo.onresult({ results: [[{ transcript: cfg.frase }]] });
      yo._t2 = setTimeout(() => yo._fin(), 80);
    }, cfg.retraso);
  };
  SR.prototype._fin = function () {
    if (!this._activo) return;
    this._activo = false; window.__rec.activo = false;
    clearTimeout(this._t); clearTimeout(this._t2);
    this.onend && this.onend();
  };
  SR.prototype.stop = function () {
    window.__rec.paradas++; const yo = this;
    // al parar, el navegador entrega lo que ya reconoció
    setTimeout(() => { if (yo._activo && yo.onresult) yo.onresult({ results: [[{ transcript: cfg.frase }]] }); yo._fin(); }, 30);
  };
  SR.prototype.abort = function () {
    window.__rec.abortos++; const yo = this;
    yo.onerror && yo.onerror({ error: "aborted" }); setTimeout(() => yo._fin(), 10);
  };
  SR.available = (o) => { window.__rec.consultas.push(o); return Promise.resolve(cfg.disponible); };
  SR.install = (o) => {
    window.__rec.instalaciones++; window.__rec.instalacion = o;
    return new Promise((r) => setTimeout(() => { if (cfg.instalar) cfg.disponible = "available"; r(!!cfg.instalar); }, 200));
  };
  def("SpeechRecognition", SR); def("webkitSpeechRecognition", SR);
})();
