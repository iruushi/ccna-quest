{
const D = DATA;
const KEY = 'ccna-quest-v1';
const $ = s => document.querySelector(s);
const h = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => L.dayKey(new Date());
const XP = { mcq: 10, cmd: 15, gen: 10, daily: 30, read: 40, quiz: 30, quizHigh: 10, module: 20 };
const NETACAD = 'https://www.netacad.com/fr/dashboard';
const DEFAULT_TARGET = '2027-06-30';

/* ---------- État ---------- */
const fresh = () => ({ v: 1, xp: 0, spent: 0, modules: [], exams: {}, labs: {}, days: [], pauses: [],
  rewards: D.defaultRewards.map(r => ({ ...r })), redeemed: [], mode: null, daily: null, bonus: null,
  stats: { answered: 0, correct: 0 }, created: today(), modLog: {}, modSteps: {}, plan: null, games: {} });
let st = fresh(), memOnly = false;
try { const raw = localStorage.getItem(KEY); if (raw) st = Object.assign(fresh(), JSON.parse(raw)); }
catch (e) { memOnly = true; }
const TOTAL_MODS = D.courses.reduce((a, c) => a + c.modules.length, 0);
function ensurePlan() {
  if (!st.plan) st.plan = { target: DEFAULT_TARGET, exam: null, start: today(), startRemaining: TOTAL_MODS - st.modules.length };
  return st.plan;
}
ensurePlan();
const pc = () => L.pace(D.courses, st.modules, st.modLog, ensurePlan(), today());
function markDay() { if (!st.days.includes(today())) st.days.push(today()); }
/* Identifiant de cet appareil (pour fusionner les compteurs d'XP sans perte) */
let DEV;
try { DEV = localStorage.getItem(KEY + '-dev'); if (!DEV) { DEV = 'd' + Math.random().toString(36).slice(2, 10); localStorage.setItem(KEY + '-dev', DEV); } }
catch (e) { DEV = 'dmem'; }
const others = k => Object.entries(st[k] || {}).filter(([d]) => d !== DEV).reduce((a, [, v]) => a + v, 0);
let lastField = {};
const snapFields = () => { lastField = {}; for (const k of L.LWW) lastField[k] = JSON.stringify(st[k] ?? null); };
// Avant chaque sauvegarde : part de cet appareil dans les compteurs, horodatage des changements
function stamp() {
  const now = Date.now();
  for (const [k, total] of [['xpDev', st.xp], ['spentDev', st.spent], ['ansDev', st.stats.answered], ['corDev', st.stats.correct]]) {
    st[k] = st[k] || {}; st[k][DEV] = Math.max(0, total - others(k));
  }
  st.modMeta = st.modMeta || {};
  for (const id of st.modules) if (!st.modMeta[id] || !st.modMeta[id].on) st.modMeta[id] = { on: true, t: now, d: today() };
  for (const [id, m] of Object.entries(st.modMeta)) if (m.on && !st.modules.includes(id)) st.modMeta[id] = { on: false, t: now };
  st.redeemed.forEach(r => { if (!r.id) r.id = 'x' + now.toString(36) + Math.random().toString(36).slice(2, 6); });
  st.fieldAt = st.fieldAt || {};
  for (const k of L.LWW) { const j = JSON.stringify(st[k] ?? null); if (j !== lastField[k]) { st.fieldAt[k] = now; lastField[k] = j; } }
  st.updatedAt = now;
}
function save(opts) {
  stamp();
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { memOnly = true; }
  if (!(opts && opts.noSync)) Sync.soon();
}

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2600);
}
function gain(n, why) { st.xp += n; save(); renderHero(); toast(`+${n} XP · ${why}`); }

const tokens = () => st.xp - st.spent;
const pausedNow = () => L.isPaused(today(), st.pauses);
function mode() {
  if (st.mode && st.mode.date === today()) return st.mode.v;
  const d = new Date().getDay();
  return (d === 0 || d === 6) ? 'pc' : 'mobile';
}

/* ---------- Bandeau ---------- */
function renderHero() {
  const lv = L.levelFromXp(st.xp), a = L.xpForLevel(lv), b = L.xpForLevel(lv + 1);
  $('#rank').textContent = `Niv. ${lv + 1} · ${D.ranks[Math.min(lv, D.ranks.length - 1)]}`;
  $('#xpbar').style.width = Math.round((st.xp - a) / (b - a) * 100) + '%';
  $('#xptxt').textContent = `${st.xp} XP · encore ${b - st.xp} XP pour le niveau suivant`;
  $('#st-streak').textContent = L.streak(st.days, st.pauses, today());
  $('#st-tokens').textContent = tokens();
  $('#st-prog').textContent = L.progress(D, st) + ' %';
  $('#light').classList.toggle('lit', st.days.includes(today()));
}

/* ---------- Rendu d'un défi ---------- */
function itemView(it, res) {
  if (it.kind === 'mcq') {
    const q = D.mcq[it.i];
    const opts = q.o.map((o, k) => {
      let cls = '';
      if (res) { if (k === q.a) cls = 'good'; else if (k === res.pick) cls = 'bad'; }
      return `<button class="opt ${cls}" data-act="mcq" data-k="${k}" ${res ? 'disabled' : ''}>${h(o)}</button>`;
    }).join('');
    return `<span class="tag">${h(modName(q.m))}</span>
      <p class="ticket" style="margin-top:10px">${ticketHtml(q.ticket)}</p><p class="q">${h(q.q)}</p><div class="opts">${opts}</div>
      ${res ? `<p class="fb ${res.ok ? '' : 'ko'}">${res.ok ? 'Bien vu.' : 'Raté.'} ${h(q.e)}</p>` : ''}`;
  }
  if (it.kind === 'cmd') {
    const q = D.cmd[it.i];
    return `<span class="tag">${h(modName(q.m))}</span> <span class="tag">Commandes IOS</span>
      <p class="ticket" style="margin-top:10px">${ticketHtml(q.ticket)}</p><p class="q">${h(q.q)}</p>
      <textarea id="ans" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="Une commande par ligne (les abréviations IOS sont acceptées)" ${res ? 'readonly' : ''}>${h(res ? res.text : '')}</textarea>
      ${res ? checksHtml(res.checks) + (res.ok ? '<p class="fb">Config validée.</p>' : `<p class="fb ko">Solution possible :</p><pre>${h(q.sol)}</pre>`) : ''}
      ${res ? '' : '<div class="row" style="margin-top:10px"><button class="btn p" data-act="cmd">Vérifier</button><button class="btn" data-act="giveup">Voir la solution</button></div>'}`;
  }
  const g = it.item;
  const title = g.type === 'subnet' ? `Hôte ${g.ip}/${g.p} (masque ${g.mask})` : g.q;
  const fields = g.fields.map((f, k) => `<label class="f" for="gf${k}">${h(f.l)}</label>
    <input type="text" id="gf${k}" inputmode="${g.type === 'ipv6' ? 'text' : 'decimal'}" autocomplete="off" autocapitalize="off" spellcheck="false" value="${h(res ? res.vals[k] : '')}" ${res ? 'readonly' : ''}>`).join('');
  const name = D.gens.find(x => x.type === g.type).name;
  return `<span class="tag">${h(name)}</span><p class="q" style="margin-top:10px">${h(title)}</p>${fields}
    ${res ? checksHtml(res.checks) + (res.ok ? '<p class="fb">Exact.</p>' : `<p class="fb ko">Réponses : ${g.fields.map(f => `${h(f.l)} = <code>${h(f.a)}</code>`).join(' · ')}</p>`)
      : '<div class="row" style="margin-top:12px"><button class="btn p" data-act="gen">Vérifier</button></div>'}`;
}
const ticketHtml = t => h(t).replace(/\n(.+)/g, '\n<code>$1</code>');
const checksHtml = cs => `<ul class="checks">${cs.map(c => `<li class="${c.ok ? 'ok' : ''}">${h(c.l)}</li>`).join('')}</ul>`;
function modName(m) {
  const [c, n] = m.split(':'); const co = D.courses.find(x => x.id === c);
  return `${co.short} ${n} · ${co.modules[n - 1]}`;
}

