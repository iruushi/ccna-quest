/* Logique pure (testable sous Node) : générateurs, vérifications, XP, série. */
const L = (() => {
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Motifs de commandes IOS ---------- */
  function abbr(word, min) {
    const head = esc(word.slice(0, min));
    const tail = word.slice(min).split('').reduceRight((acc, ch) => `(?:${esc(ch)}${acc})?`, '');
    return head + tail;
  }
  const IFACES = { g: 'gigabitethernet', f: 'fastethernet', s: 'serial', l: 'loopback', t: 'tengigabitethernet' };
  function token(t) {
    if (t.startsWith('/') && t.endsWith('/') && t.length > 1) return t.slice(1, -1);
    if (t.startsWith('@')) {
      const m = t.slice(1).match(/^([a-z])(.*)$/i);
      const full = IFACES[m[1].toLowerCase()];
      return abbr(full, 1) + '\\s*' + esc(m[2]);
    }
    const c = t.match(/^([a-z][a-z0-9-]*):(\d+)$/i);
    if (c) return abbr(c[1].toLowerCase(), +c[2]);
    return esc(t);
  }
  function compile(p) {
    // les mots suivis de :n s'appliquent mot par mot ("ip address:3" → ip + address abrégé)
    const parts = p.trim().split(/\s+/).map(token);
    return new RegExp('^\\s*' + parts.join('\\s+') + '\\s*$', 'im');
  }
  function normCmds(txt) {
    return txt.split(/\r?\n/).map(l => l.replace(/^\s*\S+(\(config[^)]*\))?#\s*/, '').replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
  }
  function checkCmd(ch, answer) {
    const txt = normCmds(answer);
    return ch.checks.map(c => ({ l: c.l, ok: compile(c.p).test(txt) }));
  }

  /* ---------- Vérification des sorties "show" ---------- */
  function getBlock(text, header) {
    const lines = text.split(/\r?\n/);
    const h = new RegExp(header.source, header.flags.replace('g', '').replace('m', ''));
    const out = [];
    let inside = false;
    for (const line of lines) {
      if (!inside) { if (h.test(line)) inside = true; continue; }
      if (/^\S/.test(line) || /^!\s*$/.test(line)) break;
      out.push(line);
    }
    return inside ? out.join('\n') : null;
  }
  function checkOutput(step, text) {
    return step.checks.map(c => {
      let ok;
      if (c.re) ok = c.re.test(text);
      else {
        const [hdr, must, mustNot] = c.block;
        const b = getBlock(text, hdr);
        ok = b !== null && (!must || must.test(b)) && (!mustNot || !mustNot.test(b)) && (!c.also || c.also.test(b));
      }
      return { l: c.l, ok };
    });
  }
  const normAns = s => String(s).toLowerCase().replace(/\s+/g, '');
  function checkForm(form, values) {
    return form.map((f, i) => ({ l: f.l, ok: normAns(values[i] || '') === normAns(f.a) }));
  }

  /* ---------- IPv4 ---------- */
  const ip2n = ip => ip.split('.').reduce((a, o) => a * 256 + (+o), 0);
  const n2ip = n => [24, 16, 8, 0].map(s => Math.floor(n / 2 ** s) % 256).join('.');
  const maskN = p => p === 0 ? 0 : (2 ** 32 - 2 ** (32 - p));
  const isIp = s => /^(\d{1,3}\.){3}\d{1,3}$/.test(s.trim()) && s.trim().split('.').every(o => +o <= 255);

  function genSubnet() {
    const base = pick([[10, rnd(0, 255), rnd(0, 255), rnd(1, 254)], [172, rnd(16, 31), rnd(0, 255), rnd(1, 254)], [192, 168, rnd(0, 255), rnd(1, 254)]]);
    const p = rnd(17, 30);
    const ip = base.join('.');
    const n = ip2n(ip), m = maskN(p);
    const net = Math.floor(n / 2 ** (32 - p)) * 2 ** (32 - p);
    const bc = net + 2 ** (32 - p) - 1;
    if (n === net || n === bc) return genSubnet();
    return { type: 'subnet', ip, p, mask: n2ip(m),
      fields: [{ l: 'Adresse réseau', a: n2ip(net) }, { l: 'Broadcast', a: n2ip(bc) }, { l: 'Hôtes utilisables', a: String(2 ** (32 - p) - 2) }] };
  }
  function genBinary() {
    const v = rnd(0, 255), mode = rnd(0, 2);
    const bin = v.toString(2).padStart(8, '0');
    if (mode === 0) return { type: 'binary', q: `Convertis ${v} en binaire (8 bits)`, fields: [{ l: 'Binaire', a: bin }] };
    if (mode === 1) return { type: 'binary', q: `Convertis ${bin} en décimal`, fields: [{ l: 'Décimal', a: String(v) }] };
    return { type: 'binary', q: `Convertis 0x${v.toString(16).toUpperCase().padStart(2, '0')} en décimal`, fields: [{ l: 'Décimal', a: String(v) }] };
  }
  function genWildcard() {
    const p = rnd(8, 30);
    const w = n2ip(2 ** 32 - 1 - maskN(p));
    return { type: 'wildcard', q: `Quel masque générique (wildcard) correspond à /${p} (${n2ip(maskN(p))}) ?`, fields: [{ l: 'Wildcard', a: w }] };
  }

  /* ---------- IPv6 ---------- */
  function expand6(s) {
    s = s.trim().toLowerCase().replace(/\/\d+$/, '');
    if (!/^[0-9a-f:]+$/.test(s) || (s.match(/::/g) || []).length > 1) return null;
    let groups;
    if (s.includes('::')) {
      const [a, b] = s.split('::');
      const ga = a ? a.split(':') : [], gb = b ? b.split(':') : [];
      const miss = 8 - ga.length - gb.length;
      if (miss < 1) return null;
      groups = [...ga, ...Array(miss).fill('0'), ...gb];
    } else groups = s.split(':');
    if (groups.length !== 8 || groups.some(g => g.length < 1 || g.length > 4)) return null;
    return groups.map(g => g.padStart(4, '0')).join(':');
  }
  function compress6(full) {
    const g = full.split(':').map(x => x.replace(/^0+(?=.)/, ''));
    let best = -1, len = 0;
    for (let i = 0; i < 8; i++) {
      if (g[i] !== '0') continue;
      let j = i; while (j < 8 && g[j] === '0') j++;
      if (j - i > len && j - i >= 2) { best = i; len = j - i; }
      i = j;
    }
    if (best < 0) return g.join(':');
    return (g.slice(0, best).join(':') + '::' + g.slice(best + len).join(':'));
  }
  function genIpv6() {
    const g = Array.from({ length: 8 }, () => rnd(0, 0xffff).toString(16));
    g[0] = '2001'; g[1] = 'db8';
    const z = rnd(2, 5), len = rnd(2, 4);
    for (let i = z; i < Math.min(8, z + len); i++) g[i] = '0';
    for (let i = 2; i < 8; i++) if (g[i] !== '0' && Math.random() < 0.35) g[i] = rnd(0, 0xff).toString(16);
    const full = g.map(x => x.padStart(4, '0')).join(':');
    return { type: 'ipv6', q: `Écris la forme la plus courte de ${full}`, full, fields: [{ l: 'Forme compressée', a: compress6(full) }] };
  }
  function checkGen(item, values) {
    if (item.type === 'ipv6') {
      const v = (values[0] || '').trim();
      const ok = expand6(v) === item.full && v.length <= item.fields[0].a.length;
      return [{ l: item.fields[0].l, ok }];
    }
    return item.fields.map((f, i) => ({ l: f.l, ok: normAns(values[i] || '') === normAns(f.a) }));
  }
  const GENS = { subnet: genSubnet, binary: genBinary, ipv6: genIpv6, wildcard: genWildcard };

  /* ---------- Dates, série ---------- */
  const dayKey = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const addDays = (k, n) => { const [y, m, d] = k.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n)); };
  function isPaused(k, pauses) { return pauses.some(p => k >= p.from && (!p.to || k <= p.to)); }
  function streak(done, pauses, today) {
    const set = new Set(done);
    let k = set.has(today) ? today : addDays(today, -1), n = 0, guard = 0;
    while (guard++ < 3660) {
      if (set.has(k)) n++;
      else if (!isPaused(k, pauses)) break;
      k = addDays(k, -1);
    }
    return n;
  }
  function bestStreak(done, pauses) {
    if (!done.length) return 0;
    const s = [...new Set(done)].sort();
    let best = 0;
    for (const d of s) best = Math.max(best, streak(s.filter(x => x <= d), pauses, d));
    return best;
  }

  /* ---------- XP, niveaux ---------- */
  const levelFromXp = xp => { let n = 0; while (50 * (n + 1) * (n + 2) <= xp) n++; return n; };
  const xpForLevel = n => 50 * n * (n + 1);

  /* ---------- Sélection des défis ---------- */
  // Modules débloqués = cochés + le prochain non coché de chaque cours
  function unlocked(courses, doneMods) {
    const set = new Set(doneMods);
    for (const c of courses) {
      const next = c.modules.findIndex((_, i) => !set.has(`${c.id}:${i + 1}`));
      if (next >= 0) set.add(`${c.id}:${next + 1}`);
    }
    return set;
  }
  function buildDaily(data, doneMods, size = 5) {
    const u = unlocked(data.courses, doneMods);
    const pool = [];
    data.mcq.forEach((q, i) => u.has(q.m) && pool.push({ kind: 'mcq', i }));
    data.cmd.forEach((q, i) => u.has(q.m) && pool.push({ kind: 'cmd', i }));
    data.gens.forEach(g => u.has(g.m) && pool.push({ kind: 'gen', type: g.type }, { kind: 'gen', type: g.type }));
    if (pool.length < size) {
      // début de parcours : on complète avec les bases (binaire, sous-réseaux)
      pool.push({ kind: 'gen', type: 'binary' }, { kind: 'gen', type: 'subnet' }, { kind: 'gen', type: 'binary' });
      data.mcq.forEach((q, i) => q.m.startsWith('itn:') && +q.m.split(':')[1] <= 4 && pool.push({ kind: 'mcq', i }));
    }
    const out = [];
    const bag = pool.slice();
    while (out.length < size && bag.length) {
      const j = Math.floor(Math.random() * bag.length);
      const it = bag.splice(j, 1)[0];
      if (it.kind !== 'gen' && out.some(o => o.kind === it.kind && o.i === it.i)) continue;
      out.push(it.kind === 'gen' ? { kind: 'gen', item: GENS[it.type]() } : it);
      if (!bag.length && out.length < size) bag.push(...pool);
    }
    return out;
  }

  function progress(data, st) {
    const total = data.courses.reduce((a, c) => a + c.modules.length, 0);
    const mods = st.modules.length / total;
    const labs = Object.keys(st.labs).filter(k => st.labs[k].done).length / data.labs.length;
    return Math.round((mods * 0.7 + labs * 0.3) * 100);
  }

  /* ---------- Rythme du cours NetAcad ---------- */
  const toDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5);
  const weekStart = k => { const d = toDate(k); const wd = (d.getDay() + 6) % 7; return addDays(k, -wd); };
  const allModules = courses => courses.flatMap(c => c.modules.map((name, i) => ({ id: `${c.id}:${i + 1}`, c, n: i + 1, name })));
  const nextModule = (courses, done) => allModules(courses).find(m => !done.includes(m.id)) || null;
  // log : { 'itn:6': { date, retro } } — retro = coché comme « déjà fait avant », ne compte pas comme avancée
  function pace(courses, done, log, plan, todayK) {
    const total = allModules(courses).length;
    const remaining = total - done.length;
    const live = Object.values(log).filter(x => !x.retro);
    const ws = weekStart(todayK);
    const doneWeek = live.filter(x => x.date >= ws).length;
    const daysLeftWs = Math.max(1, daysBetween(ws, plan.target) + 1);
    const weeksLeftWs = Math.max(1, Math.ceil(daysLeftWs / 7));
    const weekGoal = Math.max(1, Math.ceil((remaining + doneWeek) / weeksLeftWs));
    const totalDays = Math.max(1, daysBetween(plan.start, plan.target));
    const elapsed = Math.min(totalDays, Math.max(0, daysBetween(plan.start, todayK)));
    const expected = Math.floor(plan.startRemaining * elapsed / totalDays);
    const actual = live.filter(x => x.date >= plan.start).length;
    const daysLeft = daysBetween(todayK, plan.target);
    return { total, remaining, doneWeek, weekGoal: remaining === 0 ? 0 : weekGoal, delta: actual - expected, daysLeft,
      weeksLeft: Math.max(0, Math.ceil(daysLeft / 7)) };
  }

  /* ---------- Fusion de deux états (synchro multi-appareils, sans perte) ----------
     - compteurs (XP, jetons dépensés, réponses) : un compteur par appareil, on garde le max de chacun
     - modules : chaque coche/décoche est horodatée, la plus récente gagne
     - jours, journal des modules, labos terminés, récompenses débloquées : union
     - plan, récompenses, pauses, scores d'examen : le champ modifié le plus récemment gagne
     - défi du jour en cours, mode PC/téléphone : restent locaux */
  const LWW = ['plan', 'rewards', 'pauses', 'exams'];
  const COUNTERS = ['xpDev', 'spentDev', 'ansDev', 'corDev'];
  const sum = o => Object.values(o || {}).reduce((a, b) => a + b, 0);
  const clone = x => x === undefined ? undefined : JSON.parse(JSON.stringify(x));
  function mergeState(a, b, order) {
    const out = clone(a);
    const fa = a.fieldAt || {}, fb = b.fieldAt || {};
    out.fieldAt = { ...fa };
    for (const k of LWW) if ((fb[k] || 0) > (fa[k] || 0) && b[k] !== undefined) { out[k] = clone(b[k]); out.fieldAt[k] = fb[k]; }
    for (const k of COUNTERS) {
      const m = { ...(a[k] || {}) };
      for (const [d, v] of Object.entries(b[k] || {})) m[d] = Math.max(m[d] || 0, v);
      out[k] = m;
    }
    out.xp = sum(out.xpDev); out.spent = sum(out.spentDev);
    out.stats = { answered: sum(out.ansDev), correct: sum(out.corDev) };
    const meta = { ...(a.modMeta || {}) };
    for (const [id, v] of Object.entries(b.modMeta || {})) if (!meta[id] || v.t > meta[id].t) meta[id] = v;
    out.modMeta = meta;
    out.modules = Object.keys(meta).filter(id => meta[id].on);
    if (order) out.modules.sort((x, y) => order.indexOf(x) - order.indexOf(y));
    out.days = [...new Set([...(a.days || []), ...(b.days || [])])].sort();
    const log = {};
    for (const id of out.modules) {
      const la = (a.modLog || {})[id], lb = (b.modLog || {})[id];
      log[id] = la && lb ? (la.date <= lb.date ? la : lb) : (la || lb || { date: meta[id].d || '', retro: true });
    }
    out.modLog = log;
    const steps = clone(a.modSteps || {});
    for (const [id, v] of Object.entries(b.modSteps || {})) {
      const s = steps[id] || (steps[id] = {});
      if (v.read && (!s.read || v.read < s.read)) s.read = v.read;
      if (v.quiz != null) s.quiz = Math.max(s.quiz ?? -1, v.quiz);
    }
    out.modSteps = steps;
    const labs = clone(a.labs || {});
    for (const [id, v] of Object.entries(b.labs || {})) {
      if (!labs[id] || (v.done && !labs[id].done)) labs[id] = clone(v);
    }
    out.labs = labs;
    const red = new Map();
    for (const r of [...(a.redeemed || []), ...(b.redeemed || [])]) if (r.id && !red.has(r.id)) red.set(r.id, r);
    out.redeemed = [...red.values()].sort((x, y) => (x.date + x.id).localeCompare(y.date + y.id));
    const games = clone(a.games || {});
    for (const [k, g] of Object.entries(b.games || {})) if (!games[k] || (g.t || 0) > (games[k].t || 0)) games[k] = clone(g);
    out.games = games;
    out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
    return out;
  }

  /* ---------- Ludothèque : import Playnite (CSV, JSON ou liste) ---------- */
  const gameKey = n => String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[™®©]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  function parseCSV(text) {
    const first = text.split(/\r?\n/)[0] || '';
    const cnt = c => (first.match(new RegExp('\\' + c, 'g')) || []).length;
    const sep = ['\t', ';', ','].sort((a, b) => cnt(b) - cnt(a))[0];
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === sep) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(x => x.trim()));
  }
  const listify = v => Array.isArray(v) ? v.map(x => (x && typeof x === 'object') ? (x.Name || x.name || '') : String(x)).filter(Boolean)
    : String(v ?? '').split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  function hours(v) {
    if (v == null || v === '') return null;
    const s = String(v).toLowerCase().replace(',', '.');
    let m = s.match(/(\d+(?:\.\d+)?)\s*h(?:\s*(\d+))?/);
    if (m) return Math.round((+m[1] + (m[2] ? +m[2] / 60 : 0)) * 10) / 10;
    m = s.match(/^(\d+):(\d{2})/); if (m) return Math.round((+m[1] + +m[2] / 60) * 10) / 10;
    const n = parseFloat(s); if (isNaN(n) || n <= 0) return null;
    return n > 300 ? Math.round(n / 60 * 10) / 10 : n;   // > 300 : probablement des minutes
  }
  const COLS = {
    name: /^(name|nom|title|titre|game|jeu)$/i,
    platform: /^(source|sources|sourcename|platform|platforms|plateforme|plateformes|library|bibliotheque|bibliothèque|store)s?$/i,
    steam: /^steam ?app ?id$/i,
    hidden: /^(hidden|masqué|masque)$/i,
    fav: /^(favorite|favourite|favori)$/i,
    genres: /^(genres?|genre)$/i,
    tags: /^(tags?|étiquettes?|etiquettes?)$/i,
    features: /^(features?|fonctionnalités|fonctionnalites|categories|catégories)$/i,
    hltb: /(howlong|hltb|main ?story|durée|duree|histoire principale)/i,
    status: /(completion|statut|status)/i
  };
  function mapRow(o) {
    const pick = re => { for (const k of Object.keys(o)) if (re.test(k.trim())) return o[k]; return undefined; };
    return { name: String(pick(COLS.name) ?? '').trim(), platforms: listify(pick(COLS.platform)),
      genres: [...listify(pick(COLS.genres)), ...listify(pick(COLS.tags))], features: listify(pick(COLS.features)),
      hltb: hours(pick(COLS.hltb)), rawStatus: String(pick(COLS.status) ?? ''),
      steam: (String(pick(COLS.steam) ?? '').match(/^\d+$/) || [null])[0],
      hidden: /^(true|1|oui|yes)$/i.test(String(pick(COLS.hidden) ?? '')),
      fav: /^(true|1|oui|yes)$/i.test(String(pick(COLS.fav) ?? '')) };
  }
  function parseLibrary(text) {
    text = text.replace(/^﻿/, '').trim();
    if (!text) return [];
    let items;
    if (/^[[{]/.test(text)) {
      let j = JSON.parse(text); if (!Array.isArray(j)) j = j.games || j.Games || j.items || Object.values(j);
      items = j.map(mapRow);
    } else {
      const rows = parseCSV(text);
      const head = rows[0].map(x => x.trim());
      if (rows.length > 1 && head.some(h => COLS.name.test(h))) {
        items = rows.slice(1).map(r => mapRow(Object.fromEntries(head.map((h, i) => [h, r[i] ?? '']))));
      } else items = text.split(/\r?\n/).map(l => ({ name: l.replace(/^[-*•\d.)\s]+/, '').trim(), platforms: [], genres: [], features: [], hltb: null, rawStatus: '' }));
    }
    const seen = new Map();
    for (const g of items) {
      if (!g.name) continue;
      const k = gameKey(g.name); if (!k) continue;
      const prev = seen.get(k);
      if (prev) { prev.platforms = [...new Set([...prev.platforms, ...g.platforms])]; prev.genres = [...new Set([...prev.genres, ...g.genres])]; prev.hltb = prev.hltb ?? g.hltb; prev.steam = prev.steam || g.steam; prev.hidden = prev.hidden && g.hidden; prev.fav = prev.fav || g.fav; }
      else seen.set(k, { ...g, key: k });
    }
    return [...seen.values()].map(g => ({ ...g, status: statusFrom(g.rawStatus), story: isStory(g) }));
  }
  function statusFrom(s) {
    s = s.toLowerCase();
    if (/(complet|beaten|termin|fini|100)/.test(s)) return 'done';
    if (/(playing|en cours|on hold|pause)/.test(s)) return 'current';
    if (/(abandon|not interested|pas intéress)/.test(s)) return 'skip';
    return 'todo';
  }
  const NOT_STORY = /\b(league of legends|teamfight tactics|minecraft|satisfactory|counter-strike|valorant|fortnite|rocket league|apex legends|overwatch|dota|hearthstone|fall guys|warzone|pubg|factorio|civilization|age of empires|football manager|fifa|ea sports fc|f1 2\d|euro truck|stardew)\b/i;
  function isStory(g) {
    if (NOT_STORY.test(g.name)) return false;
    const txt = [...g.genres, ...g.features].join(' | ').toLowerCase();
    const multiOnly = /(massively multiplayer|mmo|moba|battle royale|online pvp only)/.test(txt) && !/(single|solo)/.test(txt);
    if (multiOnly) return false;
    const storyish = /(story|narrat|histoire|rpg|role-playing|jeu de rôle|jeu de role|adventure|aventure|action-adventure|visual novel|walking simulator|choices matter|horror|horreur|open world|monde ouvert)/.test(txt);
    const otherish = /(strategy|stratégie|strategie|simulation|sports?|racing|course|puzzle|card|cartes|sandbox|bac à sable|city builder|tower defense|fighting|combat)/.test(txt);
    if (storyish) return true;
    if (otherish) return false;
    return /(single|solo)/.test(txt) ? null : null; // inconnu : à trancher à la main
  }

  // Tags des joueurs Steam (triés par votes) : score « histoire » contre score « autre »
  const STORY_TAGS = { 'story rich': 3, 'narration': 2, 'choices matter': 2, 'multiple endings': 2, 'cinematic': 1.5, 'visual novel': 3,
    'interactive fiction': 2.5, 'rpg': 2, 'action rpg': 2, 'jrpg': 2.5, 'party-based rpg': 2, 'open world': 1.5, 'adventure': 1,
    'action-adventure': 2, 'atmospheric': 1, 'singleplayer': 1, 'horror': 1, 'psychological horror': 1.5, 'detective': 1.5,
    'mystery': 1.5, 'crime': 1, 'third person': 0.5, 'stealth': 1, 'great soundtrack': 0.5, 'emotional': 1.5, 'character customization': 0.5 };
  const OTHER_TAGS = { 'strategy': 2, 'simulation': 2, 'sandbox': 2, 'survival': 1, 'building': 2, 'automation': 3, 'city builder': 3,
    'base building': 2, 'crafting': 1, '4x': 3, 'turn-based strategy': 3, 'grand strategy': 3, 'rts': 3, 'sports': 3, 'racing': 3,
    'roguelike': 2, 'roguelite': 2, 'puzzle': 2, 'card game': 3, 'deckbuilding': 3, 'multiplayer': 1, 'online co-op': 1, 'co-op': 1,
    'pvp': 2, 'competitive': 2, 'moba': 4, 'battle royale': 4, 'mmorpg': 4, 'massively multiplayer': 4, 'party game': 2,
    'fighting': 2, 'tower defense': 3, 'arcade': 1, 'management': 2, 'colony sim': 3, 'farming sim': 3, 'auto battler': 4,
    'free to play': 1, 'esports': 3, 'team-based': 2, 'hero shooter': 3, 'tactical': 1, 'wargame': 3 };
  function tagScores(tags) {
    let s = 0, o = 0;
    tags.slice(0, 20).forEach((t, i) => {
      const w = i < 5 ? 1.5 : i < 10 ? 1 : 0.6, k = t.toLowerCase();
      if (STORY_TAGS[k]) s += STORY_TAGS[k] * w;
      if (OTHER_TAGS[k]) o += OTHER_TAGS[k] * w;
    });
    return { s: Math.round(s * 10) / 10, o: Math.round(o * 10) / 10 };
  }
  // Avec la fiche Steam : tags des joueurs si dispo, sinon genres officiels + catégories (Single-player…)
  function classifySteam(name, meta) {
    if (!meta) return null;
    if (NOT_STORY.test(name)) return false;
    if (meta.type && meta.type !== 'game') return false;
    if (meta.tags && meta.tags.length >= 5) {
      const { s, o } = tagScores(meta.tags);
      const solo = meta.tags.some(t => /^singleplayer$/i.test(t)) || (meta.categories || []).some(c => /single-player/i.test(c));
      if (!solo && o >= 3) return false;
      if (s >= 5 && s >= o * 1.2) return true;
      if (o >= 4 && o > s) return false;
      if (s >= 3.5 && o < 2) return true;
      // indécis avec les tags : on retombe sur les genres
    }
    const g = meta.genres.join('|').toLowerCase(), c = meta.categories.join('|').toLowerCase();
    if (!/single-player/.test(c)) return false;
    if (/massively multiplayer/.test(g)) return false;
    if (/(adventure|rpg)/.test(g)) return true;
    if (/(strategy|simulation|sports|racing|casual)/.test(g)) return false;
    return null;
  }

  return { tagScores, classifySteam, gameKey, parseCSV, parseLibrary, isStory, hours, mergeState, LWW, daysBetween, weekStart, allModules, nextModule, pace, compile, normCmds, checkCmd, getBlock, checkOutput, checkForm, checkGen, GENS, expand6, compress6,
    ip2n, n2ip, maskN, isIp, dayKey, addDays, streak, bestStreak, isPaused, levelFromXp, xpForLevel, unlocked, buildDaily, progress };
})();

if (typeof module !== 'undefined') module.exports = L;
