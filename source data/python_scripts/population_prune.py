import json

def load_json(file_path):
    with open(file_path) as f:
        return json.load(f)

def save_json(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

def prune_and_aggregate(data):
    wa_state_fips = "53"
    pruned_data = [entry for entry in data if entry['us_state_fips'] == wa_state_fips]
    
    state_population = {}
    state_info = {}
    
    for entry in data:
        state_fips = entry['us_state_fips']
        population = int(entry['population'])
        
        if state_fips in state_population:
            state_population[state_fips] += population
        else:
            state_population[state_fips] = population
            state_info[state_fips] = entry  # Store one example entry for region and subregion data
    
    state_entries = [
        {
            "us_state_fips": state_fips,
            "us_county_fips": state_fips + "000",
            "population": str(population),
            "region": state_info[state_fips]['region'],
            "subregion": "State Total"
        }
        for state_fips, population in state_population.items()
    ]
    
    pruned_data.extend(state_entries)
    return pruned_data

# Load the population data
data = load_json('populationWithFIPS.json')

# Prune and aggregate the data
pruned_data = prune_and_aggregate(data)

# Save the pruned and aggregated data
save_json(pruned_data, 'pruned_populationWithFIPS.json')

print("Processing complete. Pruned and aggregated data saved to 'pruned_populationWithFIPS.json'.")
