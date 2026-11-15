import fs from 'fs'; import path from 'path';
import {parse} from '@babel/parser'; import _t from '@babel/traverse'; import _g from '@babel/generator'; import * as t from '@babel/types';
import prettier from 'prettier';
const traverse=_t.default?.default||_t.default||_t; const generate=_g.default?.default||_g.default||_g;
const [,,BUNDLE,OUT,MAPFILE]=process.argv;
const src=fs.readFileSync(BUNDLE,'utf8');
const START=412867;
const NAMES=JSON.parse(fs.readFileSync(MAPFILE,'utf8')); // {top:{min:name}, files:{min:file}}
const ast=parse(src,{sourceType:'module'});
const LUCIDE_HELPERS=new Set(['vb','z6','V6','i1','L6','B6','U6','Le']);
const pascal=s=>s.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('');
const icons={}; const kept=[];
for(const st of ast.program.body){
  if(st.start<START) continue;
  let names=st.type==='VariableDeclaration'?st.declarations.map(d=>d.id.name):st.type==='FunctionDeclaration'?[st.id.name]:[];
  if(names.some(n=>LUCIDE_HELPERS.has(n))) continue;
  if(st.type==='VariableDeclaration' && st.declarations.some(d=>d.init?.type==='CallExpression'&&d.init.callee.name==='Le')){
    const rest=[];
    for(const d of st.declarations){ if(d.init?.type==='CallExpression'&&d.init.callee.name==='Le') icons[d.id.name]=pascal(d.init.arguments[0].value);
      else if(!(d.init?.type==='ArrayExpression'&&d.init.elements[0]?.type==='ArrayExpression'&&d.init.elements[0].elements[0]?.type==='StringLiteral')) rest.push(d); }
    for(const d of rest){ const code='const '+src.slice(d.start,d.end)+';'; const files=[...new Set([...code.matchAll(/"src\/([A-Za-z/]+)\.tsx:\d+/g)].map(m=>m[1]))]; kept.push({code,names:[d.id.name],file:files[0]}); }
    continue;
  }
  const code=src.slice(st.start,st.end);
  const files=[...new Set([...code.matchAll(/"src\/([A-Za-z/]+)\.tsx:\d+/g)].map(m=>m[1]))];
  kept.push({code,names,file:files[0]});
}
const LIB={w:'React',u:'__jsx',F:'motion',Jt:'AnimatePresence',Ot:'useScroll',Ve:'useTransform',Fj:'useSpring',he:'Link',If:'NavLink',Ra:'useLocation',Hh:'useParams',Lh:'Navigate',a6:'Routes',ua:'Route',E6:'BrowserRouter',iT:'Lenis',MS:'ReactDOMClient'};
const LIBSRC={motion:'motion/react',AnimatePresence:'motion/react',useScroll:'motion/react',useTransform:'motion/react',useSpring:'motion/react',Link:'react-router-dom',NavLink:'react-router-dom',useLocation:'react-router-dom',useParams:'react-router-dom',Navigate:'react-router-dom',Routes:'react-router-dom',Route:'react-router-dom',BrowserRouter:'react-router-dom',Lenis:'lenis',createRoot:'react-dom/client'};
// file assignment per statement
for(const k of kept){ if(!k.file){ const f=k.names.map(n=>NAMES.files[n]).find(Boolean); k.file=f||'data/content'; } }
// build combined program, tagging statements
const prog=parse(kept.map(k=>k.code).join('\n'),{sourceType:'module'});
prog.program.body.forEach((st,i)=>{st._file=kept[i].file;});
const iconNames=new Set(Object.values(icons));
traverse(prog,{Program(p){
  for(const [min,nm] of Object.entries(NAMES.top)) if(p.scope.hasOwnBinding(min)) p.scope.rename(min,nm);
}});
traverse(prog,{
  Identifier(p){ if(!p.isReferencedIdentifier()) return; const n=p.node.name; if(p.scope.getBinding(n)) return;
    if(LIB[n]) p.node.name=LIB[n]; else if(icons[n]) p.node.name=icons[n]; },
});
traverse(prog,{ MemberExpression(p){ const o=p.node.object;
  if(t.isIdentifier(o,{name:'React'})&&!p.node.computed){ p.replaceWith(t.identifier(p.node.property.name)); }
  else if(t.isIdentifier(o,{name:'ReactDOMClient'})) p.replaceWith(t.identifier(p.node.property.name)); }});
// destructuring renames
const usedNames=new WeakMap();
function namesIn(scope){ if(usedNames.has(scope.block)) return usedNames.get(scope.block); const s=new Set(); scope.path.traverse({Identifier(q){s.add(q.node.name);}}); usedNames.set(scope.block,s); return s; }
traverse(prog,{ ObjectPattern(p){
  for(const prop of p.node.properties){ if(prop.type!=='ObjectProperty'||prop.computed) continue; const key=prop.key.type==='Identifier'?prop.key.name:prop.key.type==='StringLiteral'?prop.key.value:null; if(!key||!t.isValidIdentifier(key)) continue;
    const local=prop.value.type==='Identifier'?prop.value:prop.value.type==='AssignmentPattern'&&prop.value.left.type==='Identifier'?prop.value.left:null; if(!local||local.name===key) continue;
    const b=p.scope.getBinding(local.name); if(!b) continue; const names=namesIn(b.scope);
    if(names.has(key)||b.scope.hasBinding(key)||iconNames.has(key)||LIBSRC[key]) continue;
    b.scope.rename(local.name,key); names.add(key); if(prop.value.type==='Identifier') prop.shorthand=true; }
}});
// JSX
function tagOf(n){ if(t.isStringLiteral(n)) return t.jsxIdentifier(n.value); if(t.isIdentifier(n)) return t.jsxIdentifier(n.name); if(t.isMemberExpression(n)) return t.jsxMemberExpression(tagOf(n.object),t.jsxIdentifier(n.property.name)); throw new Error('tag '+n.type); }
function child(c){ if(t.isJSXElement(c)||t.isJSXFragment(c)) return c; if(t.isStringLiteral(c)){ if(/[{}<>&]/.test(c.value)||/^\s|\s$/.test(c.value)) return t.jsxExpressionContainer(c); return t.jsxText(c.value);} return t.jsxExpressionContainer(c); }
traverse(prog,{ CallExpression:{exit(p){ const c=p.node.callee; if(!t.isMemberExpression(c)||!t.isIdentifier(c.object,{name:'__jsx'})) return;
  const [tag,props,key]=p.node.arguments; const attrs=[]; let kids=[];
  if(key) attrs.push(t.jsxAttribute(t.jsxIdentifier('key'),t.jsxExpressionContainer(key)));
  if(props&&t.isObjectExpression(props)){ for(const pr of props.properties){ if(t.isSpreadElement(pr)){attrs.push(t.jsxSpreadAttribute(pr.argument));continue;}
      const k=pr.key.type==='Identifier'?pr.key.name:pr.key.value; if(k==='data-source-loc') continue;
      if(k==='children'){ kids=t.isArrayExpression(pr.value)&&c.property.name==='jsxs'?pr.value.elements.map(child):[child(pr.value)]; continue;}
      const v=pr.value; attrs.push(t.jsxAttribute(t.jsxIdentifier(k), t.isStringLiteral(v)&&!/["\\\n]/.test(v.value)?t.stringLiteral(v.value):t.jsxExpressionContainer(v))); } }
  else if(props) attrs.push(t.jsxSpreadAttribute(props));
  const isFrag=t.isMemberExpression(tag)&&t.isIdentifier(tag.object,{name:'__jsx'});
  if(isFrag&&!key){ p.replaceWith(t.jsxFragment(t.jsxOpeningFragment(),t.jsxClosingFragment(),kids)); return; }
  const name=isFrag?t.jsxIdentifier('Fragment'):tagOf(tag);
  p.replaceWith(t.jsxElement(t.jsxOpeningElement(name,attrs,kids.length===0),kids.length?t.jsxClosingElement(name):null,kids,kids.length===0)); }}});
// split into files
const byFile={}; const declFile={};
for(const st of prog.program.body){ (byFile[st._file]??=[]).push(st);
  const ns=st.type==='VariableDeclaration'?st.declarations.map(d=>d.id.name):st.type==='FunctionDeclaration'?[st.id.name]:[]; for(const n of ns) declFile[n]=st._file; }
const exported=new Set(); const fileImports={};
for(const [f,sts] of Object.entries(byFile)){
  const file=t.file(t.program(sts)); const used=new Set();
  traverse(file,{ Identifier(p){ if(p.isReferencedIdentifier()||p.parentPath.isJSXOpeningElement()) used.add(p.node.name);}, JSXIdentifier(p){ used.add(p.node.name);} });
  const imp={};
  for(const n of used){ if(declFile[n]&&declFile[n]!==f){ (imp[declFile[n]]??=new Set()).add(n); exported.add(n);} else if(!declFile[n]){ if(LIBSRC[n]) (imp[LIBSRC[n]]??=new Set()).add(n); else if(iconNames.has(n)) (imp['lucide-react']??=new Set()).add(n); else if(['useState','useEffect','useRef','useCallback','useMemo','forwardRef','createElement','StrictMode','Fragment','useContext','createContext','useLayoutEffect'].includes(n)) (imp['react']??=new Set()).add(n);} }
  fileImports[f]=imp;
}
for(const [f,sts] of Object.entries(byFile)){
  const body=sts.map(st=>{ const ns=st.type==='VariableDeclaration'?st.declarations.map(d=>d.id.name):st.type==='FunctionDeclaration'?[st.id.name]:[]; return ns.some(n=>exported.has(n))?t.exportNamedDeclaration(st,[]):st; });
  let head='';
  for(const [from,set] of Object.entries(fileImports[f])){ const rel=byFile[from]?path.relative(path.dirname('src/'+f),'src/'+from).replace(/^(?!\.)/,'./'):from; if(from==='lenis'){head+='import Lenis from "lenis";\n';continue;} head+=`import { ${[...set].sort().join(', ')} } from "${rel}";\n`; }
  if(f==='main') head+='import "./index.css";\n';
  let code=head+'\n'+generate(t.program(body),{jsescOption:{minimal:true}}).code;
  code=await prettier.format(code,{parser:'babel-ts',printWidth:110});
  const ext=f==='data/content'?'.tsx':'.tsx';
  const outp=path.join(OUT,'src',f+ext); fs.mkdirSync(path.dirname(outp),{recursive:true}); fs.writeFileSync(outp,code);
  console.log(outp, code.split('\n').length);
}
console.log('icons', JSON.stringify(icons));