/* ---------- Aujourd'hui ---------- */
function ensureDaily() {
  if (!st.daily || st.daily.date !== today()) {
    st.daily = { date: today(), items: L.buildDaily(D, st.modules), res: [], done: false };
    save();
  }
}
function runView(run, isBonus) {
  const dots = run.items.map((_, k) => `<i class="${run.res[k] ? (run.res[k].ok ? 'ok' : 'ko') : (k === run.res.length ? 'cur' : '')}"></i>`).join('');
  const k = run.res.length;
  if (k >= run.items.length) {
    const good = run.res.filter(r => r.ok).length;
    return `<div class="dots">${dots}</div><h2>${isBonus ? 'Série bonus terminée' : 'Défi du jour validé'}</h2>
      <p>${good}/${run.items.length} bonnes réponses.${isBonus ? '' : ' La lanterne du phare est allumée pour aujourd\'hui.'}</p>
      <div class="row"><button class="btn a" data-act="bonus">${isBonus ? 'Encore une série' : 'Série bonus (XP en plus)'}</button></div>`;
  }
  return `<div class="dots">${dots}</div>${itemView(run.items[k], null)}`;
}
function viewToday() {
  ensureDaily();
  const m = mode();
  const run = st.bonus && st.bonus.date === today() && !st.bonus.finished ? st.bonus : null;
  const active = run || st.daily;
  const pending = active.pendingRes;
  const nextLab = D.labs.find(l => !(st.labs[l.id] && st.labs[l.id].done));
  let body;
  if (pending) {
    const dots = active.items.map((_, k) => `<i class="${k < active.res.length ? (active.res[k].ok ? 'ok' : 'ko') : (k === active.res.length ? 'cur' : '')}"></i>`).join('');
    body = `<div class="dots">${dots}</div>${itemView(active.items[active.res.length], pending)}
      <div class="row" style="margin-top:12px"><button class="btn a" data-act="next">${active.res.length + 1 < active.items.length ? 'Suivant' : 'Terminer'}</button></div>`;
  } else body = runView(active, !!run);
  return `
    ${pausedNow() ? '<p class="banner">Mode pause actif : ta série est protégée. Tu peux quand même faire des défis.</p>' : ''}
    <div class="seg" role="group" aria-label="Où es-tu ?">
      <button data-act="mode" data-v="mobile" aria-pressed="${m === 'mobile'}">Téléphone seul</button>
      <button data-act="mode" data-v="pc" aria-pressed="${m === 'pc'}">J'ai mon PC</button>
    </div>
    ${courseCard(m)}
    <section class="card" aria-live="polite">
      <div class="row sp" style="margin-bottom:8px"><h2 style="margin:0">${run ? 'Série bonus' : 'Défi du jour'}</h2><span class="mute">5 questions · 10 à 15 min</span></div>
      ${body}
    </section>
    ${m === 'pc' && nextLab ? `<section class="card"><div class="row sp"><h2 style="margin:0">Labo du moment</h2><span class="tag b">+${nextLab.xp} XP</span></div>
      <p style="margin:.4em 0"><b>${h(nextLab.title)}</b></p><p class="mute">${h(nextLab.story)}</p>
      <a class="btn p" style="display:inline-flex;align-items:center;text-decoration:none" href="#lab-${nextLab.id}">Ouvrir le labo</a></section>` : ''}
    ${m === 'mobile' && nextLab && nextLab.mobile ? `<section class="card"><h3>Faisable dans le train</h3><p class="mute">${h(nextLab.title)} se fait sans Packet Tracer.</p><a class="btn" style="display:inline-flex;align-items:center;text-decoration:none" href="#lab-${nextLab.id}">Ouvrir</a></section>` : ''}
    ${!st.modules.length ? '<section class="card"><h3>Première fois ?</h3><p class="mute">Coche dans « Parcours » les modules NetAcad que tu as déjà faits, et règle ta date d\'objectif : le rythme et les défis suivront ton avancement.</p><a class="btn" style="display:inline-flex;align-items:center;text-decoration:none" href="#parcours">Ouvrir le parcours</a></section>' : ''}`;
}
function answer(run, ok, extra) {
  run.pendingRes = { ok, ...extra };
  st.stats.answered++; if (ok) st.stats.correct++;
  const it = run.items[run.res.length];
  if (ok) gain(XP[it.kind], 'bonne réponse'); else save();
  render();
}
function next(run, isBonus) {
  run.res.push(run.pendingRes); delete run.pendingRes;
  if (run.res.length >= run.items.length) {
    if (isBonus) run.finished = true;
    else if (!run.done) {
      run.done = true;
      markDay();
      gain(XP.daily, 'défi du jour validé');
    }
  }
  save(); render();
}


