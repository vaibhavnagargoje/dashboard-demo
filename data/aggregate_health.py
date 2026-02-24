"""
aggregate_health.py
Reads health_extract.json and produces 4 JSON data files for the Health dashboard.
Run: python aggregate_health.py  (from project/data/ directory)
"""
import json, math, sys, os

INPUT = "health_extract.json"
with open(INPUT, "r", encoding="utf-8") as f:
    raw = json.load(f)

# ── Taluka coordinates & colors (same 14 as livestock) ──────────────────────
TALUKA_META = {
    "Akole":     {"lng": 73.9009, "lat": 19.5333, "color": "#2c699a"},
    "Sangamner": {"lng": 74.2142, "lat": 19.5687, "color": "#0b8457"},
    "Kopargaon": {"lng": 74.4787, "lat": 19.8826, "color": "#d4af37"},
    "Rahata":    {"lng": 74.4833, "lat": 19.7167, "color": "#e07b39"},
    "Shrirampur":{"lng": 74.6559, "lat": 19.6164, "color": "#8b5cf6"},
    "Newasa":    {"lng": 74.9864, "lat": 19.5566, "color": "#0891b2"},
    "Shevgaon":  {"lng": 75.0999, "lat": 19.3527, "color": "#7c3aed"},
    "Pathardi":  {"lng": 75.2068, "lat": 19.1687, "color": "#059669"},
    "Nagar":     {"lng": 74.7479, "lat": 19.0948, "color": "#3c4e6a"},
    "Rahuri":    {"lng": 74.6482, "lat": 19.3920, "color": "#10b981"},
    "Parner":    {"lng": 74.4437, "lat": 19.0000, "color": "#f59e0b"},
    "Shrigonda": {"lng": 74.6897, "lat": 18.8631, "color": "#ef4444"},
    "Karjat":    {"lng": 75.0366, "lat": 18.9077, "color": "#6366f1"},
    "Jamkhed":   {"lng": 75.3145, "lat": 18.7223, "color": "#ec4899"},
}

# Map taluka names from Excel to standard names
TALUKA_MAP = {}
for name in TALUKA_META:
    TALUKA_MAP[name.lower()] = name
# Common aliases
TALUKA_MAP["srirampur"] = "Shrirampur"
TALUKA_MAP["nevasa"] = "Newasa"
TALUKA_MAP["srigonda"] = "Shrigonda"
TALUKA_MAP["a.nagar"] = "Nagar"
TALUKA_MAP["ahilyanagar city"] = "Nagar"
TALUKA_MAP["nagar (rural)"] = "Nagar"
TALUKA_MAP["a.nagar city"] = "Nagar"
TALUKA_MAP["ahmadnagar"] = "Nagar"
TALUKA_MAP["ahmednagar"] = "Nagar"
TALUKA_MAP["nagar city"] = "Nagar"
TALUKA_MAP["nagar rural"] = "Nagar"


def norm_taluka(name):
    """Normalise a taluka name to our standard set."""
    if not name:
        return None
    n = str(name).strip().lower()
    if n in TALUKA_MAP:
        return TALUKA_MAP[n]
    # Try partial matches
    for key, val in TALUKA_MAP.items():
        if key in n or n in key:
            return val
    return None

def safe(v, default=0):
    """Safely convert to float."""
    if v is None:
        return default
    try:
        return float(v)
    except:
        return default

def fmt_int(v):
    """Format integer with commas."""
    return f"{int(v):,}"

def fmt_pct(v, decimals=1):
    return f"{v:.{decimals}f}%"

def trend_calc(old, new):
    """Calculate trend string."""
    if old == 0:
        return {"direction": "neutral", "value": "N/A", "context": ""}
    pct = ((new - old) / abs(old)) * 100
    d = "up" if pct > 0 else ("down" if pct < 0 else "neutral")
    return {"direction": d, "value": f"{pct:+.1f}%", "context": ""}


# ═══════════════════════════════════════════════════════════════════
# HELPER: Get DSA ahilyanagar data and aggregate by taluka+year
# DSA sheets have Rural/Urban split – we sum them
# ═══════════════════════════════════════════════════════════════════
def get_dsa_data(sheet_name, value_cols):
    """
    Returns dict: { taluka: { year: { col: value, ... } } }
    and district yearly totals: { year: { col: value, ... } }
    """
    sheet = raw.get(sheet_name, {})
    rows = sheet.get("ahilyanagar_data", [])
    if not rows:
        # Try with Ahmadnagar / Ahmednagar
        rows = sheet.get("ahilyanagar_data", [])
    
    taluka_data = {}  # { taluka: { year: { col: sum } } }
    district_data = {}  # { year: { col: sum } }
    
    for r in rows:
        t_raw = r.get("Taluka", "")
        t = norm_taluka(t_raw)
        if not t:
            continue
        yr_raw = r.get("Year")
        if yr_raw is None:
            continue
        try:
            yr = int(float(yr_raw))
        except:
            continue
        if yr < 2011 or yr > 2025:
            continue
        
        if t not in taluka_data:
            taluka_data[t] = {}
        if yr not in taluka_data[t]:
            taluka_data[t][yr] = {c: 0 for c in value_cols}
        if yr not in district_data:
            district_data[yr] = {c: 0 for c in value_cols}
        
        for c in value_cols:
            v = safe(r.get(c))
            taluka_data[t][yr][c] += v
            district_data[yr][c] += v
    
    return taluka_data, district_data


