import geojson
import json
from geojson import Point, Feature, FeatureCollection, dump
from unidecode import unidecode
import pandas as pd


# load geojson
with open("colombia_data.geojson") as f:
    gj = geojson.load(f)

df = pd.read_csv("worldcities.csv")

for index,row in df.iterrows():
    if row["country"] == "Colombia":
        point = Point((float(row["lng"]), float(row["lat"])))
        gj["features"].append(Feature(geometry=point, properties={"cityName": row["city_ascii"], "cityPopulation": row["population"]}))


with open('colombia_final.geojson', 'w') as f:
   dump(gj, f)
   