/* ---------- Cours NetAcad ---------- */
function paceTag(p) {
  if (p.remaining === 0) return '<span class="tag">Cours terminés</span>';
  if (p.delta > 0) return `<span class="tag" style="background:var(--ok);color:#fff">En avance de ${p.delta} module${p.delta > 1 ? 's' : ''}</span>`;
  if (p.delta < 0) return `<span class="tag b">En retard de ${-p.delta} module${p.delta < -1 ? 's' : ''}</span>`;
  return '<span class="tag">Dans le rythme</span>';
}
function courseCard(m) {
  const p = pc();
  const nm = L.nextModule(D.courses, st.modules);
  if (!nm) return `<section class="card"><h2>Cours NetAcad</h2><p>Les 3 cours sont terminés. Place à la préparation de l'examen : défis bonus et labos.</p></section>`;
  const s = st.modSteps[nm.id] || {};
  const weekDots = Array.from({ length: p.weekGoal }, (_, k) => `<i class="${k < p.doneWeek ? 'ok' : (k === p.doneWeek ? 'cur' : '')}"></i>`).join('');
  const tip = m === 'mobile'
    ? 'En semaine : une section du module dans le train ou en pause, le quiz quand tu as 20 min devant toi.'
    : 'Avec ton PC : profites-en pour faire les activités Packet Tracer du module.';
  return `<section class="card">
    <div class="row sp" style="margin-bottom:6px"><h2 style="margin:0">Cours NetAcad</h2>${paceTag(p)}</div>
    <p class="mute" style="margin:0 0 6px">Cette semaine : ${Math.min(p.doneWeek, p.weekGoal)}/${p.weekGoal} module${p.weekGoal > 1 ? 's' : ''}${p.doneWeek > p.weekGoal ? ` (+${p.doneWeek - p.weekGoal} en bonus)` : ''}</p>
    <div class="dots">${weekDots}</div>
    <p class="q" style="margin:0 0 2px">${h(nm.c.short)} ${nm.n} · ${h(nm.name)}</p>
    <p class="mute" style="margin:0 0 10px">${h(tip)}</p>
    <div class="opts">
      <button class="opt ${s.read ? 'good' : ''}" data-act="mread" data-id="${nm.id}" ${s.read ? 'disabled' : ''}>${s.read ? 'Contenu lu' : `J'ai lu tout le contenu du module (+${XP.read} XP)`}</button>
    </div>
    ${s.quiz != null ? `<p class="fb">Quiz du module réussi : ${s.quiz} %</p>` : `
    <label class="f" for="mq">Score au quiz du module (%)</label>
    <div class="row"><input type="number" id="mq" min="0" max="100" inputmode="numeric" style="max-width:120px" placeholder="ex. 85">
      <button class="btn p" data-act="mquiz" data-id="${nm.id}">Valider (+${XP.quiz} XP)</button></div>`}
    <div class="row" style="margin-top:12px"><a class="btn" style="display:inline-flex;align-items:center;text-decoration:none" href="${NETACAD}" target="_blank" rel="noopener">Ouvrir NetAcad</a></div>
  </section>`;
}
function completeModule(id) {
  if (st.modules.includes(id)) return;
  st.modules.push(id);
  st.modLog[id] = { date: today(), retro: false };
  markDay();
  st.xp += XP.module; save();
  const lab = D.labs.find(l => l.m === id);
  const nDef = D.mcq.filter(q => q.m === id).length + D.cmd.filter(q => q.m === id).length + D.gens.filter(g => g.m === id).length;
  toast(`Module terminé (+${XP.module} XP)${nDef ? ` · ${nDef} défi${nDef > 1 ? 's' : ''} débloqué${nDef > 1 ? 's' : ''}` : ''}${lab ? ' · labo dispo' : ''}`);
  if (lab) setTimeout(() => { if (route() === 'today') toast(`Labo « ${lab.title} » prêt : à faire quand tu as ton PC`); }, 2800);
}

/* ---------- Labos ---------- */
function viewLabs() {
  const done = D.labs.filter(l => st.labs[l.id] && st.labs[l.id].done).length;
  return `<h2>Campagne Ar Mor Logistique</h2>
    <p class="mute">Labos Packet Tracer scénarisés. Tu fais la config dans Packet Tracer (ou sur ton homelab), puis tu colles la sortie des commandes demandées : l'appli vérifie les objectifs. ${done}/${D.labs.length} terminés. Les labos SRWE et ENSA arriveront dans une prochaine version.</p>
    ${D.labs.map((l, i) => {
      const s = st.labs[l.id] || {};
      return `<a class="lab ${s.done ? 'done' : ''}" href="#lab-${l.id}" style="color:inherit;text-decoration:none">
        <span class="n">${s.done ? '✓' : i + 1}</span>
        <span><b>${h(l.title)}</b><br><span class="mute">${h(modName(l.m))}</span></span>
        <span class="row" style="flex-direction:column;align-items:flex-end;gap:4px"><span class="tag b">+${l.xp} XP</span>${l.mobile ? '<span class="tag">Sur téléphone</span>' : ''}</span></a>`;
    }).join('')}`;
}
function viewLab(id) {
  const l = D.labs.find(x => x.id === id);
  if (!l) return viewLabs();
  const s = st.labs[l.id] || { steps: {} };
  const stepRes = s.res || {};
  let work;
  if (l.form) {
    const r = stepRes.form;
    work = `<section class="card"><h3>Ton plan d'adressage</h3>
      ${l.form.map((f, k) => `<label class="f" for="lf${k}">${h(f.l)}</label><input type="text" id="lf${k}" inputmode="decimal" autocomplete="off" spellcheck="false" value="${h(s.vals ? s.vals[k] : '')}">`).join('')}
      ${r ? checksHtml(r) : ''}
      <div class="row" style="margin-top:12px"><button class="btn p" data-act="labform" data-id="${l.id}">Vérifier</button></div></section>`;
  } else {
    work = l.steps.map((step, k) => {
      const r = stepRes[k];
      return `<section class="card"><h3>Vérification ${k + 1}</h3>
        <p>Sur <b>${h(step.on)}</b>, lance <code class="out">${h(step.cmd)}</code> et colle toute la sortie ci-dessous.</p>
        <textarea id="ls${k}" spellcheck="false" autocapitalize="off" placeholder="Colle la sortie ici">${h(s.texts ? s.texts[k] || '' : '')}</textarea>
        ${r ? checksHtml(r) : ''}
        <div class="row" style="margin-top:10px"><button class="btn p" data-act="labstep" data-id="${l.id}" data-k="${k}">Vérifier</button></div></section>`;
    }).join('');
  }
  return `<p><a href="#labs" class="mute">‹ Tous les labos</a></p>
    <div class="row sp"><h2 style="margin:0">${h(l.title)}</h2><span class="tag b">${s.done ? 'Terminé' : '+' + l.xp + ' XP'}</span></div>
    <p class="mute" style="margin:.3em 0 1em">${h(modName(l.m))}</p>
    <div class="grid2">
      <section class="card"><h3>Le contexte</h3><p style="margin:0">${h(l.story)}</p></section>
      <section class="card"><h3>Topologie</h3><pre style="margin:0">${h(l.topo)}</pre></section>
    </div>
    <section class="card"><h3>Objectifs</h3><ul style="margin:0;padding-left:20px">${l.goals.map(g => `<li>${h(g)}</li>`).join('')}</ul>
      <details style="margin-top:8px"><summary>Indices (${l.hints.length})</summary><ul style="padding-left:20px">${l.hints.map(x => `<li>${h(x)}</li>`).join('')}</ul></details></section>
    ${work}`;
}
function labState(id) { return st.labs[id] || (st.labs[id] = { done: false, res: {}, texts: {} }); }
function finishLabIfComplete(l) {
  const s = labState(l.id);
  const all = l.form ? (s.res.form || []).every(c => c.ok) && s.res.form :
    l.steps.every((_, k) => s.res[k] && s.res[k].every(c => c.ok));
  if (all && !s.done) { s.done = true; s.date = today(); gain(l.xp, `labo « ${l.title} » terminé`); }
}

/* ---------- Parcours ---------- */
function viewParcours() {
  const p = L.progress(D, st);
  const total = D.courses.reduce((a, c) => a + c.modules.length, 0);
  const firstOpen = D.courses.findIndex(c => c.modules.some((_, i) => !st.modules.includes(`${c.id}:${i + 1}`)));
  const acc = st.stats.answered ? Math.round(st.stats.correct / st.stats.answered * 100) : null;
  return `<section class="card"><div class="row sp"><div><p class="mute" style="margin:0">Préparation CCNA 200-301</p><p class="big">${p} %</p></div>
      <div class="mute" style="text-align:right">${st.modules.length}/${total} modules NetAcad<br>${Object.values(st.labs).filter(x => x.done).length}/${D.labs.length} labos${acc !== null ? `<br>${acc} % de bonnes réponses` : ''}</div></div>
      <div class="bar" style="background:var(--line);margin-top:10px"><i style="width:${p}%"></i></div>
      <p class="mute" style="margin:8px 0 0">Calcul : 70 % modules NetAcad cochés, 30 % labos terminés.</p></section>
    ${planCard()}
    <p class="mute">Coche ci-dessous les modules que tu avais déjà faits avant (sans XP). Pour les nouveaux modules, valide-les depuis « Aujourd'hui » : lecture + quiz, avec XP.</p>
    ${D.courses.map((c, ci) => {
      const n = c.modules.filter((_, i) => st.modules.includes(`${c.id}:${i + 1}`)).length;
      return `<section class="card"><div class="row sp"><h3 style="margin:0">${h(c.name)}</h3><span class="tag">${n}/${c.modules.length}</span></div>
        <div class="bar" style="background:var(--line);margin:10px 0"><i style="width:${Math.round(n / c.modules.length * 100)}%"></i></div>
        <label class="f" for="ex-${c.id}">Score à l'examen final du cours (%)</label>
        <input type="number" min="0" max="100" id="ex-${c.id}" data-act="exam" data-c="${c.id}" value="${h(st.exams[c.id] ?? '')}" style="max-width:140px">
        <details ${ci === firstOpen ? 'open' : ''}><summary>Modules</summary><ul class="mods">
        ${c.modules.map((m, i) => { const id = `${c.id}:${i + 1}`; return `<li><label><input type="checkbox" data-act="mod" data-id="${id}" ${st.modules.includes(id) ? 'checked' : ''}>${i + 1}. ${h(m)}</label></li>`; }).join('')}
        </ul></details></section>`;
    }).join('')}`;
}


function fmtDate(k) { return k ? L.addDays(k, 0).split('-').reverse().join('/') : ''; }
function planCard() {
  const p = pc(), plan = ensurePlan();
  const examIn = plan.exam ? L.daysBetween(today(), plan.exam) : null;
  return `<section class="card"><h3>Ton rythme</h3>
    <div class="grid2" style="gap:10px;margin:0 0 6px">
      <div><label class="f" for="pt">Finir les 3 cours avant le</label><input type="date" id="pt" data-act="target" value="${h(plan.target)}" min="${L.addDays(today(), 1)}"></div>
      <div><label class="f" for="pe">Date de l'examen CCNA (si tu la connais)</label><input type="date" id="pe" data-act="examdate" value="${h(plan.exam || '')}"></div>
    </div>
    ${p.remaining ? `<p style="margin:10px 0 4px"><b>${p.remaining} modules restants</b> en ${p.weeksLeft} semaines : objectif <b>${p.weekGoal} module${p.weekGoal > 1 ? 's' : ''} cette semaine</b>.</p>
    <div class="row">${paceTag(p)}</div>` : '<p>Tous les modules sont faits.</p>'}
    ${examIn !== null ? `<p class="mute" style="margin:10px 0 0">${examIn >= 0 ? `Examen dans ${examIn} jours (${fmtDate(plan.exam)}).` : `Examen passé le ${fmtDate(plan.exam)}.`}${plan.exam < plan.target ? ' Attention : l\'examen tombe avant la fin prévue des cours.' : ''}</p>` : '<p class="mute" style="margin:10px 0 0">Pas encore de date d\'examen : le rythme vise la fin des cours.</p>'}
    <p class="mute" style="margin:6px 0 0">Changer la date de fin recalcule le rythme à partir d'aujourd'hui.</p>
  </section>`;
}


/* ---------- Ludothèque ---------- */
const GSTAT = { todo: 'À faire', current: 'En cours', done: 'Terminé', skip: 'Pas intéressé' };
let gFilter = 'story', gSearch = '', gLimit = 60, pickMode = false, enrich = { running: false, msg: '' };
const gList = () => Object.entries(st.games || {}).map(([k, g]) => ({ k, ...g }));
function nextSuggestions(n = 3) {
  return gList().filter(g => g.story === true && g.status === 'todo' && !g.hidden)
    .sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || (a.hltb ?? 999) - (b.hltb ?? 999) || a.name.localeCompare(b.name, 'fr'))
    .slice(0, n);
}
function setGame(k, patch, manualKeys) {
  const g = st.games[k]; if (!g) return;
  Object.assign(g, patch); g.manual = { ...(g.manual || {}) };
  for (const m of manualKeys || []) g.manual[m] = true;
  g.t = Date.now(); save();
}
function gamesFiltered() {
  const q = L.gameKey(gSearch);
  return gList().filter(g => {
    if (q && !L.gameKey(g.name).includes(q)) return false;
    if (gFilter === 'all') return true;
    if (g.hidden && gFilter !== 'hidden') return false;
    if (gFilter === 'story') return g.story === true && g.status === 'todo';
    if (gFilter === 'current') return g.status === 'current';
    if (gFilter === 'done') return g.status === 'done';
    if (gFilter === 'sort') return g.story == null && g.status !== 'skip';
    if (gFilter === 'other') return g.story === false;
    if (gFilter === 'hidden') return g.hidden;
    return true;
  }).sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || a.name.localeCompare(b.name, 'fr'));
}
function gameRow(g) {
  const story = g.story === true ? 'Histoire' : g.story === false ? 'Autre' : 'À trier';
  return `<div class="game"><div><b>${h(g.name)}</b>${g.fav ? ' <span class="tag b">Favori</span>' : ''}<br>
      <span class="mute">${h((g.platforms || []).join(' · ') || 'Plateforme inconnue')}${g.hltb ? ` · ~${g.hltb} h` : ''}${g.meta && g.meta.genres.length ? ` · ${h(g.meta.genres.slice(0, 3).join(', '))}` : ''}</span></div>
    <div class="acts">
      <button class="btn sm" data-act="gstory" data-k="${h(g.k)}" aria-label="Changer le type de ${h(g.name)}">${story}</button>
      <select data-act="gstatus" data-k="${h(g.k)}" aria-label="Statut de ${h(g.name)}">${Object.entries(GSTAT).map(([v, l]) => `<option value="${v}" ${g.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    </div></div>`;
}
function listHtml() {
  const list = gamesFiltered();
  return list.length ? list.slice(0, gLimit).map(gameRow).join('') + (list.length > gLimit ? `<div class="row" style="margin-top:10px"><button class="btn" data-act="gmore">Afficher plus (${list.length - gLimit})</button></div>` : '')
    : '<p class="mute">Aucun jeu dans cette catégorie.</p>';
}
function viewGames() {
  const all = gList();
  const c = k => all.filter(g => !g.hidden && (k === 'story' ? g.story === true && g.status === 'todo' : k === 'current' ? g.status === 'current' : k === 'done' ? g.status === 'done' && g.story === true : k === 'sort' ? g.story == null && g.status !== 'skip' : g.story === false)).length;
  const cur = all.filter(g => g.status === 'current' && g.story !== false);
  const sugg = nextSuggestions();
  const withSteam = all.filter(g => g.steam && !g.meta && !g.metaMiss && !(g.manual && g.manual.story)).length;
  const chips = [['story', `Histoire à faire (${c('story')})`], ['current', `En cours (${all.filter(g => g.status === 'current').length})`], ['done', `Terminés (${c('done')})`], ['sort', `À trier (${c('sort')})`], ['other', `Autres jeux (${c('other')})`], ['all', `Tous (${all.length})`]];
  if (!all.length) return `<h2>Ludothèque</h2>
    <section class="card"><h3>Importe ta bibliothèque Playnite</h3>
    <p class="mute">Dans Playnite, exporte ta bibliothèque en CSV, puis choisis le fichier ici. Tu peux aussi coller une simple liste de jeux, un par ligne.</p>${importForm()}</section>`;
  return `<h2>Ludothèque</h2>
    ${pickMode ? `<section class="card" style="border-color:var(--buoy)"><h3>Récompense débloquée : choisis ton prochain jeu solo</h3>${sugg.length ? sugg.map(g => `<div class="row sp" style="padding:6px 0"><span><b>${h(g.name)}</b> <span class="mute">${h((g.platforms || []).join(' · '))}${g.hltb ? ` · ~${g.hltb} h` : ''}</span></span><button class="btn a sm" data-act="gstart" data-k="${h(g.k)}">Commencer</button></div>`).join('') : '<p class="mute">Aucun jeu à histoire « à faire » : trie quelques jeux d\'abord.</p>'}<button class="btn sm" data-act="gpickno" style="margin-top:8px">Plus tard</button></section>` : ''}
    ${cur.length ? cur.map(g => `<section class="card"><p class="mute" style="margin:0">En cours</p><div class="row sp"><h3 style="margin:0">${h(g.name)}</h3><button class="btn a" data-act="gdone" data-k="${h(g.k)}">Terminé !</button></div><p class="mute" style="margin:4px 0 0">${h((g.platforms || []).join(' · '))}${g.hltb ? ` · ~${g.hltb} h` : ''}</p></section>`).join('')
      : sugg.length ? `<section class="card"><h3>Prochain jeu conseillé</h3><div class="row sp"><span><b>${h(sugg[0].name)}</b> <span class="mute">${h((sugg[0].platforms || []).join(' · '))}</span></span><button class="btn p sm" data-act="gstart" data-k="${h(sugg[0].k)}">Commencer</button></div><p class="mute" style="margin:6px 0 0">Ou débloque la récompense « nouveau jeu solo » dans Bonus pour te l'offrir en récompense.</p></section>` : ''}
    ${withSteam || enrich.running || enrich.msg ? `<section class="card"><h3>Tri automatique avec Steam</h3>
      <p class="mute" style="margin:0 0 8px">${Sync.on() ? (withSteam === 0 ? '' : `${withSteam} jeu${withSteam > 1 ? 'x' : ''} peu${withSteam > 1 ? 'vent' : 't'} être trié${withSteam > 1 ? 's' : ''} grâce à leur fiche Steam (genres, solo ou non). Ça prend quelques minutes pour une grosse bibliothèque.`) : 'Connecte la synchro (Réglages) : c\'est ton serveur qui interroge la boutique Steam.'}</p>
      <p id="enrichst" class="mute" style="margin:0 0 8px">${h(enrich.msg)}</p>
      ${Sync.on() && withSteam ? `<button class="btn p" data-act="genrich" ${enrich.running ? 'disabled' : ''}>${enrich.running ? 'Tri en cours…' : 'Trier mes jeux'}</button>` : ''}</section>` : ''}
    <div class="chips" role="group" aria-label="Filtre">${chips.map(([v, l]) => `<button data-act="gfilter" data-v="${v}" aria-pressed="${gFilter === v}">${l}</button>`).join('')}</div>
    <input type="text" id="gsearch" placeholder="Rechercher un jeu" value="${h(gSearch)}" autocomplete="off" style="margin-bottom:6px">
    ${gFilter === 'sort' ? '<p class="mute">Touche le bouton « À trier » pour dire si c\'est un jeu à histoire ou un autre type.</p>' : ''}
    <div id="glist">${listHtml()}</div>
    <section class="card" style="margin-top:16px"><h3>Ajouter un jeu</h3><form id="gaddform" class="row"><input type="text" id="gadd" placeholder="Nom du jeu" required style="flex:1 1 200px"><button class="btn p" type="submit">Ajouter</button></form></section>
    <details class="card"><summary><b>Réimporter depuis Playnite</b></summary><p class="mute">Les nouveaux jeux sont ajoutés ; tes statuts et ton tri sont conservés.</p>${importForm()}</details>`;
}
function importForm() {
  return `<label class="f" for="gfile">Fichier exporté (CSV, JSON ou TXT)</label><input type="file" id="gfile" accept=".csv,.json,.txt,text/csv,application/json,text/plain">
    <label class="f" for="gpaste">ou colle le contenu ici</label><textarea id="gpaste" style="min-height:90px" placeholder="name,sourceName,…"></textarea>
    <div class="row" style="margin-top:8px"><button class="btn p" data-act="gimport">Importer</button></div>`;
}
function importGames(text) {
  let parsed;
  try { parsed = L.parseLibrary(text); } catch (e) { toast('Fichier illisible'); return; }
  if (!parsed.length) { toast('Aucun jeu trouvé dans ce fichier'); return; }
  st.games = st.games || {};
  let added = 0, now = Date.now();
  for (const g of parsed) {
    const ex = st.games[g.key];
    if (ex) {
      ex.platforms = [...new Set([...(ex.platforms || []), ...g.platforms])];
      ex.steam = ex.steam || g.steam; ex.hidden = g.hidden; ex.fav = ex.fav || g.fav; ex.hltb = ex.hltb ?? g.hltb;
      if (!(ex.manual && ex.manual.story) && ex.story == null && g.story != null) ex.story = g.story;
      if (!(ex.manual && ex.manual.status) && ex.status === 'todo' && g.status !== 'todo') ex.status = g.status;
      ex.t = now;
    } else {
      st.games[g.key] = { name: g.name, platforms: g.platforms, genres: g.genres, steam: g.steam, hltb: g.hltb, story: g.story,
        status: g.status, fav: g.fav, hidden: g.hidden, t: now }; added++;
    }
  }
  save(); gFilter = 'all'; render();
  toast(`${parsed.length} jeux lus, ${added} nouveaux`);
  if (Sync.on()) runEnrich();
}
async function runEnrich() {
  if (enrich.running || !Sync.on()) return;
  enrich.running = true;
  const msg = t => { enrich.msg = t; const el = document.getElementById('enrichst'); if (el) el.textContent = t; };
  const todo = () => gList().filter(g => g.steam && !g.meta && !g.metaMiss && !(g.manual && g.manual.story));
  const total = todo().length; let stuck = 0;
  if (route() === 'games') render();
  try {
    while (todo().length) {
      const batch = todo().slice(0, 25);
      const r = await Sync.api('/api/ccna/steam?ids=' + batch.map(g => g.steam).join(','));
      let progressed = 0;
      for (const g of batch) {
        if (!(g.steam in r.items)) continue;
        const meta = r.items[g.steam], G = st.games[g.k];
        if (meta) { G.meta = meta; const cls = L.classifySteam(G.name, meta); if (cls !== null) G.story = cls; }
        else G.metaMiss = true;
        G.t = Date.now(); progressed++;
      }
      save({ noSync: true });
      msg(`${total - todo().length}/${total} jeux analysés…`);
      if (route() === 'games' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { const gl = document.getElementById('glist'); if (gl) gl.innerHTML = listHtml(); }
      if (r.limited || !progressed) {
        if (++stuck > 6) { msg('Steam limite les demandes : relance le tri plus tard, il reprendra où il s\'est arrêté.'); break; }
        msg(`${total - todo().length}/${total} analysés · Steam demande une pause, reprise dans 60 s…`);
        await new Promise(res => setTimeout(res, 60000));
      } else stuck = 0;
    }
    if (!todo().length) msg(`Tri terminé : ${total} jeux analysés. Vérifie l'onglet « À trier » pour le reste.`);
  } catch (e) {
    msg(e.status === 404 ? 'Le serveur n\'a pas encore la fonction Steam : lance update-ct.sh sur le Proxmox.' : 'Serveur injoignable (Tailscale actif ?) : relance le tri plus tard.');
  } finally {
    enrich.running = false; save(); if (route() === 'games') render();
  }
}

/* ---------- Récompenses ---------- */
let pendingRedeem = null;
function viewRewards() {
  return `<section class="card"><p class="mute" style="margin:0">Jetons disponibles</p><p class="big">${tokens()}</p>
    <p class="mute" style="margin:6px 0 0">1 XP gagné = 1 jeton. Le jeu n'est jamais bloqué : ce sont des bonus que tu t'offres en plus.</p></section>
    ${st.rewards.map(r => `<section class="card"><div class="row sp"><div><b>${h(r.name)}</b><br><span class="mute">${r.cost} jetons</span></div>
      <div class="row">${pendingRedeem === r.id
        ? `<button class="btn a sm" data-act="redeem-ok" data-id="${r.id}">Confirmer</button><button class="btn sm" data-act="redeem-no">Annuler</button>`
        : `<button class="btn p sm" data-act="redeem" data-id="${r.id}" ${tokens() < r.cost ? 'disabled' : ''}>Débloquer</button><button class="btn sm" data-act="delrw" data-id="${r.id}" aria-label="Supprimer ${h(r.name)}">Suppr.</button>`}</div></div>
      ${tokens() < r.cost ? `<div class="bar" style="background:var(--line);margin-top:10px"><i style="width:${Math.max(0, Math.round(tokens() / r.cost * 100))}%"></i></div>` : ''}</section>`).join('')}
    ${D.suggestedRewards.some(x => !st.rewards.some(r => r.id === x.id)) ? `<section class="card"><h3>Pack de récompenses gamer</h3><p class="mute">TFT, Minecraft, LoL, Satisfactory, Civ 6, sessions histoire et nouveau jeu solo, de 100 à 3 000 jetons. Tu pourras modifier ou supprimer chaque récompense.</p><button class="btn p" data-act="rwpack">Ajouter le pack</button></section>` : ''}
    <section class="card"><h3>Ajouter une récompense</h3>
      <form id="rwform"><label class="f" for="rwn">Récompense</label><input type="text" id="rwn" required maxlength="80" placeholder="Ex. : soirée raid avec la team">
      <label class="f" for="rwc">Coût en jetons</label><input type="number" id="rwc" required min="10" step="10" value="200" style="max-width:160px">
      <div class="row" style="margin-top:12px"><button class="btn p" type="submit">Ajouter</button></div></form></section>
    ${st.redeemed.length ? `<section class="card"><h3>Historique</h3><ul style="margin:0;padding-left:20px">${st.redeemed.slice().reverse().slice(0, 20).map(r => `<li>${h(r.date)} · ${h(r.name)} (${r.cost})</li>`).join('')}</ul></section>` : ''}`;
}

/* ---------- Réglages ---------- */
let resetArmed = false;
function viewSettings() {
  const p = pausedNow();
  return `${syncCard()}
    <section class="card"><h3>Mode pause (déplacement, repos)</h3>
      <p class="mute">Pendant une pause, les jours sans défi ne cassent pas ta série. Le défi reste faisable si tu en as envie.</p>
      <button class="btn ${p ? 'a' : 'p'}" data-act="pause">${p ? 'Terminer la pause' : 'Démarrer une pause aujourd\'hui'}</button>
      ${st.pauses.length ? `<p class="mute" style="margin-top:10px">Pauses : ${st.pauses.slice(-5).map(x => `${x.from} → ${x.to || 'en cours'}`).join(' · ')}</p>` : ''}</section>
    <section class="card"><h3>Sauvegarde manuelle</h3>
      <p class="mute">Utile sans synchro, ou comme sauvegarde de secours : copie le code ici, colle-le sur un autre appareil dans « Importer ».${memOnly ? ' <b>Attention : le stockage est indisponible sur ce navigateur, rien ne sera gardé après fermeture.</b>' : ''}</p>
      <textarea id="exp" readonly style="min-height:90px">${h(exportCode())}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn p" data-act="copy">Copier le code</button><button class="btn" data-act="dl">Télécharger un fichier</button></div>
      <label class="f" for="imp">Importer un code</label><textarea id="imp" style="min-height:90px" placeholder="Colle ici un code exporté"></textarea>
      <div class="row" style="margin-top:8px"><button class="btn" data-act="import">Importer (remplace la progression de cet appareil)</button></div></section>
    <section class="card"><h3>Remise à zéro</h3><p class="mute">Efface la progression de cet appareil et le déconnecte de la synchro. Pour repartir de zéro partout, supprime aussi la fiche dans l'admin PocketBase.</p><button class="btn" data-act="reset">${resetArmed ? 'Clique encore pour tout effacer' : 'Tout effacer'}</button></section>
    <p class="mute">CCNA Quest v1.3 · fonctionne hors ligne une fois installée.</p>`;
}
function exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(st)))); }