def get_hmis_data(sheet_name, value_cols):
    """Returns dict: { year: { col: value } } for district-level HMIS data."""
    sheet = raw.get(sheet_name, {})
    rows = sheet.get("ahilyanagar_data", [])
    result = {}
    for r in rows:
        yr_raw = r.get("Year")
        if yr_raw is None:
            continue
        try:
            yr = int(float(yr_raw))
        except:
            continue
        result[yr] = {}
        for c in value_cols:
            result[yr][c] = safe(r.get(c))
    return result


# ═══════════════════════════════════════════════════════════════════
# 1. HEALTH INFRASTRUCTURE
# ═══════════════════════════════════════════════════════════════════
print("\n=== 1. Health Infrastructure ===")

pub_cols = ["Hospitals", "Specialty Hospitals (Cancer, TB etc.)", "Clinics",
            "Maternity Wards", "Primary Health Centres", "Sub-Centres", "Doctors/Vaids"]
priv_cols = ["Hospitals", "Specialty Hospitals (Cancer, TB, etc)", "Clinics",
             "Maternity Wards", "Number of Beds"]
bed_cols = ["Number of Beds", "Women", "Children"]

pub_taluka, pub_district = get_dsa_data("DSA_PublicHospitals", pub_cols)
priv_taluka, priv_district = get_dsa_data("DSA_PrivateHealth", priv_cols)
bed_taluka, bed_district = get_dsa_data("DSA_PublicBeds", bed_cols)

# HMIS Patients
hmis_patients = get_hmis_data("HMIS_Patients", [
    "In-Patients", "Out-Patients", "Major Operations", "Minor Operations Conducted",
    "Hysterectomy Surgeries Performed"
])

# Find common years across DSA sheets
dsa_years = sorted(set(pub_district.keys()) & set(priv_district.keys()) & set(bed_district.keys()))
print(f"DSA years: {dsa_years}")
print(f"HMIS Patients years: {sorted(hmis_patients.keys())}")

# Use a consistent year range (2012-2021)
chart_years = [y for y in range(2012, 2022) if y in pub_district]
print(f"Chart years: {chart_years}")

if not chart_years:
    print("WARNING: No chart years found for infrastructure!")
    chart_years = sorted(pub_district.keys())[-10:]  # fallback

latest_yr = chart_years[-1] if chart_years else 2021
prev_yr = chart_years[-2] if len(chart_years) > 1 else latest_yr

# Compute latest year district totals
lat_pub = pub_district.get(latest_yr, {})
lat_priv = priv_district.get(latest_yr, {})
lat_beds = bed_district.get(latest_yr, {})

total_pub_hosp = int(lat_pub.get("Hospitals", 0))
total_phc = int(lat_pub.get("Primary Health Centres", 0))
total_subcentres = int(lat_pub.get("Sub-Centres", 0))
total_doctors = int(lat_pub.get("Doctors/Vaids", 0))
total_priv_hosp = int(lat_priv.get("Hospitals", 0))
total_priv_beds = int(lat_priv.get("Number of Beds", 0))
total_pub_beds = int(lat_beds.get("Number of Beds", 0))
total_beds = total_pub_beds + total_priv_beds

# Prev year for trends
prev_pub = pub_district.get(prev_yr, {})
prev_priv = priv_district.get(prev_yr, {})
prev_beds = bed_district.get(prev_yr, {})

print(f"Latest year: {latest_yr}")
print(f"Public Hospitals: {total_pub_hosp}, PHCs: {total_phc}, Sub-Centres: {total_subcentres}, Doctors: {total_doctors}")
print(f"Private Hospitals: {total_priv_hosp}, Private Beds: {total_priv_beds}")
print(f"Public Beds: {total_pub_beds}, Total Beds: {total_beds}")

