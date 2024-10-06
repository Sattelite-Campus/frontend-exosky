import pandas as pd
import json

# Define the file path
file_path = 'Data/star_data_real.csv'

# Read the CSV file, skipping the initial comment lines (start after line 6)
data = pd.read_csv(file_path, comment='#')

# Extract the relevant columns
host_name = data['hostname']
stellar_temp = data['st_teff']
stellar_mass = data['st_mass']
stellar_luminosity = data['st_lum']
right_ascension = data['ra']
declination = data['dec']
distance = data['sy_dist']
magnitude_b = data['sy_bmag']
magnitude_v = data['sy_vmag']

star_list = []

current_star = {}

for i in range(len(host_name)):
    if pd.isnull(right_ascension[i]) or pd.isnull(declination[i]) or pd.isnull(distance[i]):
        continue

    if i == 0 or host_name[i] != host_name[i - 1]:
        # If a new host_name appears, add the previous host star to the list
        if current_star:
            star_list.append(current_star)
        # Initialize a new dictionary for the current host star
        current_star = {
            'host_name': host_name[i],
            'st_temp': None,
            'st_mass': None,
            'st_lum': None,
            'ra': right_ascension[i],
            'dec': declination[i],
            'dist': distance[i],
            'mag_b': None,
            'mag_v': None
        }

    if not pd.isnull(stellar_temp[i]):
        current_star['stellar_temp'] = stellar_temp[i]
    if not pd.isnull(stellar_mass[i]):
        current_star['stellar_mass'] = stellar_mass[i]
    if not pd.isnull(stellar_luminosity[i]):
        current_star['stellar_luminosity'] = stellar_luminosity[i]
    if not pd.isnull(magnitude_b[i]):
        current_star['magnitude_b'] = magnitude_b[i]
    if not pd.isnull(magnitude_v[i]):
        current_star['magnitude_v'] = magnitude_v[i]

if current_star:
    star_list.append(current_star)

output_file = 'star_data.json'
with open(output_file, 'w') as f:
    json.dump(star_list, f, indent=4)

print(f'Data has been written to {output_file}')