/* ---------- Synchronisation (PocketBase sur le homelab) ---------- */
const ORDER = L.allModules(D.courses).map(m => m.id);
const Sync = (() => {
  const CK = KEY + '-sync';
  let cfg = {}, timer = null, busy = false, again = false, status = '';
  try { cfg = JSON.parse(localStorage.getItem(CK) || '{}'); } catch (e) {}
  const store = () => { try { localStorage.setItem(CK, JSON.stringify(cfg)); } catch (e) {} };
  const on = () => !!(cfg.url && cfg.token);
  const base = () => cfg.url.replace(/\/+$/, '');
  async function api(path, opt = {}) {
    const r = await fetch(base() + path, { ...opt, headers: { 'Content-Type': 'application/json', ...(cfg.token ? { Authorization: cfg.token } : {}), ...(opt.headers || {}) } });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(body.message || ('HTTP ' + r.status)); e.status = r.status; throw e; }
    return body;
  }
  function setStatus(t) { status = t; const el = document.getElementById('syncst'); if (el) el.textContent = t; }
  async function login(url, email, password) {
    cfg = { url: url.trim() }; 
    const r = await api('/api/collections/users/auth-with-password', { method: 'POST', body: JSON.stringify({ identity: email.trim(), password }) });
    cfg = { url: url.trim(), email: email.trim(), token: r.token, user: r.record.id, tokAt: Date.now() };
    store(); return run();
  }
  function logout() { cfg = {}; store(); setStatus(''); }
  async function refresh() {
    const r = await api('/api/collections/users/auth-refresh', { method: 'POST' });
    cfg.token = r.token; cfg.tokAt = Date.now(); store();
  }
  async function run() {
    if (!on()) return;
    if (!navigator.onLine) { setStatus('Hors ligne : synchro à la reconnexion'); return; }
    if (busy) { again = true; return; }
    busy = true;
    try {
      if (Date.now() - (cfg.tokAt || 0) > 864e5) await refresh();
      const list = await api('/api/collections/progress/records?perPage=1');
      const rec = list.items && list.items[0];
      const before = JSON.stringify([st.xp, st.spent, st.modules, st.days, st.labs, st.plan, st.rewards, st.redeemed, st.pauses]);
      if (rec && rec.data && rec.data.v === 1) {
        const merged = L.mergeState(st, rec.data, ORDER);
        merged.daily = st.daily; merged.bonus = st.bonus; merged.mode = st.mode;
        st = Object.assign(fresh(), merged);
        snapFields();
        try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
      }
      const payload = JSON.stringify({ user: cfg.user, data: st });
      if (rec) await api('/api/collections/progress/records/' + rec.id, { method: 'PATCH', body: JSON.stringify({ data: st }) });
      else await api('/api/collections/progress/records', { method: 'POST', body: payload });
      cfg.last = Date.now(); store();
      setStatus('Synchronisé à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      const after = JSON.stringify([st.xp, st.spent, st.modules, st.days, st.labs, st.plan, st.rewards, st.redeemed, st.pauses]);
      if (before !== after) {
        const a = document.activeElement;
        if (!a || !/INPUT|TEXTAREA/.test(a.tagName)) render(); else renderHero();
      }
    } catch (e) {
      if (e.status === 401 || e.status === 403) { setStatus('Session expirée : reconnecte-toi dans Réglages'); cfg.token = null; store(); }
      else setStatus('Serveur injoignable (Tailscale activé ?) : nouvel essai plus tard');
    } finally {
      busy = false;
      if (again) { again = false; soon(); }
    }
  }
  function soon() { if (!on()) return; clearTimeout(timer); timer = setTimeout(run, 2500); }
  return { login, logout, run, soon, on, api, cfg: () => cfg, status: () => status };
})();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') Sync.run(); });
window.addEventListener('online', () => Sync.run());
setInterval(() => { if (document.visibilityState === 'visible') Sync.run(); }, 5 * 60 * 1000);