infra_json = {
    "kpis": [
        {
            "label": "Public Hospitals",
            "value": fmt_int(total_pub_hosp),
            "icon": "Building2",
            "iconBg": "bg-blue-50",
            "trend": trend_calc(safe(prev_pub.get("Hospitals")), total_pub_hosp)
        },
        {
            "label": "PHCs",
            "value": fmt_int(total_phc),
            "icon": "Stethoscope",
            "iconBg": "bg-emerald-50",
            "trend": trend_calc(safe(prev_pub.get("Primary Health Centres")), total_phc)
        },
        {
            "label": "Total Beds",
            "value": fmt_int(total_beds),
            "icon": "BedDouble",
            "iconBg": "bg-amber-50",
            "trend": trend_calc(
                safe(prev_beds.get("Number of Beds")) + safe(prev_priv.get("Number of Beds")),
                total_beds
            )
        },
        {
            "label": "Doctors & Staff",
            "value": fmt_int(total_doctors),
            "icon": "UserRound",
            "iconBg": "bg-purple-50",
            "trend": trend_calc(safe(prev_pub.get("Doctors/Vaids")), total_doctors)
        }
    ],
    "chartData": [],
    "tableData": [],
    "talukas": [],
    "relatedMetrics": []
}

for yr in chart_years:
    pub = pub_district.get(yr, {})
    priv = priv_district.get(yr, {})
    beds = bed_district.get(yr, {})
    infra_json["chartData"].append({
        "year": str(yr),
        "pubHospitals": int(safe(pub.get("Hospitals"))),
        "phcs": int(safe(pub.get("Primary Health Centres"))),
        "subCentres": int(safe(pub.get("Sub-Centres"))),
        "privHospitals": int(safe(priv.get("Hospitals"))),
        "totalBeds": int(safe(beds.get("Number of Beds")) + safe(priv.get("Number of Beds"))),
        "doctors": int(safe(pub.get("Doctors/Vaids")))
    })
    infra_json["tableData"].append({
        "year": str(yr),
        "pubHospitals": fmt_int(safe(pub.get("Hospitals"))),
        "phcs": fmt_int(safe(pub.get("Primary Health Centres"))),
        "subCentres": fmt_int(safe(pub.get("Sub-Centres"))),
        "privHospitals": fmt_int(safe(priv.get("Hospitals"))),
        "totalBeds": fmt_int(safe(beds.get("Number of Beds")) + safe(priv.get("Number of Beds"))),
        "doctors": fmt_int(safe(pub.get("Doctors/Vaids")))
    })

# Talukas for latest year
for t_name, meta in TALUKA_META.items():
    pub_t = pub_taluka.get(t_name, {}).get(latest_yr, {})
    priv_t = priv_taluka.get(t_name, {}).get(latest_yr, {})
    bed_t = bed_taluka.get(t_name, {}).get(latest_yr, {})
    infra_json["talukas"].append({
        "name": t_name,
        "lng": meta["lng"],
        "lat": meta["lat"],
        "color": meta["color"],
        "pubHospitals": int(safe(pub_t.get("Hospitals"))),
        "phcs": int(safe(pub_t.get("Primary Health Centres"))),
        "subCentres": int(safe(pub_t.get("Sub-Centres"))),
        "privHospitals": int(safe(priv_t.get("Hospitals"))),
        "beds": int(safe(bed_t.get("Number of Beds")) + safe(priv_t.get("Number of Beds"))),
        "doctors": int(safe(pub_t.get("Doctors/Vaids")))
    })

# Related Metrics: HMIS Patients data
patient_data = []
for yr in sorted(hmis_patients.keys()):
    d = hmis_patients[yr]
    patient_data.append({"label": str(yr), "value": int(safe(d.get("Out-Patients")) / 1000)})
infra_json["relatedMetrics"] = [
    {
        "title": "Out-Patients (K)",
        "subtitle": "District yearly out-patient visits",
        "icon": "Users",
        "chartType": "area",
        "data": patient_data[-6:]
    },
    {
        "title": "Public vs Private Beds",
        "subtitle": f"Bed distribution ({latest_yr})",
        "icon": "BedDouble",
        "chartType": "donut",
        "data": [
            {"label": "Public", "value": total_pub_beds},
            {"label": "Private", "value": total_priv_beds}
        ]
    },
    {
        "title": "Surgeries (HMIS)",
        "subtitle": "Major operations per year",
        "icon": "Scissors",
        "chartType": "bar",
        "data": [{"label": str(yr), "value": int(safe(hmis_patients.get(yr, {}).get("Major Operations")))} for yr in sorted(hmis_patients.keys())][-6:]
    }
]

with open("health-infrastructure.json", "w", encoding="utf-8") as f:
    json.dump(infra_json, f, indent=2)
print(f"Wrote health-infrastructure.json ({len(infra_json['chartData'])} years, {len(infra_json['talukas'])} talukas)")


# ═══════════════════════════════════════════════════════════════════
# 2. IMMUNIZATION
# ═══════════════════════════════════════════════════════════════════
print("\n=== 2. Immunization ===")

