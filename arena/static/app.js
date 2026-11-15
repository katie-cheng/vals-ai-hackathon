const $ = id => document.getElementById(id);
let voter = localStorage.getItem('arenaVoter') || '';
let cur = null, shownAt = 0, n = 0, busy = false;
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

async function next(){
  busy = true;
  const r = await fetch('/api/next?voter=' + encodeURIComponent(voter)).then(r => r.json());
  if (r.done) { $('arena').innerHTML = '<p style="padding:24px">No pairs left for you. Thanks!</p>'; return; }
  cur = r; shownAt = Date.now();
  for (const k of ['A','B']) { $('broken'+k).checked = false; $('ship'+k).value = ''; }
  $('reason').value = '';
  $('brief').hidden = !r.prompt; $('brief').open = false; $('brieftext').textContent = r.prompt || '';
  render(); busy = false;
}

async function vote(choice){
  if (!cur || busy) return;
  busy = true;
  await fetch('/api/vote', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
    voter, left: cur.left.id, right: cur.right.id, category: cur.category, view: view(), choice,
    reason: $('reason').value, broken_left: $('brokenA').checked, broken_right: $('brokenB').checked,
    ship_left: $('shipA').value || null, ship_right: $('shipB').value || null, ms: Date.now() - shownAt})});
  if (choice !== 'skip') { n++; $('count').textContent = n + ' this session'; }
  toast(choice === 'skip' ? 'Skipped' : 'Saved');
  next();
}

document.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => vote(b.dataset.c)));
$('view').addEventListener('change', render);
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName) || $('arena').hidden) return;
  const m = {'1':'left','2':'same','3':'right','s':'skip','S':'skip'}[e.key];
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
