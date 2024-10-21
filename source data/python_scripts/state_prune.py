import json

def load_geojson(file_path):
    with open(file_path) as f:
        return json.load(f)

def save_geojson(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

def filter_washington_counties(geojson):
    wa_counties = [feature for feature in geojson['features'] if feature['properties']['STATEFP'] == "53"]
    return {
        "type": "FeatureCollection",
        "name": "wa_counties",
        "crs": geojson['crs'],
        "features": wa_counties
    }

# Load the counties.geojson file
counties_geojson = load_geojson("../counties.geojson")

# Filter for Washington counties only
wa_geojson = filter_washington_counties(counties_geojson)

# Save the filtered GeoJSON
save_geojson(wa_geojson, "../wa_counties.geojson")

print("GeoJSON processing complete. Washington counties saved to 'wa_counties.geojson'.")
