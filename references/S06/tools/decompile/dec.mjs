import fs from 'fs'; import path from 'path';
import {parse} from '@babel/parser'; import _t from '@babel/traverse'; import _g from '@babel/generator'; import * as t from '@babel/types'; import prettier from 'prettier';
const traverse=_t.default?.default||_t.default||_t; const gen=_g.default?.default||_g.default||_g;
const RAW=process.env.HOME+'/s06raw'; const OUT=process.argv[2]||'out';
const NAMES=JSON.parse(fs.readFileSync('names.json','utf8'));
const pascal=s=>{ const n=s.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(''); return ['Image','Map','File','Text','Link','Option','Set'].includes(n)?n+'Icon':n; };
// external (library) bindings of the index bundle -> [finalName, module]
const EXT={E:['React','react:default'],aT:['ReactDOM','react-dom/client:default'],Bn:['useLocation','react-router-dom'],Qv:['useNavigate','react-router-dom'],an:['Route','react-router-dom'],Jv:['Routes','react-router-dom'],CE:['BrowserRouter','react-router-dom'],Gt:['Link','react-router-dom'],di:['NavLink','react-router-dom'],tR:['useSearchParams','react-router-dom'],gi:['AnimatePresence','framer-motion'],Oe:['motion','framer-motion'],P1:['useReducedMotion','framer-motion'],p:['__jsx',''],Bt:['__icon',''],Ba:['__preload',''],__vite__mapDeps:['__deps','']};
const globalMod={}; // finalName -> module spec ('react', './lib/store' as file key, ...)
for(const [k,[n,m]] of Object.entries(EXT)) if(m) globalMod[n]=m;
const files={}; // file -> [code statements nodes]
const fileDefs={}; // finalName -> file
const defaults={}; // file -> default export name
const chunkExports={}; // chunkfile -> {exportedName: finalName}
function load(f){const src=fs.readFileSync(path.join(RAW,f),'utf8'); return {src,ast:parse(src,{sourceType:'module'})};}
function iconName(node){ if(t.isCallExpression(node)&&t.isIdentifier(node.callee)&&node.arguments.length===2&&t.isStringLiteral(node.arguments[0])) return node.arguments[0].value; }

// ---------- index
const idx=load('index-BbgvWssR.js');
let idxProgramPath; traverse(idx.ast,{Program(p){idxProgramPath=p; p.stop();}});
const idxScope=idxProgramPath.scope; const body=idx.ast.program.body; const APP0=body[645].start;
// lucide icons in index
const idxIcon={};
for(const [name,b] of Object.entries(idxScope.bindings)){ const init=b.path.node.init; if(init&&t.isCallExpression(init)&&t.isIdentifier(init.callee,{name:'Bt'})){ idxIcon[name]=pascal(init.arguments[0].value); } }
for(const [k,v] of Object.entries(idxIcon)){ EXT[k]=[v,'lucide-react']; globalMod[v]='lucide-react'; }
const used=new Set(Object.values(EXT).map(x=>x[0]));
function uniq(n){ let x=n,i=2; while(used.has(x)) x=n+(i++); used.add(x); return x; }
// rename index app top-levels (standalone program of the app statements)
const idxFinal={}; for(const [k,[n]] of Object.entries(EXT)) idxFinal[k]=n;
const idxStmts=body.slice(645,679); const idxApp=t.file(t.program(idxStmts,[],'module'));
traverse(idxApp,{Program(p){ const sc=p.scope; for(const name of Object.keys(sc.bindings)){ idxFinal[name]=uniq(NAMES.index[name]||('_idx_'+name.replace(/\$/g,'S'))); }
  const tmp={}; let i=0; for(const k of Object.keys(sc.bindings)){ tmp[k]='__tmpi'+(i++)+'_'; sc.rename(k,tmp[k]); } for(const [k,v] of Object.entries(tmp)) sc.rename(v,idxFinal[k]);
  p.traverse({ReferencedIdentifier(q){ const n=q.node.name; if(!q.scope.getBinding(n)&&EXT[n]&&q.node.type==='Identifier') q.node.name=EXT[n][0]; }}); p.stop(); }});
