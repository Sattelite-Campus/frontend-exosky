import pandas as pd
import json
import math

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

# Create a list to hold the star data
star_list = []

## Iterate through the data and create a dictionary for each star
for i in range(len(host_name)):
    # Check if any of the values are NaN and skip if true
    if pd.isnull(host_name[i]) or pd.isnull(right_ascension[i]) or pd.isnull(declination[i]) or pd.isnull(distance[i]):
        continue

    # Create a dictionary for each star with all relevant attributes
    temp_dict = {
        'host_name': host_name[i],
        'st_temp': 0 if math.isnan(stellar_luminosity[i]) else stellar_luminosity[i],  
        'st_mass': 0 if math.isnan(stellar_luminosity[i]) else stellar_luminosity[i], 
        'st_lum': 0 if math.isnan(stellar_luminosity[i]) else stellar_luminosity[i], 
        'ra': right_ascension[i],
        'dec': declination[i],
        'sy_dist': distance[i],
        'mag_b': magnitude_b[i],
        'mag_v': magnitude_v[i]
    }
    
    # Ensure all values are not NaN
    if all(not pd.isna(value) for value in temp_dict.values()):
        star_list.append(temp_dict)

print(len(star_list))

# Save the list of stars as a JSON file
output_file = './Data/star_data3.json'
with open(output_file, 'w') as f:
    json.dump(star_list, f, indent=4)

print(f'Data has been written to {output_file}')
