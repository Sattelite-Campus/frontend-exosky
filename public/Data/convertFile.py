import pandas as pd
import json

file_path = 'Data/planet_data2.csv'

data = pd.read_csv(file_path, comment='#')

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

for i in range(len(planet_name)):
    if pd.isnull(planet_name[i]) or pd.isnull(right_ascension[i]) or pd.isnull(declination[i]) or pd.isnull(distance[i]):
        continue

    temp_dict = {
        'name': planet_name[i],
        'mass': planet_mass[i],
        'eq_temp': equilibrium_temp[i],
        'inclination': orbital_inclination[i],
        'st_temp': stellar_temp[i],
        'st_lum': stellar_luminosity[i],
        'st_vel': stellar_rotation_velocity[i],
        'ra': right_ascension[i],
        'dec': declination[i],
        'dist': distance[i],
        'mag_b': magnitude_b[i],
        'mag_v': magnitude_v[i]
    }

    planet_list.append(temp_dict)

output_file = 'planet_data.json'
with open(output_file, 'w') as f:
    json.dump(planet_list, f, indent=4)

print(f'Data has been written to {output_file}')
