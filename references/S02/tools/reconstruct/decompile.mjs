// Decompile the deployed S02 bundle into a Vite + React + TS source tree.
// usage: node decompile.mjs BUNDLE.js OUTDIR
import { parse } from "@babel/parser";
import * as _t from "@babel/traverse";
import * as _g from "@babel/generator";
import * as t from "@babel/types";
import * as prettier from "prettier";
import fs from "fs";
import path from "path";
const traverse = _t.default || _t.traverse;
const generate = _g.default || _g.generate;

const [bundle, outDir] = process.argv.slice(2);
const src = fs.readFileSync(bundle, "utf8");
const ast = parse(src, { sourceType: "module" });
const body = ast.program.body;
const FIRST = body.findIndex((n) => n.type === "VariableDeclaration" && n.declarations.some((d) => d.id.name === "Jt"));
const START = body[FIRST].start;

// top-level names (assigned by reading what each binding holds) and the file each goes to
const NAMES = JSON.parse(fs.readFileSync(new URL("./names.json", import.meta.url)));
const VENDOR = {
  j: { ns: "React", from: "react" },
  Ta: { name: "useLocation", from: "react-router-dom" }, Rl: { name: "useNavigate", from: "react-router-dom" },
  se: { name: "Link", from: "react-router-dom" }, wu: { name: "useParams", from: "react-router-dom" },
  yy: { name: "BrowserRouter", from: "react-router-dom" }, X1: { name: "Routes", from: "react-router-dom" },
  Tt: { name: "Route", from: "react-router-dom" }, Kh: { name: "ReactDOM", from: "react-dom/client", def: true },
  bu: { name: "confetti", from: "canvas-confetti", def: true },
};
const pascal = (s) => s.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");

// collect app declarations
const decls = []; // {name, node(init or function), kind}
const lucide = {};
for (const n of body.slice(FIRST)) {
  if (n.type === "VariableDeclaration") {
    for (const d of n.declarations) {
      const nm = d.id.name;
      if (d.init?.type === "CallExpression" && d.init.callee.name === "ve") { lucide[nm] = pascal(d.init.arguments[0].value); continue; }
      if (NAMES[nm]) decls.push({ old: nm, ...NAMES[nm], decl: d, kind: n.kind });
    }
  } else if (n.type === "FunctionDeclaration" && NAMES[n.id.name]) decls.push({ old: n.id.name, ...NAMES[n.id.name], fn: n });
  else if (n.type === "ExpressionStatement" && src.slice(n.start, n.start + 20).startsWith("Kh.createRoot")) decls.push({ old: "__main", name: "__main", file: "src/main.tsx", stmt: n });
}

// rename bindings program-wide
const progScope = (() => { let s; traverse(ast, { Program(p) { s = p.scope; p.stop(); } }); return s; })();
for (const [o, v] of Object.entries(VENDOR)) progScope.rename(o, v.ns || v.name);
for (const [o, nw] of Object.entries(lucide)) progScope.rename(o, nw + "__icon");
for (const d of decls) if (d.old !== "__main") progScope.rename(d.old, d.name);

const LOCALS = JSON.parse(fs.readFileSync(new URL("./locals.json", import.meta.url)));
const safeText = (s) => s.length > 0 && !/[{}<>&\n\r\t\\]/.test(s) && !/\s{2,}/.test(s) && s.trim() !== "" && !/[\u00a0]/.test(s);
const singular = (s) => s.replace(/^(filtered|sorted|all|visible|my|user)(?=[A-Z])/, "").replace(/ies$/, "y").replace(/sses$/, "ss").replace(/s$/, "").replace(/^[A-Z]/, (c) => c.toLowerCase());
const lastName = (n) => t.isIdentifier(n) ? n.name : t.isMemberExpression(n) && t.isIdentifier(n.property) && !n.computed ? n.property.name : t.isCallExpression(n) && t.isMemberExpression(n.callee) ? lastName(n.callee.object) : null;

function freeName(scope, base) {
  let nm = base, i = 2;
  const taken = (x) => scope.hasBinding(x) || scope.hasGlobal(x) || scope.hasReference(x) || ["delete", "new", "class", "default", "in", "do", "if", "for", "case", "enum", "function", "var", "let", "const", "this", "true", "false", "null", "import", "export", "package", "private", "public", "static", "switch", "return", "typeof", "void", "while", "with", "yield", "interface", "implements", "protected", "super", "try", "catch", "finally", "throw", "break", "continue", "else", "extends", "debugger", "instanceof", "await"].includes(x);
  while (taken(nm)) nm = base + i++;
  return nm;
}
const isMin = (n) => /^[A-Za-z_$][A-Za-z0-9_$]?$/.test(n);

