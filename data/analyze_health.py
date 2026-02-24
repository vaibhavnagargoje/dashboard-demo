import json

with open('health_extract.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for name, info in d.items():
    print(f"Sheet: {name}")
    print(f"  Rows: {info['row_count']}  Ahilyanagar: {info['ahilyanagar_count']}")
    print(f"  Headers: {info['headers']}")
    if info.get('district_columns'):
        for col_name, vals in info['district_columns'].items():
            print(f"  DistCol '{col_name}': {vals[:8]}")
    if info.get('year_range'):
        print(f"  Years: {info['year_range']}")
    if info['ahilyanagar_count'] > 0:
        row = info['ahilyanagar_data'][0]
        print(f"  Sample row: {row}")
    elif info.get('sample_all'):
        print(f"  Sample (all): {info['sample_all'][0]}")
    print()
