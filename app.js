/* Visteller — app-logica en rendering. Vanilla JS, geen framework nodig. */

const RADIUS = 80; // meter: binnen deze afstand is het dezelfde visplek

/* Versienummer = het PR-nummer waarin deze wijziging is gemerged. Puur
   zichtbaar onderaan het Vangen-scherm, zodat je kunt checken of de
   telefoon echt de nieuwste versie heeft opgehaald. */
const APP_VERSIE = 9;
const root = document.getElementById('app');

const state = {
  tab: 'vangen', datum: vandaagStr(), vangsten: [], plekken: [],
  vissers: [{ id: 'v1', naam: 'Ik' }, { id: 'v2', naam: 'Papa' }], actief: 'v1',
  sheet: null, info: null, dagOpen: null, plekOpen: null, diploma: null,
  geladen: false, weergave: 'tekening', badgeOpen: null
};

let registry = {};
let idc = 0;
function on(fn){ const id = 'h' + (idc++); registry[id] = fn; return id; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

const svgCache = {};
function svgVoor(f, i, sleutel, grijs){
  const k = f.n + '|' + (sleutel || '') + (grijs ? 'g' : '');
  if (!svgCache[k]) svgCache[k] = tekenVis(f, i, sleutel, grijs);
  return svgCache[k];
}

function setUi(patch){ Object.assign(state, patch); render(); }
function commit(patch){
  Object.assign(state, patch);
  render();
  bewaarStaat({
    vangsten: state.vangsten, plekken: state.plekken,
    vissers: state.vissers, actief: state.actief, weergave: state.weergave
  });
}

/* ---------- acties ---------- */
function kiesVisser(v){
  if (v.id === state.actief) { hernoemVisser(v); return; }
  commit({ actief: v.id });
  setUi({ dagOpen: null, info: null, sheet: null });
}
function hernoemVisser(v){
  const naam = window.prompt('Wie vist er?', v.naam);
  if (naam == null) return;
  const t = naam.trim().slice(0, 14); if (!t) return;
  commit({ vissers: state.vissers.map(x => x.id === v.id ? { ...x, naam: t } : x) });
}

/* Chrome/Android kan de utterance weggooien als er nergens meer naar
   verwezen wordt vlak voordat hij afspeelt — daarom hier bewaard. */
let laatsteUtterance = null;

/* Zolang deze interval loopt wordt de lopende speak() om de paar seconden
   even gepauzeerd/hervat — bekende workaround voor een Chrome-bug waarbij
   langere zinnen na ~15s abrupt stoppen of gaan haperen. */
let ttsKeepAlive = null;

function voorlezen(tekst){
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (ttsKeepAlive) { clearInterval(ttsKeepAlive); ttsKeepAlive = null; }
    const u = new SpeechSynthesisUtterance(tekst);
    u.lang = 'nl-NL'; u.rate = .9; u.pitch = 1.05;
    /* Meteen afspelen, ook als de stemmenlijst nog leeg is: op Android is die
       vaak pas na een (asynchrone) 'voiceschanged' beschikbaar, en wachten
       daarop zou hier betekenen dat speak() niet meer binnen de directe
       tik van de gebruiker valt — mobiele browsers negeren dat dan stil. */
    const stemmen = window.speechSynthesis.getVoices();
    if (stemmen.length) {
      const nl = stemmen.filter(s => /^nl/i.test(s.lang));
      const vrouw = /female|vrouw|woman|lotte|ellen|fenna|laura|claire|nl-NL-Standard-A|nl-NL-Wavenet-A|nl-nl-x-dma|google nederlands/i;
      const isVrouw = s => vrouw.test(s.name) && !/xander|male\b/i.test(s.name);
      /* Stemmen die niet lokaal op het toestel staan (localService===false)
         komen van een online spraak-engine (bv. Google's netwerkstemmen) en
         klinken vrijwel altijd veel natuurlijker dan de ingebouwde,
         robotachtige offline stem — dus die hebben voorkeur. */
      const netwerkStem = s => s.localService === false;
      const stem = nl.find(s => netwerkStem(s) && isVrouw(s))
        || nl.find(netwerkStem)
        || nl.find(isVrouw)
        || nl.find(s => !/xander|male\b/i.test(s.name))
        || nl[0];
      if (stem) u.voice = stem;
    }
    laatsteUtterance = u;
    window.speechSynthesis.speak(u);
    ttsKeepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) { clearInterval(ttsKeepAlive); ttsKeepAlive = null; return; }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 4000);
  } catch (e) {}
}

function kaartje(plekken, eigen, minSpan){
  const metGps = plekken.filter(p => p.lat != null);
  if (!metGps.length) return null;
  const W = 520, H = 300, pad = 52;
  const lats = metGps.map(p => p.lat);
  const midLat = (Math.min.apply(null, lats) + Math.max.apply(null, lats)) / 2;
  const mLat = 110540, mLon = 111320 * Math.cos(midLat * Math.PI / 180);
  const xs = metGps.map(p => p.lon * mLon), ys = metGps.map(p => -p.lat * mLat);
  const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
  const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
  const span = Math.max(maxX - minX, maxY - minY, minSpan || 140);
  const sc = Math.min((W - pad * 2) / span, (H - pad * 2) / span);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  let stip = '';
  metGps.forEach(p => {
    const x = W / 2 + (p.lon * mLon - cx) * sc, y = H / 2 + (-p.lat * mLat - cy) * sc;
    const tel = eigen.filter(v => v.plekId === p.id).length;
    const lx = Math.min(Math.max(x, 58), W - 58);
    stip += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" fill="#2F7D4F" fill-opacity=".18"/>`
      + `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="#2F7D4F" stroke="#fff" stroke-width="3"/>`
      + `<text x="${x.toFixed(1)}" y="${(y + 4.5).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${tel > 99 ? 99 : tel}</text>`
      + `<text x="${lx.toFixed(1)}" y="${(y + 34).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="800" fill="#134A52">${esc(p.naam)}</text>`;
  });
  const stapjes = [25, 50, 100, 250, 500, 1000, 2500];
  let barM = stapjes[0];
  stapjes.forEach(s => { if (s * sc <= W * 0.34) barM = s; });
  const barPx = barM * sc;
  return `<svg viewBox="0 0 ${W} ${H}" style="display:block;width:100%;height:auto" role="img" aria-label="Kaartje van je visplekken">`
    + `<rect x="0" y="0" width="${W}" height="${H}" rx="20" fill="#DBEAE6"/>`
    + `<path d="M0,84 C120,58 190,112 300,88 C390,68 460,96 520,80" fill="none" stroke="#C3DAD4" stroke-width="16" stroke-linecap="round"/>`
    + `<path d="M0,206 C110,232 200,178 310,204 C400,226 470,196 520,212" fill="none" stroke="#C3DAD4" stroke-width="22" stroke-linecap="round"/>`
    + stip
    + `<g transform="translate(20,${H - 22})"><rect x="0" y="-7" width="${barPx.toFixed(1)}" height="5" rx="2.5" fill="#134A52" fill-opacity=".55"/>`
    + `<text x="0" y="10" font-size="13" font-weight="700" fill="#4E7276">${barM} m</text></g></svg>`;
}

function laadPlaatje(src){
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
}