vacc_cols = ["DPT", "Polio", "BCG", "Measles", "Tetanus Pregnant Women", "Pentavalent-3"]
vacc_taluka, vacc_district = get_dsa_data("DSA_Vaccines", vacc_cols)

hmis_infant_vacc = get_hmis_data("HMIS_InfantVaccinations", [
    "Oral Polio Vaccine", "Bacillus Calmette Guerin (BCG)", "Pentavalent-3",
    "Measles Rubella", "Fully Immunized Children", "Rotavirus (1st Dose)"
])

vacc_years = sorted([y for y in vacc_district.keys() if 2012 <= y <= 2021])
print(f"Vaccine DSA years: {vacc_years}")

lat_vacc = vacc_district.get(vacc_years[-1], {}) if vacc_years else {}
prev_vacc = vacc_district.get(vacc_years[-2], {}) if len(vacc_years) > 1 else {}

total_dpt = int(safe(lat_vacc.get("DPT")))
total_polio = int(safe(lat_vacc.get("Polio")))
total_bcg = int(safe(lat_vacc.get("BCG")))
total_measles = int(safe(lat_vacc.get("Measles")))

print(f"Latest: DPT={total_dpt}, Polio={total_polio}, BCG={total_bcg}, Measles={total_measles}")

imm_json = {
    "kpis": [
        {
            "label": "DPT Vaccinations",
            "value": fmt_int(total_dpt),
            "icon": "Syringe",
            "iconBg": "bg-blue-50",
            "trend": trend_calc(safe(prev_vacc.get("DPT")), total_dpt)
        },
        {
            "label": "Polio Doses",
            "value": fmt_int(total_polio),
            "icon": "ShieldCheck",
            "iconBg": "bg-emerald-50",
            "trend": trend_calc(safe(prev_vacc.get("Polio")), total_polio)
        },
        {
            "label": "BCG Coverage",
            "value": fmt_int(total_bcg),
            "icon": "ShieldPlus",
            "iconBg": "bg-amber-50",
            "trend": trend_calc(safe(prev_vacc.get("BCG")), total_bcg)
        },
        {
            "label": "Measles Vaccines",
            "value": fmt_int(total_measles),
            "icon": "HeartPulse",
            "iconBg": "bg-purple-50",
            "trend": trend_calc(safe(prev_vacc.get("Measles")), total_measles)
        }
    ],
    "chartData": [],
    "tableData": [],
    "talukas": [],
    "relatedMetrics": []
}

for yr in vacc_years:
    d = vacc_district[yr]
    imm_json["chartData"].append({
        "year": str(yr),
        "dpt": int(safe(d.get("DPT"))),
        "polio": int(safe(d.get("Polio"))),
        "bcg": int(safe(d.get("BCG"))),
        "measles": int(safe(d.get("Measles")))
    })
    imm_json["tableData"].append({
        "year": str(yr),
        "dpt": fmt_int(safe(d.get("DPT"))),
        "polio": fmt_int(safe(d.get("Polio"))),
        "bcg": fmt_int(safe(d.get("BCG"))),
        "measles": fmt_int(safe(d.get("Measles"))),
        "tetanus": fmt_int(safe(d.get("Tetanus Pregnant Women")))
    })

# Talukas
vl = vacc_years[-1] if vacc_years else 2021
for t_name, meta in TALUKA_META.items():
    tv = vacc_taluka.get(t_name, {}).get(vl, {})
    infra_t = pub_taluka.get(t_name, {}).get(latest_yr, {})
    imm_json["talukas"].append({
        "name": t_name,
        "lng": meta["lng"],
        "lat": meta["lat"],
        "color": meta["color"],
        "dpt": int(safe(tv.get("DPT"))),
        "polio": int(safe(tv.get("Polio"))),
        "bcg": int(safe(tv.get("BCG"))),
        "measles": int(safe(tv.get("Measles")))
    })

# Related: HMIS Infant Vaccinations, NFHS snapshots
hmis_iv_data = []
for yr in sorted(hmis_infant_vacc.keys()):
    d = hmis_infant_vacc[yr]
    hmis_iv_data.append({"label": str(yr), "value": int(safe(d.get("Fully Immunized Children")) / 1000)})