function syncCard() {
  const c = Sync.cfg();
  if (Sync.on()) return `<section class="card"><h3>Synchronisation automatique</h3>
    <p style="margin:0">Connecté à <code class="out">${h(c.url)}</code> (${h(c.email)}).</p>
    <p class="mute" id="syncst" style="margin:6px 0 10px">${h(Sync.status() || (c.last ? 'Dernière synchro : ' + new Date(c.last).toLocaleString('fr-FR') : 'En attente'))}</p>
    <p class="mute">La progression se synchronise toute seule à l'ouverture, après chaque action et toutes les 5 minutes. Hors ligne, elle part dès que le réseau revient.</p>
    <div class="row"><button class="btn p" data-act="syncnow">Synchroniser maintenant</button><button class="btn" data-act="synclogout">Se déconnecter</button></div></section>`;
  return `<section class="card"><h3>Synchronisation automatique</h3>
    <p class="mute">Relie l'appli à ton serveur PocketBase du homelab pour que téléphone et PC partagent la même progression.${c.url && !c.token ? ' <b>Ta session a expiré : reconnecte-toi.</b>' : ''}</p>
    <form id="syncform">
      <label class="f" for="su">Adresse du serveur</label><input type="text" id="su" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="https://ccna-sync.ton-tailnet.ts.net" value="${h(c.url || '')}" required>
      <label class="f" for="se">E-mail du compte</label><input type="text" id="se" inputmode="email" autocapitalize="off" spellcheck="false" value="${h(c.email || '')}" required>
      <label class="f" for="sp">Mot de passe</label><input type="password" id="sp" autocomplete="current-password" required style="width:100%;font-size:16px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg)">
      <p class="mute" id="syncst" style="margin:8px 0 0">${h(Sync.status())}</p>
      <div class="row" style="margin-top:10px"><button class="btn p" type="submit">Connecter</button></div>
    </form></section>`;
}

