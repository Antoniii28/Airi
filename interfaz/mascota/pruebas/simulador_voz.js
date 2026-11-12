// Simulador de speechSynthesis para las pruebas de e2e_voz.py (no se carga en la página real).
(() => {
  const cfg = window.__CFG_VOZ || {};
  window.__voz = { habladas: [], cancelaciones: 0, maxCola: 0, micro: 0 };
  if (cfg.sinSoporte) {
    Object.defineProperty(window, "speechSynthesis", { value: undefined, configurable: true });
    window.SpeechSynthesisUtterance = undefined;
  } else {
    const voces = cfg.voces || [{ lang: "en-US", name: "English", localService: true }, { lang: "es-MX", name: "Paulina", localService: true }];
    let cola = [], actual = null, t1 = null, t2 = null;
    const dur = cfg.duracion || 1500;
    const sig = () => {
      if (actual || !cola.length) return;
      actual = cola.shift();
      t1 = setTimeout(() => { actual && actual.onstart && actual.onstart(); }, 20);
      t2 = setTimeout(() => { const u = actual; actual = null; u && u.onend && u.onend(); sig(); }, dur);
    };
    window.__vozCola = () => (actual ? [actual.text] : []).concat(cola.map((u) => u.text));
    const s = {
      getVoices: () => voces, addEventListener() {}, removeEventListener() {},
      get speaking() { return !!actual; },
      speak(u) { window.__voz.habladas.push({ text: u.text, lang: u.lang, voice: u.voice ? u.voice.name : null,
                                              pitch: u.pitch, rate: u.rate });
                 cola.push(u); window.__voz.maxCola = Math.max(window.__voz.maxCola, cola.length + (actual ? 1 : 0)); sig(); },
      cancel() { window.__voz.cancelaciones++; clearTimeout(t1); clearTimeout(t2);
                 const pend = (actual ? [actual] : []).concat(cola); actual = null; cola = [];
                 pend.forEach((u) => u.onerror && u.onerror({ error: "interrupted" })); },
      pause() {}, resume() {}
    };
    Object.defineProperty(window, "speechSynthesis", { value: s, configurable: true });
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  }
  const espia = () => { window.__voz.micro++; return Promise.reject(new Error("no")); };
  try {
    if (!navigator.mediaDevices) Object.defineProperty(navigator, "mediaDevices", { value: {}, configurable: true });
    navigator.mediaDevices.getUserMedia = espia;
  } catch (e) {}
})();