imm_json["relatedMetrics"] = [
    {
        "title": "Fully Immunized (K)",
        "subtitle": "District-level fully immunized children",
        "icon": "ShieldCheck",
        "chartType": "area",
        "data": hmis_iv_data[-6:]
    },
    {
        "title": f"Vaccine Mix ({vl})",
        "subtitle": "Distribution of key vaccines",
        "icon": "Syringe",
        "chartType": "donut",
        "data": [
            {"label": "DPT", "value": total_dpt},
            {"label": "Polio", "value": total_polio},
            {"label": "BCG", "value": total_bcg},
            {"label": "Measles", "value": total_measles}
        ]
    },
    {
        "title": "Tetanus (Pregnant)",
        "subtitle": "Tetanus vaccines for pregnant women",
        "icon": "Baby",
        "chartType": "bar",
        "data": [{"label": str(yr), "value": int(safe(vacc_district.get(yr, {}).get("Tetanus Pregnant Women")))} for yr in vacc_years][-6:]
    }
]

with open("health-immunization.json", "w", encoding="utf-8") as f:
    json.dump(imm_json, f, indent=2)
print(f"Wrote health-immunization.json ({len(imm_json['chartData'])} years, {len(imm_json['talukas'])} talukas)")


# ═══════════════════════════════════════════════════════════════════
# 3. MATERNAL & CHILD HEALTH
# ═══════════════════════════════════════════════════════════════════
print("\n=== 3. Maternal & Child Health ===")

birth_cols = ["Boys", "Girls", "Total"]
birth_taluka, birth_district = get_dsa_data("DSA_RegisteredBirths", birth_cols)

death_cols = ["Total", "Children", "Infants (0-1 Years)"]
death_taluka, death_district = get_dsa_data("DSA_ReportedDeaths", death_cols)

hmis_deliv = get_hmis_data("HMIS_Deliveries", [
    "Home Deliveries", "Public Institutions", "Private Institutions",
    "Institutional Deliveries", "Reported Live Births", "Reported Still Births",
    "Maternal Deaths"
])

hmis_anc = get_hmis_data("HMIS_AntenatalCare", [
    "Registered for Antenatal Care", "Registrations within First Trimester",
    "% of Antenatal Care Registrations Done in First Trimester"
])

hmis_sex = get_hmis_data("HMIS_SexRatio", ["Sex Ratio At Birth"])
hmis_csec = get_hmis_data("HMIS_CSection", [
    "Public Facilities", "Private Facilities",
    "C-Section Deliveries as a share of Reported Institutional Deliveries"
])
hmis_inf_death = get_hmis_data("HMIS_InfantDeaths", ["Infant Deaths Reported"])

birth_years = sorted([y for y in birth_district.keys() if 2012 <= y <= 2021])
print(f"Birth DSA years: {birth_years}")

lat_b = birth_district.get(birth_years[-1], {}) if birth_years else {}
prev_b = birth_district.get(birth_years[-2], {}) if len(birth_years) > 1 else {}

total_births = int(safe(lat_b.get("Total")))
total_boys = int(safe(lat_b.get("Boys")))
total_girls = int(safe(lat_b.get("Girls")))
sex_ratio = round(total_girls / total_boys * 1000, 0) if total_boys > 0 else 0

# HMIS data for latest available year
hmis_latest = max(hmis_deliv.keys()) if hmis_deliv else 2019
hd = hmis_deliv.get(hmis_latest, {})
inst_deliv = int(safe(hd.get("Institutional Deliveries")))
live_births_hmis = int(safe(hd.get("Reported Live Births")))
maternal_deaths = int(safe(hd.get("Maternal Deaths")))
anc_pct = safe(hmis_anc.get(hmis_latest, {}).get("% of Antenatal Care Registrations Done in First Trimester"))
csec_rate = safe(hmis_csec.get(hmis_latest, {}).get("C-Section Deliveries as a share of Reported Institutional Deliveries"))
sex_ratio_hmis = int(safe(hmis_sex.get(hmis_latest, {}).get("Sex Ratio At Birth")))

print(f"Births ({birth_years[-1]}): Total={total_births}, Boys={total_boys}, Girls={total_girls}, Ratio={sex_ratio}")
print(f"HMIS ({hmis_latest}): InstDeliv={inst_deliv}, LiveBirths={live_births_hmis}, MaternalDeaths={maternal_deaths}")
print(f"ANC%={anc_pct}, C-Sec%={csec_rate}, SexRatio={sex_ratio_hmis}")

mch_json = {
    "kpis": [
        {
            "label": "Registered Births",
            "value": fmt_int(total_births),
            "icon": "Baby",
            "iconBg": "bg-pink-50",
            "trend": trend_calc(safe(prev_b.get("Total")), total_births)
        },
        {
            "label": "Institutional Deliveries",
            "value": fmt_int(inst_deliv),
            "icon": "Building2",
            "iconBg": "bg-blue-50",
            "trend": {"direction": "neutral", "value": f"HMIS {hmis_latest}", "context": ""}
        },
        {
            "label": "ANC 1st Trimester",
            "value": fmt_pct(anc_pct),
            "icon": "HeartPulse",
            "iconBg": "bg-emerald-50",
            "trend": {"direction": "up" if anc_pct > 75 else "neutral", "value": f"{anc_pct:.1f}%", "context": f"of registrations ({hmis_latest})"}
        },
        {
            "label": "Sex Ratio at Birth",
            "value": str(sex_ratio_hmis),
            "icon": "Users",
            "iconBg": "bg-amber-50",
            "trend": {"direction": "up" if sex_ratio_hmis > 920 else "down", "value": f"HMIS {hmis_latest}", "context": "girls per 1000 boys"}
        }
    ],
    "chartData": [],
    "tableData": [],
    "talukas": [],
    "relatedMetrics": []
}