/* ---------- Routage ---------- */
function route() { return (location.hash || '#today').slice(1); }
function render() {
  const r = route();
  const v = r.startsWith('lab-') ? 'labs' : r;
  document.querySelectorAll('#tabs a').forEach(a => a.dataset.v === v ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  const main = $('#main');
  main.innerHTML = r.startsWith('lab-') ? viewLab(r.slice(4)) :
    r === 'labs' ? viewLabs() : r === 'games' ? viewGames() : r === 'parcours' ? viewParcours() : r === 'rewards' ? viewRewards() : r === 'settings' ? viewSettings() : viewToday();
  renderHero();
  const sf = $('#syncform');
  if (sf) sf.addEventListener('submit', async e => {
    e.preventDefault();
    const st0 = $('#syncst'); st0.textContent = 'Connexion…';
    try { await Sync.login($('#su').value, $('#se').value, $('#sp').value); render(); toast('Synchro activée'); }
    catch (err) { st0.textContent = err.status === 400 ? 'E-mail ou mot de passe incorrect' : 'Serveur injoignable : vérifie l\'adresse et que Tailscale est actif'; }
  });
  const ga = $('#gaddform');
  if (ga) ga.addEventListener('submit', e => {
    e.preventDefault(); const n = $('#gadd').value.trim(); if (!n) return;
    const k = L.gameKey(n); st.games = st.games || {};
    if (!st.games[k]) st.games[k] = { name: n, platforms: [], genres: [], steam: null, hltb: null, story: true, status: 'todo', fav: false, hidden: false, manual: { story: true }, t: Date.now() };
    save(); render(); toast('Jeu ajouté');
  });
  const rw = $('#rwform');
  if (rw) rw.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#rwn').value.trim(), cost = Math.max(10, +$('#rwc').value || 0);
    if (!name) return;
    st.rewards.push({ id: 'r' + Date.now(), name, cost }); save(); render();
  });
}
let lastRoute = null;
window.addEventListener('hashchange', () => { render(); if (route() !== lastRoute) { window.scrollTo(0, 0); lastRoute = route(); } });

