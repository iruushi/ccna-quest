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
    out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
    return out;
  }

  return { mergeState, LWW, daysBetween, weekStart, allModules, nextModule, pace, compile, normCmds, checkCmd, getBlock, checkOutput, checkForm, checkGen, GENS, expand6, compress6,
    ip2n, n2ip, maskN, isIp, dayKey, addDays, streak, bestStreak, isPaused, levelFromXp, xpForLevel, unlocked, buildDaily, progress };
})();

if (typeof module !== 'undefined') module.exports = L;
