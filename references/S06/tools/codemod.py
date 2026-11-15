"""First mechanical pass of the rebuild: apply the design-system tokens to every className in solution/src.

usage: python codemod.py SRC_DIR
It only rewrites utility classes (radii, type size, case, weight, shadows, hover motion, blur). Everything structural was edited by hand afterwards;
`reference.patch` is the source of truth for the result.
"""
import pathlib, re, sys

V = r"(?P<v>(?:!|[a-z-]+:|\[[^\]]+\]:)*)"  # variant prefixes such as sm:, hover:, group-hover:, !

def unit_end(s, i):
    """End index of the className value starting at s[i] (a quote or a brace)."""
    if s[i] == '"':
        return s.index('"', i + 1) + 1
    stack = []; j = i  # entries: "{" for a brace, or the quote character of an open string
    while j < len(s):
        c = s[j]; top = stack[-1] if stack else None
        if top in ('"', "'"):
            if c == "\\": j += 2; continue
            if c == top: stack.pop()
        elif top == "`":
            if c == "\\": j += 2; continue
            if c == "`": stack.pop()
            elif c == "$" and s[j + 1] == "{": stack.append("{"); j += 1
        else:
            if c in "\"'`": stack.append(c)
            elif c == "{": stack.append("{")
            elif c == "}":
                stack.pop()
                if not stack: return j + 1
        j += 1
    return len(s)

def tok(pattern):
    return re.compile(r"(?<![\w\-\[/.])" + V + pattern + r"(?![\w\-\[/.:])")

def rewrite(unit, loose=False):
    display = bool(re.search(r"font-display|display-title", unit))
    sizes = dict.fromkeys(re.findall(r"(?<![\w:-])h-(\d+(?:\.\d+)?)(?![\w.\-\[])", unit))
    circle = any(re.search(r"(?<![\w:-])w-" + re.escape(n) + r"(?![\w.\-\[])", unit) for n in sizes) or bool(re.search(r"(?<![\w:-])h-(0\.5|1|1\.5|2|2\.5)(?![\w.\-\[])", unit)) or "size-" in unit
    u = unit
    u = tok(r"rounded(?P<side>-[tblr]{1,2})?-(?:3xl|2xl|\[2rem\]|\[\d+px\])").sub(lambda m: f"{m['v']}rounded{m['side'] or ''}-lg", u)
    u = tok(r"rounded(?P<side>-[tblr]{1,2})?-xl").sub(lambda m: f"{m['v']}rounded{m['side'] or ''}-md", u)
    if not circle and not loose:
        u = tok(r"rounded-full").sub(lambda m: f"{m['v']}rounded-md", u)
    u = tok(r"text-\[(?:8|9|10|11)px\]").sub(lambda m: f"{m['v']}text-xs", u)
    if not display:
        u = tok(r"(?:uppercase|tracking-(?:\[[^\]]+\]|wide|wider|widest))").sub("", u)
        u = tok(r"font-(?:extrabold|black|bold)").sub(lambda m: f"{m['v']}font-semibold", u)
    else:
        u = tok(r"font-black").sub(lambda m: f"{m['v']}font-bold", u)
        u = tok(r"tracking-(?:wide|wider|widest)").sub("", u)
        scale = {"8xl": "5xl", "7xl": "5xl", "6xl": "4xl", "5xl": "4xl", "4xl": "3xl", "3xl": "2xl", "2xl": "xl", "[88px]": "6xl", "[54px]": "4xl"}
        u = tok(r"text-(?P<s>8xl|7xl|6xl|5xl|4xl|3xl|2xl|\[88px\]|\[54px\])").sub(lambda m: f"{m['v']}text-{scale[m['s']]}", u)
        u = tok(r"leading-(?:none|\[\.\d+\])").sub(lambda m: f"{m['v']}leading-[1.05]", u)
    u = re.sub(r"(?<![\w\-\[/.])(?:group-hover|hover):(?:-translate-y-[\d.]+|translate-x-1|scale-(?:\d+|\[[^\]]+\])|shadow-(?:\w+|\[[^\]]+\]))(?![\w\-\[/.:])", "", u)
    u = tok(r"shadow-(?:lg|xl|2xl|md)").sub(lambda m: f"{m['v']}shadow-sm", u)
    u = tok(r"shadow-red-500/\d+").sub("", u)
    u = tok(r"backdrop-blur(?:-\w+)?").sub("", u)
    u = tok(r"duration-(?:300|500|700)").sub(lambda m: f"{m['v']}duration-200", u)
    u = tok(r"bg-white/95").sub(lambda m: f"{m['v']}bg-white", u)
    u = tok(r"bg-black/95").sub(lambda m: f"{m['v']}bg-black", u)
    u = re.sub(r"(?<=[\w\]\)]) {2,}(?=[\w!\[$-])", " ", u)
    u = re.sub(r'(["`]) +(?=[\w!\[-])', r"\1", u); u = re.sub(r'(?<=[\w\]\)]) +(["`])', r"\1", u)
    return u

def run(root):
    for p in sorted(pathlib.Path(root).rglob("*.tsx")):
        s = p.read_text(); out = []; i = 0
        for m in re.finditer(r"className=", s):
            if m.end() < i: continue
            a = m.end(); b = unit_end(s, a)
            out.append(s[i:a]); out.append(rewrite(s[a:b])); i = b
        out.append(s[i:]); s2 = "".join(out)
        # class strings held in constants (status colour maps and the like)
        s2 = re.sub(r'(?<=: )"((?:bg|text|border)-[^"\n]*)"', lambda m: '"' + rewrite(m.group(1), loose=True) + '"', s2)
        if s2 != s: p.write_text(s2); print("rewrote", p)

if __name__ == "__main__":
    run(sys.argv[1])
