# https://simplemaps.com/data/world-cities
import json
import pandas as pd
import re

# Load the cities data from the worldcities.csv file
cities_data = pd.read_csv('../worldcities.csv')

# Filter the necessary columns for latitude, longitude, and the city name
cities_data = cities_data[['city', 'lat', 'lng', 'population']]

# Function to clean the city names by removing non-alphanumeric characters and slashes
def clean_city_name(name):
    # Remove anything that is not a letter, number, or space, and explicitly remove slashes
    return re.sub(r'[^a-zA-Z0-9 ]+', '', name.replace('/', '').replace('\\', ''))

# Sort cities by population in descending order, handling NaN values appropriately
cities_data = cities_data.dropna(subset=['population'])
cities_data = cities_data.sort_values(by='population', ascending=False)

# Creating an array for each city with the required format
formatted_data = []
for _, row in cities_data.iterrows():
    # Ensure all numbers are floats and the city name remains a string, cleaned.
    latitude = float(row['lat'])
    longitude = float(row['lng'])
    population = float(row['population'])  
    formatted_data.append({
        "name": clean_city_name(row['city']),
        "latitude": latitude,
        "longitude": longitude,
        "population": population
    })

result_json = formatted_data

with open('../cityPop.json', 'w') as json_file:
    json.dump(result_json, json_file, indent=4)

"JSON file has been created and sorted by population size and saved at 'cityPop.json'."
