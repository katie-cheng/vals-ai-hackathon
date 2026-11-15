import re,sys,pathlib
root=pathlib.Path(sys.argv[1])
for p in root.rglob('*.tsx'):
    s=p.read_text()
    s=re.sub(r'^((?:export )?(?:default )?(?:async )?function \w+\(\{[^\n]*\})\) \{$',r'\1: any) {',s,flags=re.M)
    s=s.replace('React.useState()','React.useState<any>()').replace('new Promise((','new Promise<any>((')
    s=re.sub(r'const (\w+) = \{\};',r'const \1: any = {};',s)
    s=s.replace('Array.from(x).entries()','Array.from<any>(x).entries()')
    if p.name=='store.tsx': s=s.replace('options = {},','options: any = {},').replace('m = {}) =>','m: any = {}) =>')
    s=s.replace('Array.from(new Set(','Array.from(new Set<any>(').replace('React.useState({})','React.useState<any>({})')
    p.write_text(s)
