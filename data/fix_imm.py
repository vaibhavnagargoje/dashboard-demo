import json

with open('health-immunization.json','r') as f:
    imm = json.load(f)

with open('health_extract.json','r',encoding='utf-8') as f:
    raw = json.load(f)

rows = raw['DSA_Vaccines']['ahilyanagar_data']
yrs = {}
for r in rows:
    yr = int(r.get('Year',0))
    if yr < 2012 or yr > 2021: continue
    if yr not in yrs:
        yrs[yr] = {'DPT':0,'Polio':0,'BCG':0,'Measles':0,'Penta':0,'TetPW':0}
    for k in ['DPT','Polio','BCG','Measles']:
        v = r.get(k)
        if v: yrs[yr][k] += float(v)
    v = r.get('Pentavalent-3')
    if v: yrs[yr]['Penta'] += float(v)
    v = r.get('Tetanus Pregnant Women')
    if v: yrs[yr]['TetPW'] += float(v)

for yr in yrs:
    yrs[yr]['dptPenta'] = max(yrs[yr]['DPT'], yrs[yr]['Penta'])

latest = 2021
prev = 2020

def fi(v):
    return "{:,}".format(int(v))

# Fix KPIs
imm['kpis'][0]['label'] = 'DPT / Pentavalent'
imm['kpis'][0]['value'] = fi(yrs[latest]['dptPenta'])
pct = ((yrs[latest]['dptPenta'] - yrs[prev]['dptPenta']) / yrs[prev]['dptPenta'] * 100) if yrs[prev]['dptPenta'] > 0 else 0
imm['kpis'][0]['trend'] = {'direction': 'up' if pct > 0 else 'down', 'value': "{:+.1f}%".format(pct), 'context': ''}

# Fix chart/table
imm['chartData'] = []
imm['tableData'] = []
for yr in sorted(yrs.keys()):
    d = yrs[yr]
    imm['chartData'].append({
        'year': str(yr),
        'dptPenta': int(d['dptPenta']),
        'polio': int(d['Polio']),
        'bcg': int(d['BCG']),
        'measles': int(d['Measles'])
    })
    imm['tableData'].append({
        'year': str(yr),
        'dptPenta': fi(d['dptPenta']),
        'polio': fi(d['Polio']),
        'bcg': fi(d['BCG']),
        'measles': fi(d['Measles']),
        'tetanus': fi(d['TetPW'])
    })

# Fix donut
imm['relatedMetrics'][1]['data'] = [
    {'label': 'DPT/Penta', 'value': int(yrs[latest]['dptPenta'])},
    {'label': 'Polio', 'value': int(yrs[latest]['Polio'])},
    {'label': 'BCG', 'value': int(yrs[latest]['BCG'])},
    {'label': 'Measles', 'value': int(yrs[latest]['Measles'])}
]

# Fix talukas
taluka_data = {}
for r in rows:
    t = r.get('Taluka','')
    yr = int(r.get('Year',0))
    if yr != 2021: continue
    if t not in taluka_data:
        taluka_data[t] = {'DPT':0,'Polio':0,'BCG':0,'Measles':0,'Penta':0}
    for k in ['DPT','Polio','BCG','Measles']:
        v = r.get(k)
        if v: taluka_data[t][k] += float(v)
    v = r.get('Pentavalent-3')
    if v: taluka_data[t]['Penta'] += float(v)

for taluka in imm['talukas']:
    tn = taluka['name']
    td = None
    for k,v in taluka_data.items():
        if k.lower() == tn.lower() or k.lower().startswith(tn.lower()[:4]):
            td = v
            break
    if td:
        taluka['dptPenta'] = int(max(td['DPT'], td['Penta']))
    else:
        taluka['dptPenta'] = taluka.get('dpt', 0)
    if 'dpt' in taluka:
        del taluka['dpt']

with open('health-immunization.json','w',encoding='utf-8') as f:
    json.dump(imm, f, indent=2)
print("Fixed immunization JSON")
print("Latest DPT/Penta:", fi(yrs[latest]['dptPenta']))
print("Latest Polio:", fi(yrs[latest]['Polio']))