function tidy(rootPath, compName) {
  const traverse = (_r, v) => rootPath.traverse(v);
  const root = rootPath.node;
  const manual = LOCALS[compName] || {};
  // pass 1: literals
  traverse(root, {
    UnaryExpression(p) {
      const a = p.node.argument;
      if (p.node.operator === "!" && t.isNumericLiteral(a) && (a.value === 0 || a.value === 1)) p.replaceWith(t.booleanLiteral(a.value === 0));
      else if (p.node.operator === "void" && t.isNumericLiteral(a, { value: 0 })) p.replaceWith(t.identifier("undefined"));
    },
  });

  // pass 0: undo statement-level minification
  const asBlock = (p) => { if (!p.parentPath.isBlockStatement() && !p.parentPath.isProgram() && !p.parentPath.isSwitchCase() && p.key !== "init" && p.parentPath.node.body === p.node || ["consequent", "alternate"].includes(p.key) && !p.parentPath.isSwitchCase() && !p.parentPath.isConditionalExpression()) p.replaceWith(t.blockStatement([p.node])); };
  for (let round = 0; round < 6; round++) traverse(root, {
    ArrowFunctionExpression(p) {
      const b = p.node.body;
      if (t.isSequenceExpression(b) || t.isConditionalExpression(b) && false) p.node.body = t.blockStatement([t.returnStatement(b)]);
    },
    VariableDeclaration(p) {
      if (p.node.declarations.length > 1 && (p.parentPath.isBlockStatement() || p.parentPath.isProgram() || p.parentPath.isSwitchCase()) )
        p.replaceWithMultiple(p.node.declarations.map((d) => t.variableDeclaration(p.node.kind, [d])));
    },
    ReturnStatement(p) {
      const a = p.node.argument;
      if (t.isSequenceExpression(a) && p.parentPath.isBlockStatement()) {
        const last = a.expressions[a.expressions.length - 1];
        p.replaceWithMultiple([...a.expressions.slice(0, -1).map((e) => t.expressionStatement(e)), t.isIdentifier(last, { name: "undefined" }) || (t.isUnaryExpression(last) && last.operator === "void") ? t.returnStatement() : t.returnStatement(last)]);
      }
    },
    IfStatement(p) {
      const a = p.node.test;
      if (t.isSequenceExpression(a) && p.parentPath.isBlockStatement()) { p.insertBefore(a.expressions.slice(0, -1).map((e) => t.expressionStatement(e))); p.node.test = a.expressions[a.expressions.length - 1]; }
      for (const k of ["consequent", "alternate"]) if (p.node[k] && !t.isBlockStatement(p.node[k]) && !t.isIfStatement(p.node[k])) p.node[k] = t.blockStatement([p.node[k]]);
    },
    ExpressionStatement(p) {
      const e = p.node.expression;
      const inBlock = p.parentPath.isBlockStatement() || p.parentPath.isProgram() || p.parentPath.isSwitchCase();
      if (!inBlock) return;
      if (t.isSequenceExpression(e)) p.replaceWithMultiple(e.expressions.map((x) => t.expressionStatement(x)));
      else if (t.isLogicalExpression(e) && e.operator === "&&") p.replaceWith(t.ifStatement(e.left, t.blockStatement([t.expressionStatement(e.right)])));
      else if (t.isLogicalExpression(e) && e.operator === "||") p.replaceWith(t.ifStatement(t.unaryExpression("!", e.left), t.blockStatement([t.expressionStatement(e.right)])));
      else if (t.isConditionalExpression(e)) p.replaceWith(t.ifStatement(e.test, t.blockStatement([t.expressionStatement(e.consequent)]), t.blockStatement([t.expressionStatement(e.alternate)])));
    },
  });
  // pass 2: names
  const stateIdx = { n: 0 };
  traverse(root, {
    VariableDeclarator(p) {
      const { id, init } = p.node;
      // const [a, b] = React.useState(...)
      if (t.isArrayPattern(id) && t.isCallExpression(init) && src && generate(init.callee).code === "React.useState") {
        const key = "state" + stateIdx.n++;
        const nm = manual[key];
        if (nm && id.elements[0] && isMin(id.elements[0].name)) p.scope.rename(id.elements[0].name, freeName(p.scope, nm));
        if (nm && id.elements[1] && isMin(id.elements[1].name)) p.scope.rename(id.elements[1].name, freeName(p.scope, "set" + nm[0].toUpperCase() + nm.slice(1)));
      }
    },
    ObjectPattern(p) {
      for (const pr of p.node.properties) {
        if (!t.isObjectProperty(pr) || !t.isIdentifier(pr.key) || pr.computed) continue;
        const v = t.isAssignmentPattern(pr.value) ? pr.value.left : pr.value;
        if (t.isIdentifier(v) && v.name !== pr.key.name && isMin(v.name)) {
          const nm = freeName(p.scope, pr.key.name);
          p.scope.rename(v.name, nm);
        }
      }
    },
  });
  traverse(root, {
    ObjectProperty(p) { if (t.isIdentifier(p.node.key) && t.isIdentifier(p.node.value) && p.node.key.name === p.node.value.name && !p.node.computed) p.node.shorthand = true; },
    VariableDeclarator(p) {
      const { id } = p.node;
      if (t.isIdentifier(id) && manual[id.name] && p.scope.getBinding(id.name)?.path === p) p.scope.rename(id.name, freeName(p.scope, manual[id.name]));
    },
  });
  traverse(root, {
    "ArrowFunctionExpression|FunctionExpression"(p) {
      const par = p.parentPath;
      const ps = p.node.params;
      if (!ps.length) return;
      // array-method callbacks
      if (par.isCallExpression() && t.isMemberExpression(par.node.callee) && par.node.arguments[0] === p.node) {
        const m = par.node.callee.property.name;
        if (["map", "filter", "find", "some", "every", "forEach", "findIndex", "flatMap"].includes(m)) {
          let base = lastName(par.node.callee.object);
          if (base && /^[A-Z_]+$/.test(base)) base = base.toLowerCase().replace(/^.*_/, "");
          if (base && base.length > 2 && t.isIdentifier(ps[0]) && isMin(ps[0].name)) { const s = singular(base); p.scope.rename(ps[0].name, freeName(p.scope, s === base ? "item" : s)); }
          if (ps[1] && t.isIdentifier(ps[1]) && isMin(ps[1].name)) p.scope.rename(ps[1].name, freeName(p.scope, "index"));
          return;
        }
        if (m === "reduce") { if (t.isIdentifier(ps[0]) && isMin(ps[0].name)) p.scope.rename(ps[0].name, freeName(p.scope, "acc")); return; }
        if (m === "sort" && ps.length === 2) return;
      }
      // event handlers / updater functions
      if (ps.length === 1 && t.isIdentifier(ps[0]) && isMin(ps[0].name)) {
        const b = p.scope.getBinding(ps[0].name);
        const usesEvent = b.referencePaths.some((r) => r.parentPath.isMemberExpression() && r.parent.object === r.node && ["preventDefault", "target", "stopPropagation", "key", "currentTarget", "clientX"].includes(r.parent.property.name));
        if (usesEvent) p.scope.rename(ps[0].name, freeName(p.scope, "event"));
        else if (par.isCallExpression() && t.isIdentifier(par.node.callee) && /^set[A-Z]/.test(par.node.callee.name)) p.scope.rename(ps[0].name, freeName(p.scope, "prev"));
      }
    },
    CatchClause(p) { const q = p.node.param; if (q && t.isIdentifier(q) && isMin(q.name)) p.scope.rename(q.name, freeName(p.scope, "error")); },
  });
  // pass 3: JSX
  const toName = (n) => t.isIdentifier(n) ? t.jsxIdentifier(n.name) : t.isMemberExpression(n) && !n.computed ? t.jsxMemberExpression(toName(n.object), t.jsxIdentifier(n.property.name)) : null;
  const child = (c) => {
    if (t.isStringLiteral(c)) return safeText(c.value) ? [t.jsxText(c.value)] : [t.jsxExpressionContainer(c)];
    if (t.isJSXElement(c) || t.isJSXFragment(c)) return [c];
    if (t.isSpreadElement(c)) return [t.jsxSpreadChild(c.argument)];
    return [t.jsxExpressionContainer(c)];
  };
  traverse(root, {
    CallExpression: {
      exit(p) {
        const c = p.node.callee;
        if (!(t.isMemberExpression(c) && t.isIdentifier(c.object, { name: "n" }) && ["jsx", "jsxs"].includes(c.property.name))) return;
        let [type, props, key] = p.node.arguments;
        let tag, frag = false;
        if (t.isStringLiteral(type)) tag = t.jsxIdentifier(type.value);
        else if (t.isMemberExpression(type) && t.isIdentifier(type.object, { name: "n" }) && type.property.name === "Fragment") frag = true;
        else {
          if (t.isIdentifier(type) && !/^[A-Z]/.test(type.name)) {
            const nm = freeName(p.scope, "Icon"); p.scope.rename(type.name, nm); type = t.identifier(nm);
          }
          tag = toName(type);
          if (!tag) throw new Error("tag " + generate(type).code);
        }
        const attrs = []; let children = [];
        if (key) attrs.push(t.jsxAttribute(t.jsxIdentifier("key"), t.jsxExpressionContainer(key)));
        if (!t.isObjectExpression(props)) throw new Error("props " + generate(props).code.slice(0, 80));
        for (const pr of props.properties) {
          if (t.isSpreadElement(pr)) { attrs.push(t.jsxSpreadAttribute(pr.argument)); continue; }
          const k = t.isIdentifier(pr.key) ? pr.key.name : pr.key.value;
          if (k === "data-source-loc") continue;
          if (k === "children") { children = t.isArrayExpression(pr.value) && c.property.name === "jsxs" ? pr.value.elements.flatMap(child) : child(pr.value); continue; }
          const v = pr.value;
          let val;
          if (t.isStringLiteral(v) && !/["\n\r\\]/.test(v.value)) val = t.stringLiteral(v.value);
          else if (t.isBooleanLiteral(v, { value: true })) val = null;
          else val = t.jsxExpressionContainer(v);
          attrs.push(t.jsxAttribute(t.jsxIdentifier(k), val));
        }
        if (frag) p.replaceWith(t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), children));
        else p.replaceWith(t.jsxElement(t.jsxOpeningElement(tag, attrs, children.length === 0), children.length ? t.jsxClosingElement(tag) : null, children, children.length === 0));
        p.skip();
      },
    },
  });
}