# Chart: DSA Registered Births (taluka totals by year)
for yr in birth_years:
    bd = birth_district.get(yr, {})
    dd = death_district.get(yr, {})
    mch_json["chartData"].append({
        "year": str(yr),
        "totalBirths": int(safe(bd.get("Total"))),
        "boys": int(safe(bd.get("Boys"))),
        "girls": int(safe(bd.get("Girls"))),
        "deaths": int(safe(dd.get("Total"))),
        "infantDeaths": int(safe(dd.get("Infants (0-1 Years)")))
    })
    sr = round(safe(bd.get("Girls")) / safe(bd.get("Boys")) * 1000, 0) if safe(bd.get("Boys")) > 0 else 0
    mch_json["tableData"].append({
        "year": str(yr),
        "totalBirths": fmt_int(safe(bd.get("Total"))),
        "boys": fmt_int(safe(bd.get("Boys"))),
        "girls": fmt_int(safe(bd.get("Girls"))),
        "sexRatio": str(int(sr)),
        "deaths": fmt_int(safe(dd.get("Total"))),
        "infantDeaths": fmt_int(safe(dd.get("Infants (0-1 Years)")))
    })

# Talukas
bl = birth_years[-1] if birth_years else 2021
for t_name, meta in TALUKA_META.items():
    tb = birth_taluka.get(t_name, {}).get(bl, {})
    td = death_taluka.get(t_name, {}).get(bl, {})
    mch_json["talukas"].append({
        "name": t_name,
        "lng": meta["lng"],
        "lat": meta["lat"],
        "color": meta["color"],
        "totalBirths": int(safe(tb.get("Total"))),
        "boys": int(safe(tb.get("Boys"))),
        "girls": int(safe(tb.get("Girls"))),
        "deaths": int(safe(td.get("Total"))),
        "infantDeaths": int(safe(td.get("Infants (0-1 Years)")))
    })

# Related Metrics
delivery_data = []
for yr in sorted(hmis_deliv.keys()):
    d = hmis_deliv[yr]
    delivery_data.append({"label": str(yr), "value": int(safe(d.get("Institutional Deliveries")) / 1000)})

csec_data = []
for yr in sorted(hmis_csec.keys()):
    d = hmis_csec[yr]
    csec_data.append({"label": str(yr), "value": round(safe(d.get("C-Section Deliveries as a share of Reported Institutional Deliveries")), 1)})

mch_json["relatedMetrics"] = [
    {
        "title": "Institutional Deliveries (K)",
        "subtitle": "HMIS district data",
        "icon": "Building2",
        "chartType": "area",
        "data": delivery_data[-6:]
    },
    {
        "title": f"Birth Gender Split ({bl})",
        "subtitle": "Boys vs Girls registered",
        "icon": "Baby",
        "chartType": "donut",
        "data": [
            {"label": "Boys", "value": total_boys},
            {"label": "Girls", "value": total_girls}
        ]
    },
    {
        "title": "C-Section Rate %",
        "subtitle": "Share of institutional deliveries",
        "icon": "Scissors",
        "chartType": "bar",
        "data": csec_data[-6:]
    }
]

with open("health-maternal-child.json", "w", encoding="utf-8") as f:
    json.dump(mch_json, f, indent=2)
print(f"Wrote health-maternal-child.json ({len(mch_json['chartData'])} years, {len(mch_json['talukas'])} talukas)")


# ═══════════════════════════════════════════════════════════════════
# 4. NUTRITION & ANGANWADIS
# ═══════════════════════════════════════════════════════════════════
print("\n=== 4. Nutrition & Anganwadis ===")

mal_cols = ["Infants with Normal Weight", "Infants with Moderate Acute Malnutrition",
            "Infants with Severe Acute Malnutrition"]
mal_taluka, mal_district = get_dsa_data("DSA_Malnutrition", mal_cols)

ang_cols = ["Approved Anganwadi", "Working Anganwadi", "Anganwadi Workers",
            "Self-Owned Buildings", "Anganwadis with Toilets"]
ang_taluka, ang_district = get_dsa_data("DSA_Anganwadis", ang_cols)

