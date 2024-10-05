import pandas as pd

# Define the file path
file_path = 'PS_2024.09.28_18.08.25.csv'

# Read the CSV file, skipping the initial comment lines (start after line 6)
data = pd.read_csv(file_path, comment='#')

# Extract the right ascension, declination, and planet name
right_ascension = data['ra']
declination = data['dec']
planet_name = data['pl_name']

# Print the extracted data
print("Right Ascension:", right_ascension)
print("Declination:", declination)
print("Planet Name:", planet_name)

#create a dictionary with planet names as keys and a list of right ascension and declination as values
planet_list = []
for i in range(len(planet_name)):
    temp_dict = {'name': planet_name[i], 'ra': right_ascension[i], 'dec': declination[i]}
    planet_list.append(temp_dict)
print(planet_list)


#return dictionary as json file
import json
with open('planet_data.json', 'w') as f:
    json.dump(planet_list, f)