// emit files
const files = {};
const order = [];
for (const d of decls) { (files[d.file] ||= []).push(d); if (!order.includes(d.file)) order.push(d.file); }
const allNames = Object.fromEntries(decls.filter((d) => d.old !== "__main").map((d) => [d.name, d.file]));
const rel = (from, to) => { let r = path.relative(path.dirname(from), to).replace(/\.tsx?$/, ""); return r.startsWith(".") ? r : "./" + r; };

for (const file of order) {
  const stmts = [];
  for (const d of files[file]) {
    let node;
    if (d.fn) node = d.fn;
    else if (d.stmt) node = d.stmt;
    else node = t.variableDeclaration("const", [d.decl]);
    const wrapper = t.file(t.program([node]));
    // need scopes from the original program: traverse in place via path lookup
    stmts.push({ d, node });
  }
  files[file] = stmts;
}
// tidy every declaration in place inside the original AST so scopes are right
traverse(ast, {
  Program(p) {
    for (const st of p.get("body")) {
      if (st.node.start < START) continue;
      const paths = st.isVariableDeclaration() ? st.get("declarations") : [st];
      for (const dp of paths) {
        const d = decls.find((x) => x.decl === dp.node || x.fn === dp.node || x.stmt === dp.node);
        if (!d) continue;
        tidy(dp, d.name);
      }
    }
    p.stop();
  },
});
// tidy() used a detached traverse; babel needs scope/parentPath, so run it via the program path instead
function tidyRunner() {}