/* ---------- Actions ---------- */
function curRun() { return st.bonus && st.bonus.date === today() && !st.bonus.finished ? [st.bonus, true] : [st.daily, false]; }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.tagName === 'INPUT') return;
  const act = b.dataset.act;
  const [run, isBonus] = curRun();
  if (act === 'mode') { st.mode = { date: today(), v: b.dataset.v }; save(); render(); }
  else if (act === 'mcq') { const q = D.mcq[run.items[run.res.length].i]; const k = +b.dataset.k; answer(run, k === q.a, { pick: k }); }
  else if (act === 'cmd') {
    const q = D.cmd[run.items[run.res.length].i]; const text = $('#ans').value;
    if (!text.trim()) return toast('Écris au moins une commande');
    const checks = L.checkCmd(q, text); answer(run, checks.every(c => c.ok), { text, checks });
  }
  else if (act === 'giveup') { const q = D.cmd[run.items[run.res.length].i]; const text = $('#ans').value; answer(run, false, { text, checks: L.checkCmd(q, text) }); }
  else if (act === 'gen') {
    const g = run.items[run.res.length].item;
    const vals = g.fields.map((_, k) => $('#gf' + k).value);
    const checks = L.checkGen(g, vals); answer(run, checks.every(c => c.ok), { vals, checks });
  }
  else if (act === 'next') next(run, isBonus);
  else if (act === 'syncnow') Sync.run();
  else if (act === 'rwpack') {
    for (const x of D.suggestedRewards) if (!st.rewards.some(r => r.id === x.id)) st.rewards.push({ ...x });
    st.rewards.sort((a, b) => a.cost - b.cost); save(); render(); toast('Pack ajouté');
  }
  else if (act === 'gfilter') { gFilter = b.dataset.v; gLimit = 60; render(); }
  else if (act === 'gmore') { gLimit += 100; $('#glist').innerHTML = listHtml(); }
  else if (act === 'gstory') {
    const g = st.games[b.dataset.k]; const nxt = g.story === true ? false : g.story === false ? null : true;
    setGame(b.dataset.k, { story: nxt }, nxt === null ? [] : ['story']); $('#glist').innerHTML = listHtml();
  }
  else if (act === 'gstart') { setGame(b.dataset.k, { status: 'current' }, ['status']); pickMode = false; toast('Bonne partie !'); render(); }
  else if (act === 'gdone') { setGame(b.dataset.k, { status: 'done', doneAt: today() }, ['status']); toast('Jeu terminé, bravo !'); render(); }
  else if (act === 'gpickno') { pickMode = false; render(); }
  else if (act === 'genrich') runEnrich();
  else if (act === 'gimport') {
    const f = $('#gfile'), txt = $('#gpaste').value;
    if (f && f.files && f.files[0]) { f.files[0].text().then(importGames); }
    else if (txt.trim()) importGames(txt);
    else toast('Choisis un fichier ou colle une liste');
  }
  else if (act === 'synclogout') { Sync.logout(); render(); }
  else if (act === 'mread') {
    const id = b.dataset.id, ms = st.modSteps[id] || (st.modSteps[id] = {});
    if (ms.read) return;
    ms.read = today(); markDay(); gain(XP.read, 'contenu du module lu');
    if (ms.quiz != null) completeModule(id);
    save(); render();
  }
  else if (act === 'mquiz') {
    const id = b.dataset.id, v = $('#mq').value;
    if (v === '' || +v < 0 || +v > 100) return toast('Entre ton score entre 0 et 100');
    const ms = st.modSteps[id] || (st.modSteps[id] = {});
    ms.quiz = Math.round(+v); markDay();
    gain(XP.quiz + (ms.quiz >= 80 ? XP.quizHigh : 0), ms.quiz >= 80 ? 'quiz réussi avec 80 % ou plus' : 'quiz du module fait');
    if (ms.read) completeModule(id);
    save(); render();
  }
  else if (act === 'bonus') { st.bonus = { date: today(), items: L.buildDaily(D, st.modules), res: [] }; save(); render(); }
  else if (act === 'labstep') {
    const l = D.labs.find(x => x.id === b.dataset.id), k = +b.dataset.k, s = labState(l.id);
    s.texts[k] = $('#ls' + k).value;
    if (!s.texts[k].trim()) return toast('Colle d\'abord la sortie de la commande');
    s.res[k] = L.checkOutput(l.steps[k], s.texts[k]);
    save(); finishLabIfComplete(l); render();
    toast(s.res[k].every(c => c.ok) ? 'Vérification réussie' : `${s.res[k].filter(c => !c.ok).length} objectif(s) à corriger`);
  }
  else if (act === 'labform') {
    const l = D.labs.find(x => x.id === b.dataset.id), s = labState(l.id);
    s.vals = l.form.map((_, k) => $('#lf' + k).value);
    s.res.form = L.checkForm(l.form, s.vals);
    save(); finishLabIfComplete(l); render();
  }
  else if (act === 'redeem') { pendingRedeem = b.dataset.id; render(); }
  else if (act === 'redeem-no') { pendingRedeem = null; render(); }
  else if (act === 'redeem-ok') {
    const r = st.rewards.find(x => x.id === b.dataset.id);
    if (r && tokens() >= r.cost && /(nouveau jeu|jeu solo)/i.test(r.name)) { pickMode = true; setTimeout(() => { location.hash = '#games'; }, 400); }
    if (r && tokens() >= r.cost) { st.spent += r.cost; st.redeemed.push({ id: 'x' + Date.now().toString(36), name: r.name, cost: r.cost, date: today() }); save(); toast('Profite bien !'); }
    pendingRedeem = null; render();
  }
  else if (act === 'delrw') { st.rewards = st.rewards.filter(x => x.id !== b.dataset.id); save(); render(); }
  else if (act === 'pause') {
    if (pausedNow()) {
      const p = st.pauses.find(x => x.from <= today() && (!x.to || x.to >= today()));
      const y = L.addDays(today(), -1);
      if (y < p.from) st.pauses.splice(st.pauses.indexOf(p), 1); else p.to = y;
    }
    else st.pauses.push({ from: today(), to: null });
    save(); render();
  }
  else if (act === 'copy') { navigator.clipboard.writeText(exportCode()).then(() => toast('Code copié'), () => { $('#exp').select(); toast('Sélectionné : copie-le manuellement'); }); }
  else if (act === 'dl') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(st, null, 1)], { type: 'application/json' }));
    a.download = `ccna-quest-${today()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  else if (act === 'import') {
    const raw = $('#imp').value.trim();
    try {
      const obj = raw.startsWith('{') ? JSON.parse(raw) : JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (obj.v !== 1 || typeof obj.xp !== 'number') throw 0;
      st = Object.assign(fresh(), obj); snapFields(); save(); render(); toast('Progression importée');
    } catch (err) { toast('Code invalide'); }
  }
  else if (act === 'reset') {
    if (!resetArmed) { resetArmed = true; render(); setTimeout(() => { resetArmed = false; if (route() === 'settings') render(); }, 5000); }
    else { Sync.logout(); st = fresh(); ensurePlan(); snapFields(); resetArmed = false; save(); render(); toast('Progression effacée sur cet appareil'); }
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.act === 'mod') {
    const id = t.dataset.id;
    const plan = ensurePlan();
    if (t.checked && !st.modules.includes(id)) {
      st.modules.push(id);
      st.modLog[id] = { date: today(), retro: true };
      plan.startRemaining = Math.max(0, plan.startRemaining - 1);
    } else if (!t.checked && st.modules.includes(id)) {
      st.modules = st.modules.filter(x => x !== id);
      const lg = st.modLog[id]; delete st.modLog[id];
      if (!lg || lg.retro) plan.startRemaining++;
    }
    save(); render();
  } else if (t.dataset.act === 'target' || t.dataset.act === 'examdate') {
    const plan = ensurePlan(), v = t.value || null;
    if (t.dataset.act === 'examdate') plan.exam = v;
    else if (v && v > today()) { plan.target = v; plan.start = today(); plan.startRemaining = TOTAL_MODS - st.modules.length; }
    else { toast('Choisis une date future'); }
    save(); render();
  } else if (t.dataset.act === 'gstatus') {
    setGame(t.dataset.k, { status: t.value, ...(t.value === 'done' ? { doneAt: today() } : {}) }, ['status']);
    if (gFilter !== 'all') $('#glist').innerHTML = listHtml();
  } else if (t.dataset.act === 'exam') {
    const v = t.value === '' ? null : Math.max(0, Math.min(100, +t.value));
    st.exams[t.dataset.c] = v; save();
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'gsearch') { gSearch = e.target.value; gLimit = 60; $('#glist').innerHTML = listHtml(); }
});
// Entrée = Vérifier dans les champs de réponse
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || !/^gf\d/.test(e.target.id)) return;
  e.preventDefault(); const b = document.querySelector('[data-act=gen]'); if (b) b.click();
});

snapFields();
render(); lastRoute = route();
Sync.run();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