async function diplomaPlaatje(v){
  const f = vinden(v.soort);
  const W = 1000, H = 1400, g = document.createElement('canvas');
  g.width = W; g.height = H;
  const c = g.getContext('2d');
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
  const grd = c.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#1E7A8C'); grd.addColorStop(1, '#123F49');
  c.fillStyle = grd; c.fillRect(0, 0, W, H);
  const rond = (x, y, w, h, r) => {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  rond(46, 46, W - 92, H - 92, 44); c.fillStyle = '#FFFFFF'; c.fill();
  const mid = W / 2;
  c.textAlign = 'center';
  c.fillStyle = '#6E8A8C'; c.font = '700 30px "Baloo 2", sans-serif';
  c.fillText('VISTELLER · VANGSTDIPLOMA', mid, 130);
  const bx = 100, by = 176, bw = W - 200, bh = 470;
  rond(bx, by, bw, bh, 28); c.save(); c.clip();
  c.fillStyle = '#EAF1EF'; c.fillRect(bx, by, bw, bh);
  let beeld = null;
  try {
    if (v.foto) beeld = await laadPlaatje(v.foto);
    else {
      const svg = svgVoor(f, VISSEN.indexOf(f), 'diploma').replace('<svg viewBox=', `<svg width="${bw}" height="${bh}" viewBox=`);
      beeld = await laadPlaatje('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    }
  } catch (e) {}
  if (beeld) {
    if (v.foto) {
      const s = Math.max(bw / beeld.width, bh / beeld.height);
      const dw = beeld.width * s, dh = beeld.height * s;
      c.drawImage(beeld, bx + (bw - dw) / 2, by + (bh - dh) / 2, dw, dh);
    } else {
      c.drawImage(beeld, bx, by, bw, bh);
    }
  }
  c.restore();
  c.fillStyle = '#123A3F'; c.font = '800 96px "Baloo 2", sans-serif';
  c.fillText(f.n, mid, 780);
  const visser = (state.vissers.find(x => x.id === (v.visser || 'v1')) || {}).naam || '';
  c.fillStyle = '#6E8A8C'; c.font = '600 36px "Baloo 2", sans-serif';
  c.fillText('gevangen door ' + visser, mid, 832);
  const plek = (state.plekken.find(p => p.id === v.plekId) || {}).naam;
  const regels = [
    ['Lengte', v.lengte ? (v.lengte + ' cm') : 'niet gemeten'],
    ['Plek', plek || 'onbekend'],
    ['Datum', new Date(v.datum + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })]
  ];
  let y = 920;
  regels.forEach(r => {
    rond(100, y, W - 200, 96, 24); c.fillStyle = '#F4F8F7'; c.fill();
    c.textAlign = 'left'; c.fillStyle = '#6E8A8C'; c.font = '700 30px "Baloo 2", sans-serif';
    c.fillText(r[0], 132, y + 58);
    c.textAlign = 'right'; c.fillStyle = '#123A3F'; c.font = '800 40px "Baloo 2", sans-serif';
    c.fillText(r[1], W - 132, y + 60);
    y += 116;
  });
  c.textAlign = 'center'; c.fillStyle = '#F0A81E'; c.font = '800 34px "Baloo 2", sans-serif';
  c.fillText('Petje af!', mid, H - 108);
  return g;
}

async function deelDiploma(v){
  try {
    const canvas = await diplomaPlaatje(v);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    if (!blob) return;
    const naam = 'visteller-' + v.soort.toLowerCase() + '-' + v.datum + '.png';
    const file = new File([blob], naam, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Mijn vangst' }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = naam; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (e) {}
}

function regelsBreken(c, tekst, x, y, maxBreedte, regelHoogte){
  const woorden = tekst.split(' ');
  let regel = '', regels = [];
  woorden.forEach(w => {
    const proef = regel ? regel + ' ' + w : w;
    if (c.measureText(proef).width > maxBreedte && regel) { regels.push(regel); regel = w; }
    else regel = proef;
  });
  if (regel) regels.push(regel);
  const start = y - (regels.length - 1) * regelHoogte / 2;
  regels.forEach((r, i) => c.fillText(r, x, start + i * regelHoogte));
}

async function badgeCanvasMaken(b){
  const W = 800, H = 800, g = document.createElement('canvas');
  g.width = W; g.height = H;
  const c = g.getContext('2d');
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
  const grd = c.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#1E7A8C'); grd.addColorStop(1, '#123F49');
  c.fillStyle = grd; c.fillRect(0, 0, W, H);
  c.textAlign = 'center';
  c.fillStyle = 'rgba(255,255,255,.75)'; c.font = '700 26px "Baloo 2", sans-serif';
  c.fillText('VISTELLER · STICKER', W / 2, 100);
  c.beginPath(); c.arc(W / 2, 350, 170, 0, Math.PI * 2); c.fillStyle = b.kl; c.fill();
  c.fillStyle = '#fff'; c.font = '800 130px "Baloo 2", sans-serif';
  c.fillText(b.teken, W / 2, 392);
  c.fillStyle = '#fff'; c.font = '800 52px "Baloo 2", sans-serif';
  regelsBreken(c, b.label, W / 2, 580, W - 160, 62);
  return g;
}

async function deelBadge(b){
  try {
    const canvas = await badgeCanvasMaken(b);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    if (!blob) return;
    const naam = 'visteller-sticker-' + b.id + '.png';
    const file = new File([blob], naam, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Mijn sticker' }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = naam; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (e) {}
}

function kleinerMaken(file){
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = () => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const m = 520, sc = Math.min(1, m / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', .6));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

/* ---- vangst-flow ---- */
function openSheet(soort){
  const f = vinden(soort);
  const start = Math.max(3, Math.round(f.max * 0.35));
  setUi({ sheet: { soort, lengte: start, weet: true, plekId: null, nieuwOpen: false, nieuwNaam: '', foto: null, gps: 'zoeken', coords: null }, info: null });
  if (!navigator.geolocation) { gpsKlaar('nee', null); return; }
  navigator.geolocation.getCurrentPosition(
    p => gpsKlaar('ok', { lat: p.coords.latitude, lon: p.coords.longitude }),
    () => gpsKlaar('nee', null),
    { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
  );
}
function gpsKlaar(status, coords){
  if (!state.sheet) return;
  let plekId = state.sheet.plekId, nieuwOpen = state.sheet.nieuwOpen;
  if (coords) {
    let dichtst = null, best = 1e9;
    state.plekken.forEach(p => { if (p.lat == null) return; const d = afstand(coords, p); if (d < best) { best = d; dichtst = p; } });
    if (dichtst && best <= RADIUS) { plekId = dichtst.id; nieuwOpen = false; }
    else { plekId = null; nieuwOpen = true; }
  } else if (!state.plekken.length) { nieuwOpen = true; }
  setUi({ sheet: { ...state.sheet, gps: status, coords, plekId, nieuwOpen } });
}
function zetSheet(patch){ if (!state.sheet) return; setUi({ sheet: { ...state.sheet, ...patch } }); }
async function fotoKies(e){
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try { const url = await kleinerMaken(file); zetSheet({ foto: url }); } catch (err) {}
}
function bewaarVangst(){
  const s = state.sheet;
  if (!s) return;
  const nieuwNaam = (s.nieuwNaam || '').trim();
  let plekken = state.plekken.slice(), plekId = s.plekId;
  if (!plekId) {
    if (nieuwNaam || s.coords) {
      plekId = 'p' + Date.now();
      plekken.push({ id: plekId, naam: nieuwNaam || ('Plek ' + (plekken.length + 1)), lat: s.coords ? s.coords.lat : null, lon: s.coords ? s.coords.lon : null });
    }
  } else if (nieuwNaam) {
    plekken = plekken.map(p => p.id === plekId ? { ...p, naam: nieuwNaam } : p);
  }
  const eigen = state.vangsten.filter(x => (x.visser || 'v1') === state.actief);
  const eerderSoort = eigen.filter(v => v.soort === s.soort);
  const record = eerderSoort.reduce((a, v) => Math.max(a, v.lengte || 0), 0);
  const lengte = s.weet ? s.lengte : null;
  const v = { id: 'v' + Date.now() + Math.round(Math.random() * 999), soort: s.soort, datum: state.datum, lengte, plekId: plekId || null, foto: s.foto || null, ts: Date.now(), visser: state.actief };
  const vangsten = state.vangsten.concat([v]);
  const voor = badgesUit(eigen, state.plekken), na = badgesUit(eigen.concat([v]), plekken);
  const nieuw = BADGES.filter(b => na[b.id] && !voor[b.id]);
  const f = vinden(s.soort);
  let diploma = null;
  if (!eerderSoort.length) {
    diploma = { kop: 'Nieuwe soort!', titel: f.n, svg: svgVoor(f, VISSEN.indexOf(f), 'd'), vangst: v, sub: 'Deze vis had je nog nooit gevangen. Hij staat nu in je verzameling!', badges: nieuw };
  } else if (lengte && lengte > record) {
    diploma = { kop: 'Nieuw record', titel: lengte + ' cm ' + f.n.toLowerCase(), svg: svgVoor(f, VISSEN.indexOf(f), 'd'), vangst: v, sub: 'Dit is jouw grootste ' + f.n.toLowerCase() + ' ooit. Je oude record was ' + record + ' cm.', badges: nieuw };
  } else if (nieuw.length) {
    diploma = { kop: 'Nieuwe sticker', titel: 'Goed gedaan!', svg: svgVoor(f, VISSEN.indexOf(f), 'd'), vangst: v, sub: 'Je hebt er een sticker bij verdiend.', badges: nieuw };
  }
  commit({ vangsten, plekken });
  setUi({ sheet: null, diploma });
}
function wisVangst(id){ commit({ vangsten: state.vangsten.filter(v => v.id !== id) }); }
async function plekFoto(id, e){
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try { const url = await kleinerMaken(file); commit({ plekken: state.plekken.map(p => p.id === id ? { ...p, foto: url } : p) }); } catch (err) {}
}
async function vangstFoto(id, e){
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try { const url = await kleinerMaken(file); commit({ vangsten: state.vangsten.map(v => v.id === id ? { ...v, foto: url } : v) }); } catch (err) {}
}
function hernoemPlek(p){
  const naam = window.prompt('Hoe heet deze visplek?', p.naam);
  if (naam == null) return;
  const t = naam.trim(); if (!t) return;
  commit({ plekken: state.plekken.map(x => x.id === p.id ? { ...x, naam: t } : x) });
}
function wisAlles(){
  if (window.confirm('Alle vissen, dagen en plekken van iedereen wissen?')) commit({ vangsten: [], plekken: [] });
}

/* ---------- render: vangen ---------- */
function renderVangen(){
  const vandaag = vandaagStr();
  const eigen = state.vangsten.filter(v => (v.visser || 'v1') === state.actief);
  const opDatum = eigen.filter(v => v.datum === state.datum);
  const perSoortDag = {}; opDatum.forEach(v => { perSoortDag[v.soort] = (perSoortDag[v.soort] || 0) + 1; });
  const telTekst = opDatum.length ? (opDatum.length === 1 ? '1 vis gevangen' : opDatum.length + ' vissen gevangen') : 'nog niets gevangen';

  const vissersHtml = state.vissers.map(v => {
    const actief = v.id === state.actief;
    const tel = state.vangsten.filter(x => (x.visser || 'v1') === v.id).length;
    const id = on(() => kiesVisser(v));
    return `<button data-click="${id}" style="flex:1;background:${actief ? '#F0A81E' : 'rgba(255,255,255,.14)'};border:0;color:${actief ? '#123A3F' : '#EAF3F1'};border-radius:14px;padding:11px 8px;font-size:15px;font-weight:800">${esc(v.naam)} · ${tel}${actief ? ' ✏️' : ''}</button>`;
  }).join('');

  const datumId = on(e => { if (e.target.value) setUi({ datum: e.target.value }); });
  const vandaagId = on(() => setUi({ datum: vandaag }));

  const alsFoto = state.weergave === 'foto';
  const kiesTekeningId = on(() => commit({ weergave: 'tekening' }));
  const kiesFotoId = on(() => commit({ weergave: 'foto' }));

  const kaarten = VISSEN.map((f, i) => {
    const n = perSoortDag[f.n] || 0;
    const tikId = on(() => openSheet(f.n));
    const infoId = on(e => { e.stopPropagation(); setUi({ info: f.n, tab: 'info' }); });
    const beeld = (alsFoto && f.foto)
      ? `<img src="${f.foto}" alt="Foto van een ${esc(f.n).toLowerCase()}" style="display:block;width:100%;height:78px;object-fit:cover;border-radius:14px">`
      : svgVoor(f, i, 'k');
    return `<div style="position:relative">
      <button data-click="${tikId}" style="all:unset;display:block;width:100%;box-sizing:border-box;background:#fff;border:3px solid ${n ? '#F0A81E' : '#ffffff'};border-radius:22px;padding:12px 8px 10px;text-align:center;box-shadow:0 3px 0 #CBDCD9">
        <span style="display:grid;place-items:center;width:100%;height:78px;min-height:0;overflow:hidden">${beeld}</span>
        <span style="display:block;font-size:16px;font-weight:800;margin-top:6px;color:#123A3F">${esc(f.n)}</span>
      </button>
      ${n ? `<span style="position:absolute;top:-7px;left:-7px;min-width:34px;height:34px;padding:0 8px;border-radius:17px;background:#F0A81E;color:#123A3F;font-size:18px;font-weight:800;display:grid;place-items:center;box-shadow:0 2px 0 #C88A12">${n}</span>` : ''}
      <button data-click="${infoId}" aria-label="Meer over de vis" style="position:absolute;top:-9px;right:-9px;width:40px;height:40px;border-radius:50%;background:#fff;border:2px solid #CBDCD9;color:#6E8A8C;font-size:20px;font-weight:800;line-height:1;display:grid;place-items:center;box-shadow:0 2px 0 #CBDCD9">?</button>
    </div>`;
  }).join('');

  const vandaagLijst = opDatum.length ? `<div style="margin-top:24px">
    <h3 style="font-size:17px;font-weight:800;margin:0 0 10px">Jouw vangsten op deze dag</h3>
    ${opDatum.slice().sort((a, b) => b.ts - a.ts).map(v => {
      const f = vinden(v.soort);
      const wisId = on(() => wisVangst(v.id));
      return `<div style="display:flex;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:8px 10px 8px 6px;margin-bottom:8px;box-shadow:0 2px 0 #CBDCD9">
        <span style="flex:none;width:78px;height:42px;display:grid;place-items:center;overflow:hidden">${svgVoor(f, VISSEN.indexOf(f), 'm')}</span>
        <span style="flex:1;min-width:0"><span style="display:block;font-size:16px;font-weight:800">${esc(v.soort)}</span><span style="display:block;font-size:13px;color:#6E8A8C">${esc(regelVan(v))}</span></span>
        <button data-click="${wisId}" aria-label="Deze vangst weghalen" style="flex:none;width:38px;height:38px;border-radius:50%;background:#F4F8F7;border:2px solid #CBDCD9;color:#6E8A8C;font-size:17px;font-weight:800;line-height:1">×</button>
      </div>`;
    }).join('')}
  </div>` : '';

  return `<div>
    <div style="background:linear-gradient(160deg,#1E7A8C 0%,#17545C 60%,#134A52 100%);border-radius:0 0 26px 26px;margin:0 -14px 18px;padding:calc(env(safe-area-inset-top) + 18px) 18px 20px;color:#fff;position:relative;overflow:hidden">
      <div style="position:absolute;right:-30px;top:-30px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.06)"></div>
      <div style="position:relative;display:flex;align-items:center;gap:14px">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.7">Visteller</div>
          <div style="font-size:22px;font-weight:800;line-height:1.15;margin-top:2px">${esc(langeDag(state.datum))}</div>
          <div style="font-size:15px;opacity:.85;margin-top:2px">${telTekst}</div>
        </div>
        <div style="flex:none;width:68px;height:68px;border-radius:50%;background:#F0A81E;color:#123A3F;display:grid;place-items:center;font-size:30px;font-weight:800;box-shadow:0 4px 0 #C88A12">${opDatum.length}</div>
      </div>
      <div style="position:relative;display:flex;gap:8px;margin-top:14px">${vissersHtml}</div>
      <div style="position:relative;font-size:12px;opacity:.65;margin-top:6px">Tik op je eigen naam om hem te veranderen.</div>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:16px">
      <input type="date" value="${state.datum}" max="${vandaag}" data-change="${datumId}" style="flex:1;font-weight:600;font-size:16px;color:#123A3F;background:#fff;border:2px solid #CBDCD9;border-radius:14px;padding:11px 12px;min-height:50px">
      <button data-click="${vandaagId}" style="background:#fff;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:14px;padding:0 16px;font-weight:700;font-size:15px;min-height:50px">Vandaag</button>
    </div>

    <h2 style="font-size:20px;font-weight:800;margin:0 0 2px">Wat heb je gevangen?</h2>
    <p style="font-size:15px;color:#6E8A8C;margin:0 0 12px;line-height:1.4">Tik op de vis die je ving. Tik op het vraagteken om hem eerst goed te bekijken.</p>

    <div style="display:flex;gap:6px;background:#fff;border:2px solid #CBDCD9;border-radius:16px;padding:5px;margin-bottom:14px">
      <button data-click="${kiesTekeningId}" style="flex:1;background:${alsFoto ? 'transparent' : '#1E7A8C'};border:0;color:${alsFoto ? '#6E8A8C' : '#ffffff'};border-radius:12px;padding:11px 8px;font-size:15px;font-weight:800">Tekening</button>
      <button data-click="${kiesFotoId}" style="flex:1;background:${alsFoto ? '#1E7A8C' : 'transparent'};border:0;color:${alsFoto ? '#ffffff' : '#6E8A8C'};border-radius:12px;padding:11px 8px;font-size:15px;font-weight:800">Foto</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${kaarten}</div>
    ${vandaagLijst}
    <div style="text-align:center;font-size:11px;color:#B7C6C4;margin-top:24px">Visteller v${APP_VERSIE}</div>
  </div>`;
}
function regelVan(v){
  const d = [];
  if (v.lengte) d.push(v.lengte + ' cm');
  const p = state.plekken.find(x => x.id === v.plekId);
  if (p) d.push(p.naam);
  const t = new Date(v.ts);
  d.push(String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'));
  return d.join(' · ');
}

/* ---------- gedeelde header (zelfde stijl als het Vangen-scherm) ---------- */
function renderHeaderKop(titel, ondertitel, extraHtml){
  return `<div style="background:linear-gradient(160deg,#1E7A8C 0%,#17545C 60%,#134A52 100%);border-radius:0 0 26px 26px;margin:0 -14px 18px;padding:calc(env(safe-area-inset-top) + 18px) 18px 20px;color:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;right:-30px;top:-30px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.06)"></div>
    <div style="position:relative">
      <div style="font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.7">Visteller</div>
      <div style="font-size:22px;font-weight:800;line-height:1.15;margin-top:2px">${esc(titel)}</div>
      ${ondertitel ? `<div style="font-size:15px;opacity:.85;margin-top:4px;line-height:1.35">${esc(ondertitel)}</div>` : ''}
    </div>
    ${extraHtml || ''}
  </div>`;
}
function headerTellers(items){
  return `<div style="position:relative;display:flex;gap:8px;margin-top:14px">
    ${items.map(([waarde, label]) => `<div style="flex:1;background:rgba(255,255,255,.14);border-radius:14px;padding:12px 8px;text-align:center"><strong style="display:block;font-size:22px;font-weight:800;line-height:1;color:#fff">${waarde}</strong><span style="font-size:12px;color:rgba(255,255,255,.75)">${esc(label)}</span></div>`).join('')}
  </div>`;
}

/* ---------- render: verzameling ---------- */
function renderVerzameling(){
  const ikNu = state.vissers.find(x => x.id === state.actief) || state.vissers[0] || { naam: '' };
  const eigen = state.vangsten.filter(v => (v.visser || 'v1') === state.actief);
  const perSoort = {}; eigen.forEach(v => { perSoort[v.soort] = (perSoort[v.soort] || 0) + 1; });
  const record = {}; eigen.forEach(v => { if (v.lengte) record[v.soort] = Math.max(record[v.soort] || 0, v.lengte); });
  const totVissen = eigen.length;
  const soortenLijst = Object.keys(perSoort);
  const dagTel = {}; eigen.forEach(v => { dagTel[v.datum] = (dagTel[v.datum] || 0) + 1; });
  const beste = Object.keys(dagTel).sort((a, b) => dagTel[b] - dagTel[a])[0];
  const soortTekst = totVissen ? (soortenLijst.length + ' van de 12 soorten gevangen' + (beste ? ' · beste dag ' + korteDag(beste) : '')) : 'Nog niets gevangen. Tik bij Vangen op je eerste vis!';

  const verzamel = VISSEN.map((f, i) => {
    const n = perSoort[f.n] || 0;
    const r = record[f.n];
    const id = on(() => setUi({ info: f.n, tab: 'info' }));
    return `<button data-click="${id}" style="all:unset;display:block;box-sizing:border-box;position:relative;background:${n ? '#ffffff' : '#F1F6F4'};border:3px solid ${n ? '#F0A81E' : '#E2EBE8'};border-radius:22px;padding:12px 8px 10px;text-align:center;box-shadow:0 3px 0 #CBDCD9">
      <span style="display:grid;place-items:center;height:70px;overflow:hidden;opacity:${n ? 1 : .85}">${svgVoor(f, i, 'v', n === 0)}</span>
      <span style="display:block;font-size:15px;font-weight:800;margin-top:4px;color:${n ? '#123A3F' : '#8AA3A4'}">${esc(f.n)}</span>
      <span style="display:block;font-size:13px;color:#6E8A8C">${n ? (n + '×' + (r ? ' · record ' + r + ' cm' : '')) : 'nog niet gevangen'}</span>
    </button>`;
  }).join('');

  const uit = badgesUit(eigen, state.plekken);
  const badges = BADGES.map(b => {
    const verdiend = !!uit[b.id];
    const inhoud = `<span style="flex:none;width:44px;height:44px;border-radius:50%;background:${verdiend ? b.kl : '#CBDCD9'};color:#fff;display:grid;place-items:center;font-size:17px;font-weight:800;line-height:1">${b.teken}</span>
    <span style="font-size:14px;font-weight:700;line-height:1.25;color:${verdiend ? '#123A3F' : '#8AA3A4'}">${esc(b.label)}</span>`;
    if (!verdiend) return `<div style="display:flex;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:10px;box-shadow:0 2px 0 #CBDCD9;opacity:.6">${inhoud}</div>`;
    const id = on(() => setUi({ badgeOpen: b.id }));
    return `<button data-click="${id}" style="all:unset;display:flex;box-sizing:border-box;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:10px;box-shadow:0 2px 0 #CBDCD9;cursor:pointer">${inhoud}</button>`;
  }).join('');

  const wisId = on(wisAlles);
  const exportId = on(() => exporteerBackup());
  const importId = on(async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const data = await importeerBackup(file);
      state.vangsten = data.vangsten || [];
      state.plekken = data.plekken || [];
      if (data.vissers && data.vissers.length) state.vissers = data.vissers;
      if (data.actief) state.actief = data.actief;
      render();
      window.alert('Back-up teruggezet!');
    } catch (err) { window.alert('Kon dit back-upbestand niet lezen.'); }
  });

  const statsHtml = headerTellers([
    [totVissen, 'vissen'],
    [soortenLijst.length + '/12', 'soorten'],
    [beste ? dagTel[beste] : 0, 'beste dag']
  ]);

  return `<div>
    ${renderHeaderKop('Verzameling van ' + ikNu.naam, soortTekst, statsHtml)}
    <h3 style="font-size:17px;font-weight:800;margin:0 0 4px">Verzamelkaart</h3>
    <p style="font-size:14px;color:#6E8A8C;margin:0 0 12px">Grijze vissen heb je nog nooit gevangen.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:26px">${verzamel}</div>
    <h3 style="font-size:17px;font-weight:800;margin:0 0 12px">Mijn stickers</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px">${badges}</div>
    <h3 style="font-size:17px;font-weight:800;margin:0 0 10px">Back-up</h3>
    <p style="font-size:14px;color:#6E8A8C;margin:0 0 12px;line-height:1.4">Bewaar af en toe een back-up-bestand, dan raak je niets kwijt als je telefoon wisselt.</p>
    <div style="display:flex;gap:8px;margin-bottom:24px">
      <button data-click="${exportId}" style="flex:1;background:#fff;border:2px solid #CBDCD9;color:#17545C;border-radius:14px;padding:13px;font-weight:700;font-size:14px">Back-up maken</button>
      <label style="flex:1;position:relative;background:#fff;border:2px solid #CBDCD9;color:#17545C;border-radius:14px;padding:13px;font-weight:700;font-size:14px;text-align:center">
        Back-up terugzetten
        <input type="file" accept="application/json" data-change="${importId}" style="position:absolute;inset:0;width:100%;height:100%;opacity:0">
      </label>
    </div>
    <button data-click="${wisId}" style="width:100%;background:none;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:14px;padding:14px;font-weight:700;font-size:14px;margin-bottom:10px">Alles wissen (voor papa)</button>
  </div>`;
}

/* ---------- render: dagen ---------- */
function renderDagen(){
  const ikNu = state.vissers.find(x => x.id === state.actief) || state.vissers[0] || { naam: '' };
  const eigen = state.vangsten.filter(v => (v.visser || 'v1') === state.actief);
  const dagTel = {}; eigen.forEach(v => { dagTel[v.datum] = (dagTel[v.datum] || 0) + 1; });
  const dagenKeys = Object.keys(dagTel).sort().reverse();
  const plekNaam = id => { const p = state.plekken.find(x => x.id === id); return p ? p.naam : null; };

  const dagenHtml = dagenKeys.length === 0
    ? `<p style="background:#fff;border-radius:18px;padding:18px;color:#6E8A8C;font-size:15px;line-height:1.5;box-shadow:0 3px 0 #CBDCD9">Nog geen visdag. Tik bij <b>Vangen</b> op je eerste vis, dan komt vandaag hier te staan.</p>`
    : dagenKeys.map(d => {
      const vs = eigen.filter(v => v.datum === d);
      const per = {}; vs.forEach(v => { per[v.soort] = (per[v.soort] || 0) + 1; });
      const plek = {}; vs.forEach(v => { const pn = plekNaam(v.plekId); if (pn) plek[pn] = 1; });
      const pk = Object.keys(plek);
      const regel = Object.keys(per).map(k => k + ' ' + per[k] + '×').join(', ') + (pk.length ? ' — ' + pk.join(', ') : '');
      const id = on(() => setUi({ tab: 'dag', dagOpen: d }));
      return `<button data-click="${id}" style="all:unset;display:flex;box-sizing:border-box;width:100%;align-items:center;gap:12px;background:#fff;border-radius:18px;padding:13px 14px;margin-bottom:10px;box-shadow:0 3px 0 #CBDCD9">
        <span style="flex:1;min-width:0"><span style="display:block;font-size:16px;font-weight:800">${esc(langeDag(d))}</span><span style="display:block;font-size:13px;color:#6E8A8C;line-height:1.35">${esc(regel)}</span></span>
        <span style="flex:none;font-size:24px;font-weight:800;color:#1E7A8C">${vs.length}</span>
      </button>`;
    }).join('');

  const besteDag = dagenKeys.reduce((a, d) => Math.max(a, dagTel[d]), 0);
  const dagenStats = headerTellers([
    [dagenKeys.length, dagenKeys.length === 1 ? 'visdag' : 'visdagen'],
    [eigen.length, 'vissen'],
    [besteDag, 'beste dag']
  ]);

  return `<div>
    ${renderHeaderKop('Visdagen', 'Elke dag dat ' + ikNu.naam + ' heeft gevist.', dagenStats)}
    ${dagenHtml}
  </div>`;
}

/* ---------- render: plekken ---------- */
function renderPlekken(){
  const ikNu = state.vissers.find(x => x.id === state.actief) || state.vissers[0] || { naam: '' };
  const eigen = state.vangsten.filter(v => (v.visser || 'v1') === state.actief);

  const perPlekTel = {};
  eigen.forEach(v => { if (v.plekId) perPlekTel[v.plekId] = (perPlekTel[v.plekId] || 0) + 1; });
  const plekkenStats = headerTellers([
    [state.plekken.length, state.plekken.length === 1 ? 'plek' : 'plekken'],
    [eigen.filter(v => v.plekId).length, 'vissen'],
    [Object.values(perPlekTel).reduce((a, n) => Math.max(a, n), 0), 'beste plek']
  ]);

  const kaart = kaartje(state.plekken, eigen);
  const kaartHtml = kaart ? `<div style="background:#fff;border-radius:18px;padding:10px;margin-bottom:10px;box-shadow:0 3px 0 #CBDCD9">${kaart}</div>` : '';

  const plekLijst = state.plekken.length === 0
    ? `<p style="background:#fff;border-radius:18px;padding:18px;color:#6E8A8C;font-size:15px;line-height:1.5;box-shadow:0 3px 0 #CBDCD9">Nog geen plekken. Bij je volgende vangst mag je je visplek een naam geven.</p>`
    : state.plekken.map(p => {
      const vs = eigen.filter(v => v.plekId === p.id);
      const dg = {}; vs.forEach(v => dg[v.datum] = 1);
      const dgN = Object.keys(dg).length;
      const per = {}; vs.forEach(v => { per[v.soort] = (per[v.soort] || 0) + 1; });
      const top = Object.keys(per).sort((a, b) => per[b] - per[a])[0];
      const grootste = vs.reduce((a, v) => (v.lengte && v.lengte > a) ? v.lengte : a, 0);
      const laatst = vs.map(v => v.datum).sort().pop();
      const stukjes = [];
      if (top) stukjes.push('meestal ' + top.toLowerCase() + ' (' + per[top] + '×)');
      if (grootste) stukjes.push('grootste ' + grootste + ' cm');
      if (laatst) stukjes.push('laatst ' + korteDag(laatst));
      const openId = on(() => setUi({ tab: 'plek', plekOpen: p.id }));
      const hernoemId = on(() => hernoemPlek(p));
      const fotoId = on(e => plekFoto(p.id, e));
      const regel = vs.length ? ((vs.length === 1 ? '1 vis' : vs.length + ' vissen') + ' · ' + dgN + (dgN === 1 ? ' dag' : ' dagen')) : 'nog geen vangst van ' + ikNu.naam;
      return `<div style="background:#fff;border-radius:16px;padding:11px 12px;margin-bottom:8px;box-shadow:0 2px 0 #CBDCD9">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="flex:none;width:12px;height:12px;border-radius:50%;background:#2F7D4F"></span>
          <button data-click="${openId}" style="all:unset;flex:1;min-width:0;cursor:pointer">
            <span style="display:block;font-size:16px;font-weight:800;color:#123A3F">${esc(p.naam)} <span style="color:#6E8A8C">›</span></span>
            <span style="display:block;font-size:13px;color:#6E8A8C">${esc(regel)}</span>
            ${stukjes.length ? `<span style="display:block;font-size:13px;color:#2F7D4F;font-weight:700;line-height:1.3">${esc(stukjes.join(' · '))}</span>` : ''}
          </button>
          <label style="flex:none;position:relative;background:#F4F8F7;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:700">
            ${p.foto ? 'Foto ✓' : 'Foto'}
            <input type="file" accept="image/*" data-change="${fotoId}" style="position:absolute;inset:0;width:100%;height:100%;opacity:0">
          </label>
          <button data-click="${hernoemId}" style="flex:none;background:#F4F8F7;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:700">Naam</button>
        </div>
        ${p.foto ? `<div style="margin-top:10px"><img src="${p.foto}" alt="Foto van ${esc(p.naam)}" style="display:block;width:100%;height:170px;object-fit:cover;border-radius:12px"></div>` : ''}
      </div>`;
    }).join('');

  return `<div>
    ${renderHeaderKop('Visplekken', 'Sta je vlak bij een plek die je al kent, dan gebruikt de app die plek weer.', plekkenStats)}
    ${kaartHtml}
    ${plekLijst}
  </div>`;
}

/* ---------- render: dag detail ---------- */
function renderDag(){
  const eigen = state.vangsten.filter(v => (v.visser || 'v1') === state.actief);
  const dd = state.dagOpen;
  const ddVangsten = dd ? eigen.filter(v => v.datum === dd).slice().sort((a, b) => b.ts - a.ts) : [];
  const terugId = on(() => setUi({ tab: 'dagen', dagOpen: null }));
  const naarDezeDagId = on(() => setUi({ tab: 'vangen', datum: dd || state.datum }));
  const rijen = ddVangsten.map(v => {
    const f = vinden(v.soort);
    const diplomaId = on(() => deelDiploma(v));
    const wisId = on(() => wisVangst(v.id));
    const fotoId = on(e => vangstFoto(v.id, e));
    return `<div style="background:#fff;border-radius:18px;padding:10px 12px 10px 6px;margin-bottom:10px;box-shadow:0 3px 0 #CBDCD9">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="flex:none;width:86px;height:46px;display:grid;place-items:center;overflow:hidden">${svgVoor(f, VISSEN.indexOf(f), 'm')}</span>
        <span style="flex:1;min-width:0"><span style="display:block;font-size:17px;font-weight:800">${esc(v.soort)}</span><span style="display:block;font-size:13px;color:#6E8A8C;line-height:1.35">${esc(regelVan(v))}</span></span>
        <button data-click="${wisId}" aria-label="Deze vangst weghalen" style="flex:none;width:38px;height:38px;border-radius:50%;background:#F4F8F7;border:2px solid #CBDCD9;color:#6E8A8C;font-size:17px;font-weight:800;line-height:1">×</button>
      </div>
      ${v.foto ? `<img src="${v.foto}" alt="Foto van de vangst" style="display:block;width:100%;height:180px;object-fit:cover;border-radius:12px;margin-top:8px">` : ''}
      <div style="display:flex;gap:8px;margin-top:8px">
        <label style="flex:1;position:relative;background:#F4F8F7;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:700;text-align:center">
          ${v.foto ? 'Andere foto' : 'Foto toevoegen'}
          <input type="file" accept="image/*" data-change="${fotoId}" style="position:absolute;inset:0;width:100%;height:100%;opacity:0">
        </label>
        <button data-click="${diplomaId}" style="flex:1;background:#F4F8F7;border:2px solid #CBDCD9;color:#17545C;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:800">Diploma</button>
      </div>
    </div>`;
  }).join('');
  return `<div style="padding-top:calc(env(safe-area-inset-top) + 18px)">
    <button data-click="${terugId}" style="background:none;border:0;color:#6E8A8C;font-size:15px;font-weight:800;padding:6px 0;margin-bottom:6px">‹ Alle visdagen</button>
    <h1 style="font-size:24px;font-weight:800;margin:0 0 2px">${dd ? esc(langeDag(dd)) : ''}</h1>
    <p style="font-size:15px;color:#6E8A8C;margin:0 0 16px">${ddVangsten.length === 1 ? '1 vis gevangen' : ddVangsten.length + ' vissen gevangen'}</p>
    ${rijen}
    <button data-click="${naarDezeDagId}" style="width:100%;background:#1E7A8C;border:0;color:#fff;border-radius:16px;padding:16px;font-weight:800;font-size:17px;box-shadow:0 4px 0 #17545C;margin-top:6px">Vis toevoegen aan deze dag</button>
  </div>`;
}

/* ---------- render: plek detail ---------- */
function renderPlek(){
  const eigen = state.vangsten.filter(v => (v.visser || 'v1') === state.actief);
  const po = state.plekOpen ? state.plekken.find(p => p.id === state.plekOpen) : null;
  if (!po) return renderPlekken();
  const vs = eigen.filter(v => v.plekId === po.id).slice().sort((a, b) => b.ts - a.ts);
  const per = {}; vs.forEach(v => { per[v.soort] = (per[v.soort] || 0) + 1; });
  const dgn = {}; vs.forEach(v => { dgn[v.datum] = (dgn[v.datum] || 0) + 1; });
  const dagKeys = Object.keys(dgn).sort().reverse();
  const pk = kaartje([po], eigen, 120);
  const kaartUrl = po.lat != null ? `https://www.google.com/maps/search/?api=1&query=${po.lat},${po.lon}` : null;

  const terugId = on(() => setUi({ tab: 'plekken', plekOpen: null }));
  const fotoId = on(e => plekFoto(po.id, e));
  const hernoemId = on(() => hernoemPlek(po));

  const soortenHtml = Object.keys(per).sort((a, b) => per[b] - per[a]).map(naam => {
    const f = vinden(naam);
    const r = vs.reduce((a, v) => (v.soort === naam && v.lengte && v.lengte > a) ? v.lengte : a, 0);
    return `<div style="display:flex;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:8px 12px 8px 6px;margin-bottom:8px;box-shadow:0 2px 0 #CBDCD9">
      <span style="flex:none;width:78px;height:42px;display:grid;place-items:center;overflow:hidden">${svgVoor(f, VISSEN.indexOf(f), 'm')}</span>
      <span style="flex:1;min-width:0"><span style="display:block;font-size:16px;font-weight:800">${esc(naam)}</span><span style="display:block;font-size:13px;color:#6E8A8C">${r ? 'grootste ' + r + ' cm' : 'niet gemeten'}</span></span>
      <span style="flex:none;font-size:19px;font-weight:800;color:#1E7A8C">${per[naam]}×</span>
    </div>`;
  }).join('');

  const dagenHtml = dagKeys.map(d => {
    const dagVs = vs.filter(v => v.datum === d);
    return `<div style="margin-top:20px">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px">
        <h3 style="flex:1;min-width:0;font-size:17px;font-weight:800;margin:0">${esc(langeDag(d))}</h3>
        <span style="flex:none;font-size:13px;font-weight:700;color:#6E8A8C">${dgn[d] === 1 ? '1 vis' : dgn[d] + ' vissen'}</span>
      </div>
      ${dagVs.map(v => {
        const f = vinden(v.soort);
        const t = new Date(v.ts);
        const diplomaId = on(() => deelDiploma(v));
        return `<div style="display:flex;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:8px 12px 8px 6px;margin-bottom:8px;box-shadow:0 2px 0 #CBDCD9">
          <span style="flex:none;width:78px;height:42px;display:grid;place-items:center;overflow:hidden">${svgVoor(f, VISSEN.indexOf(f), 'm')}</span>
          <span style="flex:1;min-width:0"><span style="display:block;font-size:16px;font-weight:800">${esc(v.soort)}</span><span style="display:block;font-size:13px;color:#6E8A8C">${(v.lengte ? v.lengte + ' cm · ' : '') + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0')}</span></span>
          <button data-click="${diplomaId}" style="flex:none;background:#F4F8F7;border:2px solid #CBDCD9;color:#17545C;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:800">Diploma</button>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  return `<div style="padding-top:calc(env(safe-area-inset-top) + 18px)">
    <button data-click="${terugId}" style="background:none;border:0;color:#6E8A8C;font-size:15px;font-weight:800;padding:6px 0;margin-bottom:6px">‹ Alle visplekken</button>
    <h1 style="font-size:26px;font-weight:800;margin:0 0 12px">${esc(po.naam)}</h1>
    ${po.foto ? `<div style="margin-bottom:10px"><img src="${po.foto}" alt="Foto van ${esc(po.naam)}" style="display:block;width:100%;height:210px;object-fit:cover;border-radius:18px"></div>` : ''}
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <label style="flex:1;position:relative;background:#fff;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:14px;padding:12px;font-size:14px;font-weight:700;text-align:center">
        ${po.foto ? 'Andere foto' : 'Foto van deze plek'}
        <input type="file" accept="image/*" data-change="${fotoId}" style="position:absolute;inset:0;width:100%;height:100%;opacity:0">
      </label>
      <button data-click="${hernoemId}" style="flex:none;background:#fff;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:14px;padding:12px 18px;font-size:14px;font-weight:700">Naam</button>
    </div>
    ${pk ? `<div style="background:#fff;border-radius:18px;padding:10px;margin-bottom:10px;box-shadow:0 3px 0 #CBDCD9">${pk}</div>` : ''}
    ${kaartUrl ? `<a href="${kaartUrl}" target="_blank" rel="noopener" style="display:block;text-align:center;background:#1E7A8C;color:#fff;border-radius:14px;padding:12px;font-weight:800;font-size:14px;text-decoration:none;margin-bottom:14px">Bekijk deze plek op de echte kaart</a>` : ''}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      <div style="background:#fff;border-radius:18px;padding:14px 8px;text-align:center;box-shadow:0 3px 0 #CBDCD9"><strong style="display:block;font-size:28px;font-weight:800;line-height:1">${vs.length}</strong><span style="font-size:13px;color:#6E8A8C">vissen</span></div>
      <div style="background:#fff;border-radius:18px;padding:14px 8px;text-align:center;box-shadow:0 3px 0 #CBDCD9"><strong style="display:block;font-size:28px;font-weight:800;line-height:1">${Object.keys(per).length}</strong><span style="font-size:13px;color:#6E8A8C">soorten</span></div>
      <div style="background:#fff;border-radius:18px;padding:14px 8px;text-align:center;box-shadow:0 3px 0 #CBDCD9"><strong style="display:block;font-size:28px;font-weight:800;line-height:1">${dagKeys.length}</strong><span style="font-size:13px;color:#6E8A8C">dagen</span></div>
    </div>
    ${vs.length === 0 ? `<p style="background:#fff;border-radius:18px;padding:18px;color:#6E8A8C;font-size:15px;line-height:1.5;box-shadow:0 3px 0 #CBDCD9">Hier heb je nog niets gevangen.</p>` : ''}
    ${soortenHtml}
    ${dagenHtml}
  </div>`;
}

/* ---------- render: info ---------- */
function renderInfo(){
  if (!state.info) return renderVangen();
  const eigen = state.vangsten.filter(v => (v.visser || 'v1') === state.actief);
  const perSoort = {}; eigen.forEach(v => { perSoort[v.soort] = (perSoort[v.soort] || 0) + 1; });
  const record = {}; eigen.forEach(v => { if (v.lengte) record[v.soort] = Math.max(record[v.soort] || 0, v.lengte); });
  const f = vinden(state.info), i = VISSEN.indexOf(f);
  const n = perSoort[f.n] || 0, r = record[f.n];
  const terugId = on(() => setUi({ tab: 'vangen', info: null }));
  const plusId = on(() => openSheet(f.n));
  const kanVoorlezen = !!window.speechSynthesis;
  const voorleesId = on(() => voorlezen(f.n + '. ' + f.feit.wist + ' Hij wordt ' + f.feit.groot + ' groot en eet ' + f.feit.eet + '.'));
  const jij = (n ? (n === 1 ? '1 keer' : n + ' keer') : 'nog geen') + (r ? ' · record ' + r + ' cm' : '');

  const vangstenVanSoort = eigen.filter(v => v.soort === f.n).slice().sort((a, b) => b.ts - a.ts);
  const vangstenHtml = vangstenVanSoort.length ? `<div style="margin-bottom:14px">
    <h3 style="font-size:17px;font-weight:800;margin:0 0 10px">Al mijn vangsten van deze soort</h3>
    ${vangstenVanSoort.map(v => {
      const diplomaId = on(() => deelDiploma(v));
      const t = new Date(v.ts);
      const p = state.plekken.find(x => x.id === v.plekId);
      const regel = [v.lengte ? v.lengte + ' cm' : null, p ? p.naam : null, String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0')].filter(Boolean).join(' · ');
      return `<div style="display:flex;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:10px 12px;margin-bottom:8px;box-shadow:0 2px 0 #CBDCD9">
        <span style="flex:1;min-width:0"><span style="display:block;font-size:16px;font-weight:800">${esc(langeDag(v.datum))}</span><span style="display:block;font-size:13px;color:#6E8A8C">${esc(regel)}</span></span>
        <button data-click="${diplomaId}" style="flex:none;background:#F4F8F7;border:2px solid #CBDCD9;color:#17545C;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:800">Diploma</button>
      </div>`;
    }).join('')}
  </div>` : '';

  return `<div style="padding-top:calc(env(safe-area-inset-top) + 18px)">
    <button data-click="${terugId}" style="background:none;border:0;color:#6E8A8C;font-size:15px;font-weight:800;padding:6px 0;margin-bottom:6px">‹ Terug</button>
    <div style="background:#fff;border-radius:24px;padding:16px;box-shadow:0 3px 0 #CBDCD9;margin-bottom:14px">
      ${f.foto
        ? `<img src="${f.foto}" alt="Foto van een ${esc(f.n).toLowerCase()}" style="display:block;width:100%;height:230px;object-fit:cover;border-radius:16px;margin-bottom:12px">`
        : `<div style="display:block;width:100%;height:230px;margin-bottom:12px;display:grid;place-items:center">${svgVoor(f, i, 'i')}</div>`}
      <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:14px">
        <div style="flex:1;min-width:0"><h1 style="font-size:28px;font-weight:800;margin:0">${esc(f.n)}</h1><p style="font-size:14px;color:#6E8A8C;margin:0;font-style:italic">${esc(f.lat)}</p></div>
        ${kanVoorlezen ? `<button data-click="${voorleesId}" aria-label="Lees voor" style="flex:none;display:flex;align-items:center;gap:8px;background:#1E7A8C;border:0;color:#fff;border-radius:16px;padding:12px 16px;font-size:15px;font-weight:800;box-shadow:0 3px 0 #17545C"><span style="display:block;width:0;height:0;border-left:12px solid #fff;border-top:8px solid transparent;border-bottom:8px solid transparent"></span>Voorlezen</button>` : ''}
      </div>
      <div style="margin-bottom:12px">
        <div style="height:16px;background:#E9F3EF;border-radius:8px;overflow:hidden"><span style="display:block;height:100%;width:${Math.round(f.max / 130 * 100)}%;background:#F0A81E;border-radius:8px"></span></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#6E8A8C;margin-top:4px"><span>0 cm</span><span>${f.max} cm</span><span>130 cm</span></div>
      </div>
      <div style="display:flex;gap:12px;padding:10px 0;border-top:2px solid #E9F3EF;font-size:15px;line-height:1.45"><b style="flex:none;width:100px;color:#6E8A8C;font-weight:800">Hoe groot</b><span>${esc(f.feit.groot)}</span></div>
      <div style="display:flex;gap:12px;padding:10px 0;border-top:2px solid #E9F3EF;font-size:15px;line-height:1.45"><b style="flex:none;width:100px;color:#6E8A8C;font-weight:800">Wat eet hij</b><span>${esc(f.feit.eet)}</span></div>
      <div style="display:flex;gap:12px;padding:10px 0;border-top:2px solid #E9F3EF;font-size:15px;line-height:1.45"><b style="flex:none;width:100px;color:#6E8A8C;font-weight:800">Waar zwemt hij</b><span>${esc(f.feit.waar)}</span></div>
      <div style="display:flex;gap:12px;padding:10px 0;border-top:2px solid #E9F3EF;font-size:15px;line-height:1.45"><b style="flex:none;width:100px;color:#6E8A8C;font-weight:800">Wist je dat</b><span>${esc(f.feit.wist)}</span></div>
      <div style="display:flex;gap:12px;padding:10px 0;border-top:2px solid #E9F3EF;font-size:15px;line-height:1.45"><b style="flex:none;width:100px;color:#6E8A8C;font-weight:800">Jij ving er</b><span>${esc(jij)}</span></div>
    </div>
    ${vangstenHtml}
    <button data-click="${plusId}" style="width:100%;background:#F0A81E;border:0;color:#123A3F;border-radius:18px;padding:18px;font-weight:800;font-size:18px;box-shadow:0 4px 0 #C88A12;margin-bottom:10px">Ik heb er één gevangen!</button>
  </div>`;
}

/* ---------- render: vangst-sheet ---------- */
function renderSheet(){
  const s = state.sheet, f = vinden(s.soort);
  const bekend = state.plekken.map(p => ({ id: p.id, naam: p.naam }));
  const plekKnoppen = bekend.map(p => {
    const id = on(() => zetSheet({ plekId: p.id, nieuwOpen: false, nieuwNaam: '' }));
    const actief = s.plekId === p.id;
    return `<button data-click="${id}" style="background:${actief ? '#1E7A8C' : '#fff'};border:2px solid ${actief ? '#1E7A8C' : '#CBDCD9'};color:${actief ? '#fff' : '#17545C'};border-radius:14px;padding:11px 14px;font-size:15px;font-weight:800">${esc(p.naam)}</button>`;
  }).join('') + (() => {
    const id = on(() => zetSheet({ plekId: null, nieuwOpen: true }));
    return `<button data-click="${id}" style="background:${s.nieuwOpen ? '#2F7D4F' : '#fff'};border:2px solid ${s.nieuwOpen ? '#2F7D4F' : '#CBDCD9'};color:${s.nieuwOpen ? '#fff' : '#2F7D4F'};border-radius:14px;padding:11px 14px;font-size:15px;font-weight:800">+ Nieuwe plek</button>`;
  })();

  const gekozen = state.plekken.find(p => p.id === s.plekId);
  const gpsTekst = s.gps === 'zoeken' ? 'Even zoeken waar je bent...'
    : s.gps === 'nee' ? 'Ik kan je plek niet vinden. Kies of typ hem zelf.'
    : gekozen ? ('Je staat bij een plek die je al kent: ' + gekozen.naam)
    : 'Een nieuwe visplek! Geef hem een naam.';

  const minId = on(() => zetSheet({ lengte: Math.max(3, s.lengte - 1), weet: true }));
  const plusId = on(() => zetSheet({ lengte: Math.min(f.max, s.lengte + 1), weet: true }));
  const rangeId = on(e => zetSheet({ lengte: parseInt(e.target.value, 10) || 3, weet: true }));
  const weetId = on(() => zetSheet({ weet: !s.weet }));
  /* Geen her-render bij elke toets: anders kan een re-render de knop
     vervangen net terwijl een tik daarop nog bezig is (focus-wissel-race). */
  const naamId = on(e => { if (state.sheet) state.sheet.nieuwNaam = e.target.value; });
  const fotoId = on(fotoKies);
  const bewaarId = on(bewaarVangst);
  const sluitId = on(() => setUi({ sheet: null }));
  const stopId = on(e => e.stopPropagation());

  return `<div data-click="${sluitId}" style="position:fixed;inset:0;background:rgba(11,50,55,.55);z-index:40;display:flex;align-items:flex-end;justify-content:center">
    <div data-click="${stopId}" style="width:100%;max-width:560px;max-height:92dvh;overflow-y:auto;background:#fff;border-radius:26px 26px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(11,50,55,.3)">
      <div style="width:44px;height:5px;border-radius:3px;background:#CBDCD9;margin:0 auto 12px"></div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <span style="flex:none;width:110px;height:60px;display:grid;place-items:center;overflow:hidden">${svgVoor(f, VISSEN.indexOf(f), 's')}</span>
        <span style="flex:1;min-width:0"><span style="display:block;font-size:13px;font-weight:800;color:#6E8A8C;letter-spacing:.06em;text-transform:uppercase">Gevangen</span><span style="display:block;font-size:26px;font-weight:800;line-height:1.1">${esc(f.n)}</span></span>
      </div>
      <div style="background:#F4F8F7;border-radius:18px;padding:14px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:16px;font-weight:800">Hoe lang was hij?</span>
          <span style="font-size:20px;font-weight:800;color:#1E7A8C">${s.weet ? s.lengte + ' cm' : 'niet gemeten'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <button data-click="${minId}" aria-label="Korter" style="flex:none;width:52px;height:52px;border-radius:16px;background:#fff;border:2px solid #CBDCD9;color:#17545C;font-size:26px;font-weight:800;line-height:1">−</button>
          <input type="range" min="3" max="${f.max}" step="1" value="${s.lengte}" data-change="${rangeId}" style="flex:1;min-width:0;accent-color:#F0A81E;height:44px">
          <button data-click="${plusId}" aria-label="Langer" style="flex:none;width:52px;height:52px;border-radius:16px;background:#fff;border:2px solid #CBDCD9;color:#17545C;font-size:26px;font-weight:800;line-height:1">+</button>
        </div>
        <button data-click="${weetId}" style="margin-top:10px;background:${s.weet ? '#fff' : '#1E7A8C'};border:2px solid ${s.weet ? '#CBDCD9' : '#1E7A8C'};color:${s.weet ? '#6E8A8C' : '#fff'};border-radius:12px;padding:9px 14px;font-size:14px;font-weight:700">Weet ik niet</button>
      </div>
      <div style="background:#F4F8F7;border-radius:18px;padding:14px;margin-bottom:14px">
        <div style="font-size:16px;font-weight:800;margin-bottom:2px">Waar sta je?</div>
        <div style="font-size:13px;color:#6E8A8C;margin-bottom:10px;line-height:1.35">${esc(gpsTekst)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${plekKnoppen}</div>
        ${s.nieuwOpen ? `<div style="margin-top:10px">
          <label style="display:block;font-size:13px;font-weight:800;color:#6E8A8C;margin-bottom:6px">Hoe heet deze plek?</label>
          <input type="text" value="${esc(s.nieuwNaam)}" data-input="${naamId}" placeholder="De brug, opa's sloot..." enterKeyHint="done" style="width:100%;font-size:17px;font-weight:700;color:#123A3F;background:#fff;border:2px solid #CBDCD9;border-radius:14px;padding:13px 12px;min-height:52px">
        </div>` : ''}
      </div>
      <button data-click="${bewaarId}" style="width:100%;background:#F0A81E;border:0;color:#123A3F;border-radius:18px;padding:18px;font-weight:800;font-size:19px;box-shadow:0 4px 0 #C88A12;margin-bottom:10px">Bewaar mijn vangst</button>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="flex:1;position:relative;background:none;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:14px;padding:12px;font-size:14px;font-weight:700;text-align:center">
          ${s.foto ? 'Foto toegevoegd ✓' : 'Foto maken (mag ook niet)'}
          <input type="file" accept="image/*" data-change="${fotoId}" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none">
        </label>
        <button data-click="${sluitId}" style="flex:none;background:none;border:2px solid #CBDCD9;color:#6E8A8C;border-radius:14px;padding:12px 18px;font-size:14px;font-weight:700">Stop</button>
      </div>
    </div>
  </div>`;
}

/* ---------- render: diploma ---------- */
function renderDiploma(){
  const d = state.diploma;
  const deelId = on(() => deelDiploma(d.vangst));
  const sluitId = on(() => setUi({ diploma: null }));
  const badges = d.badges.map(b => `<div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.14);border-radius:16px;padding:10px 14px;margin-bottom:8px;min-width:260px;text-align:left">
    <span style="flex:none;width:40px;height:40px;border-radius:50%;background:${b.kl};display:grid;place-items:center;font-size:16px;font-weight:800">${b.teken}</span>
    <span style="font-size:15px;font-weight:700;line-height:1.25">Nieuwe sticker: ${esc(b.label)}</span>
  </div>`).join('');
  return `<div style="position:fixed;inset:0;z-index:60;background:linear-gradient(170deg,#1E7A8C,#134A52);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center">
    <div style="font-size:14px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.75">${esc(d.kop)}</div>
    <div style="width:100%;max-width:340px;height:150px;display:grid;place-items:center;overflow:hidden;margin:14px 0">${d.svg}</div>
    <h1 style="font-size:34px;font-weight:800;margin:0 0 6px;line-height:1.1">${esc(d.titel)}</h1>
    <p style="font-size:17px;opacity:.9;margin:0 0 18px;max-width:340px;line-height:1.4">${esc(d.sub)}</p>
    ${badges}
    <button data-click="${sluitId}" style="margin-top:16px;background:#F0A81E;border:0;color:#123A3F;border-radius:18px;padding:17px 40px;font-weight:800;font-size:19px;box-shadow:0 4px 0 #C88A12">Hoera!</button>
    <button data-click="${deelId}" style="margin-top:10px;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.35);color:#fff;border-radius:16px;padding:13px 24px;font-weight:800;font-size:15px">Diploma bewaren of sturen</button>
  </div>`;
}

/* ---------- render: sticker nogmaals bekijken ---------- */
function renderBadgeScherm(){
  const b = BADGES.find(x => x.id === state.badgeOpen);
  if (!b) return '';
  const deelId = on(() => deelBadge(b));
  const sluitId = on(() => setUi({ badgeOpen: null }));
  return `<div style="position:fixed;inset:0;z-index:60;background:linear-gradient(170deg,#1E7A8C,#134A52);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center">
    <div style="font-size:14px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.75">Sticker</div>
    <div style="width:140px;height:140px;border-radius:50%;background:${b.kl};display:grid;place-items:center;font-size:56px;font-weight:800;margin:18px 0;box-shadow:0 6px 0 rgba(0,0,0,.15)">${b.teken}</div>
    <h1 style="font-size:26px;font-weight:800;margin:0 0 18px;line-height:1.3;max-width:320px">${esc(b.label)}</h1>
    <button data-click="${sluitId}" style="margin-top:6px;background:#F0A81E;border:0;color:#123A3F;border-radius:18px;padding:17px 40px;font-weight:800;font-size:19px;box-shadow:0 4px 0 #C88A12">Sluiten</button>
    <button data-click="${deelId}" style="margin-top:10px;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.35);color:#fff;border-radius:16px;padding:13px 24px;font-weight:800;font-size:15px">Sticker bewaren of sturen</button>
  </div>`;
}

/* ---------- render: navigatie ---------- */
function renderNav(){
  const vangenActief = state.tab === 'vangen' || state.tab === 'info';
  const verzActief = state.tab === 'verzameling';
  const dagenActief = state.tab === 'dagen' || state.tab === 'dag';
  const plekkenActief = state.tab === 'plekken' || state.tab === 'plek';
  const vangenId = on(() => setUi({ tab: 'vangen' }));
  const verzId = on(() => setUi({ tab: 'verzameling' }));
  const dagenId = on(() => setUi({ tab: 'dagen', dagOpen: null }));
  const plekkenId = on(() => setUi({ tab: 'plekken', plekOpen: null }));
  return `<nav style="position:fixed;left:0;right:0;bottom:0;display:flex;background:#fff;border-top:2px solid #CBDCD9;padding-bottom:env(safe-area-inset-bottom);z-index:20">
    <button data-click="${vangenId}" style="flex:1;background:none;border:0;padding:12px 4px 14px;font-weight:800;font-size:14px;color:${vangenActief ? '#123A3F' : '#6E8A8C'};display:grid;gap:6px;justify-items:center"><span style="width:24px;height:4px;border-radius:3px;background:${vangenActief ? '#F0A81E' : 'transparent'}"></span>Vangen</button>
    <button data-click="${verzId}" style="flex:1;background:none;border:0;padding:12px 4px 14px;font-weight:800;font-size:14px;color:${verzActief ? '#123A3F' : '#6E8A8C'};display:grid;gap:6px;justify-items:center"><span style="width:24px;height:4px;border-radius:3px;background:${verzActief ? '#F0A81E' : 'transparent'}"></span>Verzameling</button>
    <button data-click="${dagenId}" style="flex:1;background:none;border:0;padding:12px 4px 14px;font-weight:800;font-size:14px;color:${dagenActief ? '#123A3F' : '#6E8A8C'};display:grid;gap:6px;justify-items:center"><span style="width:24px;height:4px;border-radius:3px;background:${dagenActief ? '#F0A81E' : 'transparent'}"></span>Dagen</button>
    <button data-click="${plekkenId}" style="flex:1;background:none;border:0;padding:12px 4px 14px;font-weight:800;font-size:14px;color:${plekkenActief ? '#123A3F' : '#6E8A8C'};display:grid;gap:6px;justify-items:center"><span style="width:24px;height:4px;border-radius:3px;background:${plekkenActief ? '#F0A81E' : 'transparent'}"></span>Plekken</button>
  </nav>`;
}

/* ---------- hoofd render ---------- */
let laatstePagina = null;
function render(){
  registry = {}; idc = 0;
  if (!state.geladen) { root.innerHTML = ''; return; }
  let body;
  if (state.tab === 'vangen') body = renderVangen();
  else if (state.tab === 'verzameling') body = renderVerzameling();
  else if (state.tab === 'dagen') body = renderDagen();
  else if (state.tab === 'dag') body = renderDag();
  else if (state.tab === 'plekken') body = renderPlekken();
  else if (state.tab === 'plek') body = renderPlek();
  else if (state.tab === 'info') body = renderInfo();
  else body = renderVangen();

  root.innerHTML = `<div style="min-height:100dvh;background:#E9F3EF;padding-bottom:104px"><div style="max-width:560px;margin:0 auto;padding:0 14px">${body}</div></div>`
    + renderNav()
    + (state.sheet ? renderSheet() : '')
    + (state.diploma ? renderDiploma() : '')
    + (state.badgeOpen ? renderBadgeScherm() : '');

  /* Bij een nieuwe "pagina" bovenaan beginnen — anders opent bv. het infoscherm
     van een vis onderaan het scherm gewoon op de scrollpositie van de vorige
     pagina, alsof het één lange pagina is. */
  const huidigePagina = state.tab + '|' + (state.info || '') + '|' + (state.dagOpen || '') + '|' + (state.plekOpen || '');
  if (huidigePagina !== laatstePagina) {
    laatstePagina = huidigePagina;
    window.scrollTo(0, 0);
  }
}

/* ---------- events (event delegation, gebonden op de root) ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-click]');
  if (el) { const fn = registry[el.getAttribute('data-click')]; if (fn) fn(e); }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-change]');
  if (el) { const fn = registry[el.getAttribute('data-change')]; if (fn) fn(e); }
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-input]');
  if (el) { const fn = registry[el.getAttribute('data-input')]; if (fn) fn(e); }
});

/* ---------- opstarten ---------- */
async function init(){
  vraagBlijvendeOpslag();
  if (window.speechSynthesis) window.speechSynthesis.getVoices();
  const saved = await laadStaat();
  if (saved) {
    state.vangsten = saved.vangsten || [];
    state.plekken = saved.plekken || [];
    if (saved.vissers && saved.vissers.length) state.vissers = saved.vissers;
    if (saved.actief) state.actief = saved.actief;
    if (saved.weergave) state.weergave = saved.weergave;
  }
  state.geladen = true;
  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
      let herladen = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (herladen) return; herladen = true; location.reload(); });
    });
  }
}
init();
