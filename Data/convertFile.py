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
magnitude = data['sy_bmag']

# Print the extracted data
# print("Star Name:", star_name)
# print("Right Ascension:", right_ascension)
# print("Declination:", declination)
# print("Distance:", distance)
print("Luminosity:", magnitude)

#create a dictionary with planet names as keys and a list of right ascension and declination as values
star_list = []
for i in range(len(star_name)):
    # check if any of them are nan
    if pd.isnull(right_ascension[i]) or pd.isnull(declination[i]) or pd.isnull(distance[i]) or pd.isnull(magnitude[i]):
        continue
    temp_dict = {'name': star_name[i], 'ra': right_ascension[i], 'dec': declination[i], 'dist' : distance[i], 'mag' : magnitude[i]}
    star_list.append(temp_dict)
# print(star_list)

#TODO: Get Luminosity and turn luminosity into star brightness on our star map

#return dictionary as json file
import json
with open('star_data.json', 'w') as f:
    json.dump(star_list, f)

#print all magn values in the json file
with open('star_data.json') as f:
    data = json.load(f)
    for star in data:
        print(star['mag'])