hmis_anaemia = get_hmis_data("HMIS_Anaemia", [
    "Moderately Anaemic Women",
    "Women Having Tested With Severe Anemia and Are Being Treated at an Institution"
])

hmis_child_disease = get_hmis_data("HMIS_ChildDisease", [
    "Pneumonia", "Diarrhea", "Sepsis", "Tuberculosis (Tb)", "Malaria", "Measles"
])

# For DSA_Malnutrition, values are percentages (not counts) from Rural/Urban rows
# We need to average them, not sum. Let me recompute averaging:
# Actually looking at the data: Normal=81.45%, MAM=15.42%, SAM=3.13% for a single Rural row
# When we sum Rural+Urban these percentages get doubled. We need to average.
# Let me re-aggregate properly for percentage data:

def get_dsa_data_avg(sheet_name, value_cols):
    """For percentage data: average Rural+Urban instead of summing."""
    sheet = raw.get(sheet_name, {})
    rows = sheet.get("ahilyanagar_data", [])
    
    taluka_data = {}  # { taluka: { year: { col: [values] } } }
    
    for r in rows:
        t = norm_taluka(r.get("Taluka", ""))
        if not t:
            continue
        try:
            yr = int(float(r.get("Year", 0)))
        except:
            continue
        if yr < 2011 or yr > 2025:
            continue
        
        if t not in taluka_data:
            taluka_data[t] = {}
        if yr not in taluka_data[t]:
            taluka_data[t][yr] = {c: [] for c in value_cols}
        
        for c in value_cols:
            v = r.get(c)
            if v is not None:
                try:
                    taluka_data[t][yr][c].append(float(v))
                except:
                    pass
    
    # Average the lists
    result_taluka = {}
    district_yearly = {}
    
    for t, years in taluka_data.items():
        result_taluka[t] = {}
        for yr, cols in years.items():
            result_taluka[t][yr] = {}
            for c, vals in cols.items():
                result_taluka[t][yr][c] = sum(vals) / len(vals) if vals else 0
    
    # District average = average across all talukas for each year
    all_years = set()
    for t in result_taluka.values():
        all_years.update(t.keys())
    
    for yr in all_years:
        district_yearly[yr] = {}
        for c in value_cols:
            vals = [result_taluka[t][yr][c] for t in result_taluka if yr in result_taluka[t] and result_taluka[t][yr].get(c, 0) > 0]
            district_yearly[yr][c] = sum(vals) / len(vals) if vals else 0
    
    return result_taluka, district_yearly

mal_taluka_avg, mal_district_avg = get_dsa_data_avg("DSA_Malnutrition", mal_cols)

mal_years = sorted([y for y in mal_district_avg.keys() if 2012 <= y <= 2021])
ang_years = sorted([y for y in ang_district.keys() if 2012 <= y <= 2021])
common_years = sorted(set(mal_years) & set(ang_years))
print(f"Malnutrition years: {mal_years}")
print(f"Anganwadi years: {ang_years}")
print(f"Common years: {common_years}")

if not common_years:
    common_years = mal_years or ang_years
    
nut_latest = common_years[-1] if common_years else 2021
nut_prev = common_years[-2] if len(common_years) > 1 else nut_latest

lat_mal = mal_district_avg.get(nut_latest, {})
lat_ang = ang_district.get(nut_latest, {})
prev_mal = mal_district_avg.get(nut_prev, {})
prev_ang = ang_district.get(nut_prev, {})

normal_pct = round(safe(lat_mal.get("Infants with Normal Weight")), 1)
mam_pct = round(safe(lat_mal.get("Infants with Moderate Acute Malnutrition")), 1)
sam_pct = round(safe(lat_mal.get("Infants with Severe Acute Malnutrition")), 1)
working_aw = int(safe(lat_ang.get("Working Anganwadi")))
approved_aw = int(safe(lat_ang.get("Approved Anganwadi")))
aw_workers = int(safe(lat_ang.get("Anganwadi Workers")))

print(f"Nutrition ({nut_latest}): Normal={normal_pct}%, MAM={mam_pct}%, SAM={sam_pct}%")
print(f"Anganwadis: Working={working_aw}, Approved={approved_aw}, Workers={aw_workers}")

