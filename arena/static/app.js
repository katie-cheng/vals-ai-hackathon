const $ = id => document.getElementById(id);
let voter = localStorage.getItem('arenaVoter') || '';
let cur = null, ahead = null, shownAt = 0, n = 0, busy = false;
const view = () => $('view').value;

function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),900);}

function render(){
  if(!cur) return;
  for (const [k, s] of [['A', cur.left], ['B', cur.right]]) {
    $('img'+k).src = s[view()];
    $('shot'+k).className = 'shot ' + view();
    $('shot'+k).scrollTop = 0;
    $('live'+k).href = s.live;
  }
}

function fetchPair(exclude){
  const q = '/api/next?voter=' + encodeURIComponent(voter) + (exclude ? '&exclude=' + exclude.left.id + ',' + exclude.right.id : '');
  return fetch(q).then(r => r.json());
}

function preload(p){
  if (!p || p.done) return;
  for (const s of [p.left, p.right]) for (const v of ['desktop', 'mobile']) { const i = new Image(); i.src = s[v]; }
}

async function next(){
  busy = true;
  const r = ahead ? await ahead : await fetchPair();
  ahead = null;
  if (r.done) { $('arena').innerHTML = '<p style="padding:24px">No pairs left for you. Thanks!</p>'; return; }
  cur = r; shownAt = Date.now();
  for (const k of ['A','B']) $('ship'+k).value = '';
  $('reason').value = '';
  $('brief').hidden = !r.prompt; $('brief').open = false; $('brieftext').textContent = r.prompt || '';
  render(); busy = false;
  ahead = fetchPair(r); ahead.then(preload);
}

async function vote(choice){
  if (!cur || busy) return;
  busy = true;
  await fetch('/api/vote', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
    voter, left: cur.left.id, right: cur.right.id, category: cur.category, view: view(), choice,
    reason: $('reason').value,
    ship_left: $('shipA').value || null, ship_right: $('shipB').value || null, ms: Date.now() - shownAt})});
  if (choice !== 'skip') { n++; $('count').textContent = n + ' this session'; }
  toast(choice === 'skip' ? 'Skipped' : 'Saved');
  next();
}

document.querySelectorAll('.remove').forEach(b => b.addEventListener('click', async () => {
  if (!cur || busy) return;
  const side = b.dataset.side, s = side === 'A' ? cur.left : cur.right;
  if (!confirm(`Stop showing site ${side}? It is removed for everyone and left out of results and exports. You can undo on the Results page.`)) return;
  busy = true;
  await fetch('/api/remove', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({voter, site: s.id})});
  toast('Removed'); ahead = null; next();
}));

document.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => vote(b.dataset.c)));
$('view').addEventListener('change', render);
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName) || $('arena').hidden) return;
  const m = {'1':'left','2':'right','3':'both','4':'neither','s':'skip','S':'skip'}[e.key];
  if (m) { e.preventDefault(); vote(m); }
  if (e.key === 'v') { $('view').value = view() === 'desktop' ? 'mobile' : 'desktop'; render(); }
});

function start(){ $('gate').hidden = true; $('arena').hidden = false;
  $('who').innerHTML = ''; const a = document.createElement('a'); a.href = '#'; a.textContent = voter;
  a.title = 'Change name'; a.onclick = e => { e.preventDefault(); localStorage.removeItem('arenaVoter'); location.reload(); };
  $('who').append(a); next(); }
$('gateform').addEventListener('submit', e => { e.preventDefault(); voter = $('name').value.trim(); if (!voter) return;
  localStorage.setItem('arenaVoter', voter); start(); });
if (voter) start(); else $('gate').hidden = false;
