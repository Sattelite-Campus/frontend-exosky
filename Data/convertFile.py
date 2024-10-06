import pandas as pd
import json

# Define the file path
file_path = 'Data/planet_data2.csv'

# Read the CSV file, skipping the initial comment lines (start after line 6)
data = pd.read_csv(file_path, comment='#')

# Extract the relevant columns
planet_name = data['pl_name']
planet_mass = data['pl_masse']
equilibrium_temp = data['pl_eqt']
orbital_inclination = data['pl_orbincl']
stellar_temp = data['st_teff']
stellar_luminosity = data['st_lum']
stellar_rotation_velocity = data['st_vsin']
right_ascension = data['ra']
declination = data['dec']
distance = data['sy_dist']
magnitude_b = data['sy_bmag']
magnitude_v = data['sy_vmag']

planet_list = []

current_planet = {}

for i in range(len(planet_name)):
    if pd.isnull(right_ascension[i]) or pd.isnull(declination[i]) or pd.isnull(distance[i]):
        continue

    if i == 0 or planet_name[i] != planet_name[i - 1]:
        # If a new planet name appears, add the previous planet to the list
        if current_planet:
            planet_list.append(current_planet)
        # Initialize a new dictionary for the current planet
        current_planet = {
            'pl_name': planet_name[i],
            'pl_mass': None,
            'eq_temp': None,
            'inclination': None,
            'st_temp': None,
            'st_lum': None,
            'st_vel': None,
            'ra': right_ascension[i],
            'dec': declination[i],
            'dist': distance[i],
            'mag_b': None,
            'mag_v': None
        }

    # Fill in the data if not null
    if not pd.isnull(planet_mass[i]):
        current_planet['pl_mass'] = planet_mass[i]
    if not pd.isnull(equilibrium_temp[i]):
        current_planet['eq_temp'] = equilibrium_temp[i]
    if not pd.isnull(orbital_inclination[i]):
        current_planet['inclination'] = orbital_inclination[i]
    if not pd.isnull(stellar_temp[i]):
        current_planet['st_temp'] = stellar_temp[i]
    if not pd.isnull(stellar_luminosity[i]):
        current_planet['st_lum'] = stellar_luminosity[i]
    if not pd.isnull(stellar_rotation_velocity[i]):
        current_planet['st_vel'] = stellar_rotation_velocity[i]
    if not pd.isnull(magnitude_b[i]):
        current_planet['mag_b'] = magnitude_b[i]
    if not pd.isnull(magnitude_v[i]):
        current_planet['mag_v'] = magnitude_v[i]

# Append the last planet in the list after the loop ends
if current_planet:
    planet_list.append(current_planet)

# Save the list of planets as a JSON file
output_file = 'planet_data.json'
with open(output_file, 'w') as f:
    json.dump(planet_list, f, indent=4)

print(f'Data has been written to {output_file}')