nut_json = {
    "kpis": [
        {
            "label": "Normal Weight",
            "value": fmt_pct(normal_pct),
            "icon": "HeartPulse",
            "iconBg": "bg-emerald-50",
            "trend": trend_calc(safe(prev_mal.get("Infants with Normal Weight")), normal_pct)
        },
        {
            "label": "MAM Rate",
            "value": fmt_pct(mam_pct),
            "icon": "AlertTriangle",
            "iconBg": "bg-amber-50",
            "trend": trend_calc(safe(prev_mal.get("Infants with Moderate Acute Malnutrition")), mam_pct)
        },
        {
            "label": "SAM Rate",
            "value": fmt_pct(sam_pct),
            "icon": "AlertCircle",
            "iconBg": "bg-red-50",
            "trend": trend_calc(safe(prev_mal.get("Infants with Severe Acute Malnutrition")), sam_pct)
        },
        {
            "label": "Anganwadis Working",
            "value": fmt_int(working_aw),
            "icon": "Home",
            "iconBg": "bg-blue-50",
            "trend": trend_calc(safe(prev_ang.get("Working Anganwadi")), working_aw)
        }
    ],
    "chartData": [],
    "tableData": [],
    "talukas": [],
    "relatedMetrics": []
}

for yr in common_years:
    md = mal_district_avg.get(yr, {})
    ad = ang_district.get(yr, {})
    nut_json["chartData"].append({
        "year": str(yr),
        "normalPct": round(safe(md.get("Infants with Normal Weight")), 1),
        "mamPct": round(safe(md.get("Infants with Moderate Acute Malnutrition")), 1),
        "samPct": round(safe(md.get("Infants with Severe Acute Malnutrition")), 1),
        "workingAW": int(safe(ad.get("Working Anganwadi")))
    })
    nut_json["tableData"].append({
        "year": str(yr),
        "normalPct": fmt_pct(safe(md.get("Infants with Normal Weight")), 1),
        "mamPct": fmt_pct(safe(md.get("Infants with Moderate Acute Malnutrition")), 1),
        "samPct": fmt_pct(safe(md.get("Infants with Severe Acute Malnutrition")), 1),
        "approvedAW": fmt_int(safe(ad.get("Approved Anganwadi"))),
        "workingAW": fmt_int(safe(ad.get("Working Anganwadi"))),
        "awWorkers": fmt_int(safe(ad.get("Anganwadi Workers")))
    })

# Talukas
for t_name, meta in TALUKA_META.items():
    tm = mal_taluka_avg.get(t_name, {}).get(nut_latest, {})
    ta = ang_taluka.get(t_name, {}).get(nut_latest, {})
    nut_json["talukas"].append({
        "name": t_name,
        "lng": meta["lng"],
        "lat": meta["lat"],
        "color": meta["color"],
        "normalPct": round(safe(tm.get("Infants with Normal Weight")), 1),
        "mamPct": round(safe(tm.get("Infants with Moderate Acute Malnutrition")), 1),
        "samPct": round(safe(tm.get("Infants with Severe Acute Malnutrition")), 1),
        "workingAW": int(safe(ta.get("Working Anganwadi"))),
        "awWorkers": int(safe(ta.get("Anganwadi Workers")))
    })

# Related metrics from HMIS
anaemia_data = []
for yr in sorted(hmis_anaemia.keys()):
    d = hmis_anaemia[yr]
    anaemia_data.append({"label": str(yr), "value": int(safe(d.get("Moderately Anaemic Women")) / 1000)})

child_disease_data = []
if hmis_child_disease:
    last_cd_yr = max(hmis_child_disease.keys())
    cd = hmis_child_disease[last_cd_yr]
    for disease in ["Pneumonia", "Diarrhea", "Sepsis"]:
        child_disease_data.append({"label": disease, "value": int(safe(cd.get(disease)))})

nut_json["relatedMetrics"] = [
    {
        "title": "Anaemic Women (K)",
        "subtitle": "HMIS: Moderately anaemic women",
        "icon": "Droplets",
        "chartType": "area",
        "data": anaemia_data[-6:]
    },
    {
        "title": f"Malnutrition Split ({nut_latest})",
        "subtitle": "Normal / MAM / SAM distribution",
        "icon": "PieChart",
        "chartType": "donut",
        "data": [
            {"label": "Normal", "value": round(normal_pct)},
            {"label": "MAM", "value": round(mam_pct)},
            {"label": "SAM", "value": round(sam_pct)}
        ]
    },
    {
        "title": "Child Diseases",
        "subtitle": f"Cases reported ({last_cd_yr if hmis_child_disease else 'N/A'})",
        "icon": "Thermometer",
        "chartType": "bar",
        "data": child_disease_data if child_disease_data else [{"label": "N/A", "value": 0}]
    }
]

with open("health-nutrition.json", "w", encoding="utf-8") as f:
    json.dump(nut_json, f, indent=2)
print(f"Wrote health-nutrition.json ({len(nut_json['chartData'])} years, {len(nut_json['talukas'])} talukas)")


# ═══════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("All 4 health data files generated:")
print("  1. health-infrastructure.json")
print("  2. health-immunization.json")
print("  3. health-maternal-child.json")
print("  4. health-nutrition.json")
print("="*60)