for (const file of order) {
  const used = new Set();
  const codeParts = [];
  for (const { d, node } of files[file]) {
    let n = d.fn ? node : d.stmt ? node : t.variableDeclaration("const", [d.decl]);
    let code = generate(n, { jsescOption: { minimal: true }, retainLines: false, comments: false }).code;
    if (d.old !== "__main" && !d.private) code = "export " + code;
    codeParts.push(code);
    traverse(t.file(t.program([t.isStatement(n) ? n : t.expressionStatement(n)])), { noScope: true, "Identifier|JSXIdentifier"(p) { used.add(p.node.name); } });
  }
  const imp = [];
  const own = new Set(files[file].map((x) => x.d.name));
  if (used.has("React")) imp.push(`import * as React from "react";`);
  const byFrom = {};
  for (const v of Object.values(VENDOR)) if (!v.ns && used.has(v.name)) { if (v.def) imp.push(`import ${v.name} from "${v.from}";`); else (byFrom[v.from] ||= []).push(v.name); }
  for (const [f, ns] of Object.entries(byFrom)) imp.push(`import { ${ns.sort().join(", ")} } from "${f}";`);
  const icons = Object.values(lucide).filter((i) => used.has(i + "__icon")).sort();
  if (icons.length) imp.push(`import { ${icons.join(", ")} } from "lucide-react";`);
  const loc = {};
  for (const [nm, f] of Object.entries(allNames)) if (used.has(nm) && !own.has(nm)) (loc[f] ||= []).push(nm);
  for (const [f, ns] of Object.entries(loc)) imp.push(`import { ${ns.sort().join(", ")} } from "${rel(file, f)}";`);
  if (file === "src/main.tsx") imp.push(`import "./index.css";`);
  let code = imp.join("\n") + "\n\n" + codeParts.join("\n\n") + "\n";
  code = code.replace(/([A-Za-z0-9]+)__icon/g, "$1");
  if (NAMES.__default?.[file]) code += `\nexport default ${NAMES.__default[file]};\n`;
  code = await prettier.format(code, { parser: "typescript", printWidth: 110 });
  const out = path.join(outDir, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, code);
  console.log(file, code.split("\n").length);
}