const exp=body[body.length-1]; const idxExport={}; for(const s of exp.specifiers) idxExport[s.exported.name]=idxFinal[s.local.name];
// ---------- chunks
const chunkNames=fs.readdirSync(RAW).filter(f=>f.endsWith('.js')&&!f.startsWith('index-'));
const chunks={}; for(const f of chunkNames) chunks[f]=load(f);
// first pass: icon-only chunk exports
function processChunkScope(f){ const c=chunks[f]; let pp; traverse(c.ast,{Program(p){pp=p;p.stop();}}); c.pp=pp; return pp; }
const order=[...chunkNames].sort((a,b)=>{const w=x=>/^(badge|log-out|mail|message|search|send|store|truck)/.test(x)?0:/^OrderTracker/.test(x)?1:2; return w(a)-w(b);});
for(const f of order){ const pp=processChunkScope(f); const scope=pp.scope; const key=f.split('-')[0]; const nm=(NAMES[key]||{});
  const fin={};
  for(const n of pp.node.body){ if(t.isImportDeclaration(n)){ const from=path.basename(n.source.value); for(const s of n.specifiers){ const imp=s.imported.name; const target=from.startsWith('index-')?idxExport[imp]:chunkExports[from][imp]; if(!target) throw new Error('unresolved '+f+' '+imp); fin[s.local.name]=target; } } }
  for(const [name,b] of Object.entries(scope.bindings)){ if(b.kind==='module') continue; const init=b.path.node.init; const ic=init&&iconName(init);
    if(ic && fin[init.callee.name]==='__icon'){ const P=pascal(ic); fin[name]=P; globalMod[P]='lucide-react'; used.add(P); b.path.__icon=true; }
    else if(t.isVariableDeclarator(b.path.node)&&t.isArrayExpression(init)&&init.elements.every(e=>t.isArrayExpression(e)&&t.isStringLiteral(e.elements[0]))&&init.elements.length&&b.referencePaths.length===1){ fin[name]='__iconnode_'+name; }
    else fin[name]=uniq(nm[name]||('_'+key+'_'+name.replace(/\$/g,'S'))); }
  // two-phase rename to avoid collisions
  const tmp={}; let i=0; for(const k of Object.keys(fin)){ tmp[k]='__tmp'+(i++)+'_'; scope.rename(k,tmp[k]); } for(const k of Object.keys(fin)) scope.rename(tmp[k],fin[k]);
  chunkExports[f]={}; for(const n of pp.node.body) if(t.isExportNamedDeclaration(n)) for(const s of n.specifiers){ chunkExports[f][s.exported.name]=s.local.name; }
}
// ---------- JSX conversion
const isJsxCall=n=>t.isCallExpression(n)&&t.isMemberExpression(n.callee)&&t.isIdentifier(n.callee.object,{name:'__jsx'})&&['jsx','jsxs'].includes(n.callee.property.name);
function tagName(n){ if(t.isStringLiteral(n)) return t.jsxIdentifier(n.value); if(t.isIdentifier(n)) return t.jsxIdentifier(n.name); if(t.isMemberExpression(n)){ if(t.isIdentifier(n.object,{name:'__jsx'})&&n.property.name==='Fragment') return null; return t.jsxMemberExpression(tagName(n.object),t.jsxIdentifier(n.property.name)); } throw new Error('tag '+n.type); }
function child(n){ if(t.isStringLiteral(n)){ const v=n.value; if(v&&!/[{}<>&\n]/.test(v)&&v.trim()===v&&!/\s{2,}/.test(v)) return t.jsxText(v); return t.jsxExpressionContainer(n); } if(t.isJSXElement(n)||t.isJSXFragment(n)) return n; return t.jsxExpressionContainer(n); }
function toJsx(n){ const [tag,props,key]=n.arguments; const name=tagName(tag); const attrs=[]; let children=[];
  if(key) attrs.push(t.jsxAttribute(t.jsxIdentifier('key'),t.jsxExpressionContainer(key)));
  if(!t.isObjectExpression(props)) throw new Error('props '+props.type);
  for(const p of props.properties){ if(t.isSpreadElement(p)){ attrs.push(t.jsxSpreadAttribute(p.argument)); continue; }
    const k=t.isIdentifier(p.key)?p.key.name:p.key.value; if(k==='data-source-loc') continue;
    if(k==='children'){ children=t.isArrayExpression(p.value)?p.value.elements.map(child):[child(p.value)]; continue; }
    let v=p.value; if(t.isObjectMethod(p)) throw new Error('method');
    let av; if(t.isStringLiteral(v)&&!/["\n\\]/.test(v.value)) av=t.stringLiteral(v.value); else if(t.isBooleanLiteral(v,{value:true})) av=null; else av=t.jsxExpressionContainer(v);
    attrs.push(t.jsxAttribute(t.jsxIdentifier(k),av)); }
  if(name===null){ return t.jsxFragment(t.jsxOpeningFragment(),t.jsxClosingFragment(),children); }
  const self=children.length===0; return t.jsxElement(t.jsxOpeningElement(name,attrs,self),self?null:t.jsxClosingElement(name),children,self); }
function clean(ast){ traverse(ast,{
  CallExpression:{exit(p){ if(isJsxCall(p.node)){ const tg=p.node.arguments[0]; if(t.isIdentifier(tg)&&/^[a-z]/.test(tg.name)&&p.scope.getBinding(tg.name)){ let w='Icon',i=2; while(p.scope.hasBinding(w)||p.scope.hasGlobal(w)||p.scope.hasReference(w)) w='Icon'+(i++); p.scope.getBinding(tg.name).scope.rename(tg.name,w); } p.replaceWith(toJsx(p.node)); } }},
  UnaryExpression(p){ const n=p.node; if(n.operator==='!'&&t.isNumericLiteral(n.argument)) p.replaceWith(t.booleanLiteral(n.argument.value===0)); else if(n.operator==='void'&&t.isNumericLiteral(n.argument)) p.replaceWith(t.identifier('undefined')); },
  // destructuring: {data:a} -> {data}
  ObjectPattern(p){ for(const pr of p.node.properties){ if(!t.isObjectProperty(pr)||pr.computed||!t.isIdentifier(pr.key)) continue; let loc=t.isAssignmentPattern(pr.value)?pr.value.left:pr.value; if(!t.isIdentifier(loc)||loc.name===pr.key.name) continue; const want=pr.key.name; if(['default','class','new','delete','in','for'].includes(want)) continue; const sc=p.scope; const b=sc.getBinding(loc.name); if(!b) continue; if(sc.hasBinding(want)||sc.hasGlobal(want)||sc.hasReference(want)) continue; let clash=false; b.scope.path.traverse({Scope(q){ if(q.scope.hasOwnBinding(want)||q.scope.hasGlobal(want)) clash=true; }}); if(clash) continue; b.scope.rename(loc.name,want); } },
 });
 const RES=new Set(['default','class','new','delete','in','for','function','var','let','const','if','else','return','switch','case','type','name','id','key','value','children','title','text','label','status','length','open','close','top','event','history','location','document','window','self','parent','origin','screen','focus','blur','print','stop','find','scroll','alert','confirm','prompt','items','item','data','order','orders','image','images','category','price','total','code','date','email','phone','address','notes','rating','password','settings','content','customer','review','extras','options','quantity','src','alt','href','to','style','className','onClick','onChange','disabled','checked','placeholder','required','icon','Icon','active']);
 const tryRename=(scope,from,want)=>{ if(from===want||from.length>2&&!/^[a-zA-Z$_][a-zA-Z0-9$_]?$/.test(from)) return; if(!/^[A-Za-z_$][\w$]*$/.test(want)||RES.has(want)&&false) return; const b=scope.getBinding(from); if(!b||b.kind==='module') return; if(b.scope.block.type==='Program') return; if(scope.hasBinding(want)||scope.hasGlobal(want)||scope.hasReference(want)) return; let clash=false; b.scope.path.traverse({Scope(q){ if(q.scope.hasOwnBinding(want)||q.scope.hasGlobal(want)) clash=true; }}); if(b.scope.hasOwnBinding(want)) clash=true; if(clash) return; b.scope.rename(from,want); };
 traverse(ast,{ ObjectExpression(p){ for(const pr of p.node.properties){ if(t.isObjectProperty(pr)&&!pr.computed&&t.isIdentifier(pr.key)&&t.isIdentifier(pr.value)&&pr.value.name.length<=2) tryRename(p.scope,pr.value.name,pr.key.name); } },
});
 traverse(ast,{  VariableDeclarator(p){ const n=p.node; if(t.isArrayPattern(n.id)&&n.id.elements.length===2&&t.isCallExpression(n.init)&&t.isMemberExpression(n.init.callee)&&n.init.callee.property.name==='useState'){ const [a,b]=n.id.elements; if(t.isIdentifier(a)&&t.isIdentifier(b)){ const m=b.name.match(/^set([A-Z].*)$/); if(m) tryRename(p.scope,a.name,m[1][0].toLowerCase()+m[1].slice(1)); else if(a.name.length>2) tryRename(p.scope,b.name,'set'+a.name[0].toUpperCase()+a.name.slice(1)); } } } });
 traverse(ast,{
  ObjectProperty(p){ const n=p.node; if(!n.computed&&t.isIdentifier(n.key)&&t.isIdentifier(n.value)&&n.key.name===n.value.name) n.shorthand=true; if(!n.computed&&t.isIdentifier(n.key)&&t.isAssignmentPattern(n.value)&&t.isIdentifier(n.value.left,{name:n.key.name})) n.shorthand=true; },
  SequenceExpression(p){ if(t.isExpressionStatement(p.parent)&&(t.isBlockStatement(p.parentPath.parent)||t.isProgram(p.parentPath.parent))) p.parentPath.replaceWithMultiple(p.node.expressions.map(e=>t.expressionStatement(e)));
    else if(t.isReturnStatement(p.parent)&&t.isBlockStatement(p.parentPath.parent)){ const ex=p.node.expressions; p.parentPath.replaceWithMultiple([...ex.slice(0,-1).map(e=>t.expressionStatement(e)),t.returnStatement(ex[ex.length-1])]); } } });
 for(let k=0;k<3;k++) traverse(ast,{ ExpressionStatement(p){ const e=p.node.expression; if(!(t.isBlockStatement(p.parent)||t.isProgram(p.parent))) return; if(t.isLogicalExpression(e)&&e.operator==='&&'){ p.replaceWith(t.ifStatement(e.left,t.blockStatement([t.expressionStatement(e.right)]))); } else if(t.isConditionalExpression(e)){ p.replaceWith(t.ifStatement(e.test,t.blockStatement([t.expressionStatement(e.consequent)]),t.blockStatement([t.expressionStatement(e.alternate)]))); } else if(t.isSequenceExpression(e)){ p.replaceWithMultiple(e.expressions.map(x=>t.expressionStatement(x))); } } }); }
clean(idxApp); for(const f of chunkNames) clean(chunks[f].ast);
// ---------- assign statements to files
const locOf=(src)=>{const m=src.match(/src\/[A-Za-z0-9_\/.-]+\.tsx?/); return m&&m[0];};
function assign(stmts, srcOf, overrides){ const res=[]; let pending=[]; let last=null; for(const [i,n] of stmts.entries()){ let f=overrides?.(i,n)||locOf(srcOf(n)); if(f){ for(const q of pending) res.push([q,f]); pending=[]; res.push([n,f]); last=f; } else pending.push(n); } for(const q of pending) res.push([q,last]); return res; }
function add(file,n){ (files[file]=files[file]||[]).push(n); const ids=t.isFunctionDeclaration(n)||t.isClassDeclaration(n)?[n.id.name]:t.isVariableDeclaration(n)?n.declarations.flatMap(d=>Object.keys(t.getBindingIdentifiers(d.id))):[]; for(const id of ids) fileDefs[id]=file; }
const origIdx=load('index-BbgvWssR.js'); const ob=origIdx.ast.program.body;
for(const [n,f] of assign(idxApp.program.body,n=>origIdx.src.slice(ob[idxApp.program.body.indexOf(n)+645].start,ob[idxApp.program.body.indexOf(n)+645].end),(i)=> i<=9?'src/lib/store.tsx': (i===27||i===28)?'src/App.tsx':null)) add(f,n);
for(const f of chunkNames){ const c=chunks[f]; const orig=load(f); const stm=c.ast.program.body; const pairs=[]; stm.forEach((n,i)=>{ if(t.isImportDeclaration(n)) return; if(t.isExportNamedDeclaration(n)){ for(const s of n.specifiers) if(s.exported.name==='default') c.def=s.local.name; return; }
   if(t.isVariableDeclaration(n)){ n.declarations=n.declarations.filter(d=>!(d.id.name.startsWith('__iconnode_')||globalMod[d.id.name]==='lucide-react')); if(!n.declarations.length) return; }
   pairs.push([n,orig.src.slice(orig.ast.program.body[i].start,orig.ast.program.body[i].end)]); });
  const m=new Map(pairs); const as=assign(pairs.map(p=>p[0]),n=>m.get(n)); for(const [n,file] of as){ if(!file) continue; add(file,n); } if(c.def) defaults[fileDefs[c.def]]=c.def; }
// ---------- emit
const rel=(from,to)=>{ let r=path.relative(path.dirname(from),to).replace(/\.tsx?$/,''); return r.startsWith('.')?r:'./'+r; };
const lazyMap={}; for(const f of chunkNames){ const c=chunks[f]; if(c.def) lazyMap[f]=fileDefs[c.def]; }
for(const [file,stmts] of Object.entries(files)){
  const prog=t.file(t.program(stmts.map(s=>t.cloneNode(s,true)),[],'module'));
  // lazy imports
  traverse(prog,{ VariableDeclaration(p){ const n=p.node; if(n.declarations.length>1&&!t.isFor(p.parent)&&(t.isBlockStatement(p.parent)||t.isProgram(p.parent))) p.replaceWithMultiple(n.declarations.map(d=>t.variableDeclaration(n.kind,[d]))); }, CallExpression(p){ if(t.isIdentifier(p.node.callee,{name:'__preload'})){ const imp=p.node.arguments[0].body; const target=lazyMap[path.basename((imp.source||imp.arguments[0]).value)]; p.replaceWith(t.importExpression(t.stringLiteral(rel(file,target)))); } } });
  const defined=new Set(); const refs=new Set();
  traverse(prog,{Program(p){ for(const k of Object.keys(p.scope.bindings)) defined.add(k); for(const k of Object.keys(p.scope.globals)) refs.add(k); }});
  const imports={}; for(const r of refs){ let mod=globalMod[r]; let def=false; if(mod){ if(mod.endsWith(':default')){mod=mod.split(':')[0];def=true;} } else if(fileDefs[r]&&fileDefs[r]!==file){ mod=rel(file,fileDefs[r]); if(defaults[fileDefs[r]]===r) def=true; } else continue; (imports[mod]=imports[mod]||{def:null,named:[]}); if(def) imports[mod].def=r; else imports[mod].named.push(r); }
  const order=['react','react-dom/client','react-router-dom','framer-motion','lucide-react'];
  let head=Object.entries(imports).sort((a,b)=>{const ia=order.indexOf(a[0]),ib=order.indexOf(b[0]); return (ia<0?99:ia)-(ib<0?99:ib)||a[0].localeCompare(b[0]);}).map(([m,v])=>`import ${[v.def,v.named.length?'{ '+v.named.sort().join(', ')+' }':null].filter(Boolean).join(', ')} from ${JSON.stringify(m)};`).join('\n');
  if(file==='src/main.tsx') head+='\nimport "./index.css";';
  // exports
  const exported=new Set(); for(const [name,f2] of Object.entries(fileDefs)) if(f2===file) exported.add(name);
  let code=gen(prog,{jsescOption:{minimal:true},compact:true}).code;
  let out=head+'\n\n'+code;
  out=await prettier.format(out,{parser:'babel',printWidth:120});
  // add export keywords for names used elsewhere
  const usedElsewhere=new Set(); for(const [f2,st] of Object.entries(files)){ if(f2===file) continue; const pr=t.file(t.program(st.map(s=>t.cloneNode(s,true)))); traverse(pr,{Program(p){ for(const k of Object.keys(p.scope.globals)) if(exported.has(k)) usedElsewhere.add(k); }}); }
  for(const name of usedElsewhere){ const d=defaults[file]===name; const re=new RegExp(`^(async function|function|const|let|class) ${name.replace(/\$/g,'\\$')}\\b`,'m'); if(!re.test(out)){ out+=`\nexport { ${name} };\n`; continue; } out=out.replace(re,(m,k)=> d&&k!=='const'?`export default ${k} ${name}`:`export ${k} ${name}`); }
  if(defaults[file]&&!usedElsewhere.has(defaults[file])){ const name=defaults[file]; out=out.replace(new RegExp(`^function ${name}\\b`,'m'),`export default function ${name}`); }
  const dst=path.join(OUT,file); fs.mkdirSync(path.dirname(dst),{recursive:true}); fs.writeFileSync(dst,out);
  console.log(file,out.length,(out.match(/_(idx|[A-Z][a-zA-Z]+)_[A-Za-z0-9]+/g)||[]).filter((v,i,a)=>a.indexOf(v)===i).length);
}
