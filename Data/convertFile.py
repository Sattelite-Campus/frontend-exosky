import pandas as pd

# Define the file path
file_path = 'Data/star_data.csv'

# Read the CSV file, skipping the initial comment lines (start after line 6)
data = pd.read_csv(file_path, comment='#')

# Extract the right ascension, declination, and planet name
star_name = data['hostname']
right_ascension = data['ra']
declination = data['dec']
distance = data['sy_dist']
solar_mass = data['st_mass']
magnitude_b = data['sy_bmag']
magnitude_v = data['sy_vmag']
luminosity = data['st_lum']


# Print the extracted data
# print("Star Name:", star_name)
# print("Right Ascension:", right_ascension)
# print("Declination:", declination)
# print("Distance:", distance)
# print("Blue Light Magnitude:", magnitude_b)

#create a dictionary with planet names as keys and a list of right ascension and declination as values
star_list = []
for i in range(len(star_name)):
    # check if any of them are nan
    if pd.isnull(right_ascension[i]) or pd.isnull(declination[i]) or pd.isnull(distance[i]) or pd.isnull(magnitude_b[i]):
        continue
    temp_dict = {'name': star_name[i], 'ra': right_ascension[i], 'dec': declination[i], 'dist' : distance[i], 'mag_b' : magnitude_b[i], 'lum' : luminosity[i], 'mass' : solar_mass[i]}
    star_list.append(temp_dict)
# print(star_list)

#return dictionary as json file
import json
with open('star_data.json', 'w') as f:
    json.dump(star_list, f)

#print all magn values in the json file
with open('star_data.json') as f:
    data = json.load(f)
    for star in data:
        print(star['mag'])