import sys
import collections
import json

def parse_line(line):
    parts = line.split('\t')
    if len(parts) < 11:
        return None
    
    brand = parts[0].strip()
    series = parts[1].strip()
    model = parts[2].strip()
    type_laptop = parts[3].strip()
    screen = parts[4].strip()
    cpu = parts[5].strip()
    ram = parts[6].strip()
    storage = parts[7].strip()
    gpu = parts[8].strip()
    year = parts[9].strip()
    notes = parts[10].strip()
    
    return {
        "brand": brand,
        "series": series,
        "model": model,
        "type": type_laptop,
        "screen": screen,
        "cpu": cpu,
        "ram": ram,
        "storage": storage,
        "gpu": gpu,
        "year": year,
        "notes": notes
    }

def main():
    db = collections.defaultdict(lambda: collections.defaultdict(list))
    
    # Read the text block from stdin or a file
    # For now, I'll assume the script is run with the text as a file.
    with open('laptop_data_raw.txt', 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip() or line.startswith('יצרן'):
                continue
            item = parse_line(line)
            if item:
                db[item['brand']][item['series']].append(item)
    
    # Generate the TS output
    print("// ============================================================")
    print("// 2025/2026 Laptop Models Update (300 Units)")
    print("// ============================================================")
    print('import { ComputerModelFamily } from "./computer-data";')
    print("")
    print('export const NEW_LAPTOPS_2025_DATABASE: Record<string, ComputerModelFamily[]> = {')
    
    brand_keys = sorted(db.keys())
    for i, brand in enumerate(brand_keys):
        print(f'    "{brand}": [')
        
        series_keys = sorted(db[brand].keys())
        for j, series in enumerate(series_keys):
            print('        {')
            print(f'            "name": "{series}", "type": "laptop", "subModels": [')
            
            submodels = db[brand][series]
            for k, sm in enumerate(submodels):
                sm_json = {
                    "name": sm['model'],
                    "screenSize": [sm['screen']],
                    "cpu": [sm['cpu']],
                    "ram": [sm['ram']],
                    "storage": [sm['storage']],
                    "gpu": [sm['gpu']],
                    "release_year": sm['year'],
                    "notes": sm['notes']
                }
                comma = "," if k < len(submodels)-1 else ""
                print(f'                {json.dumps(sm_json, ensure_ascii=False)}{comma}')
            
            comma_series = "," if j < len(series_keys)-1 else ""
            print(f'            ]{comma_series}')
            print('        }' + comma_series)
            
        comma_brand = "," if i < len(brand_keys)-1 else ""
        print('    ]' + comma_brand)
        
    print('};')

if __name__ == "__main__":
    main()
