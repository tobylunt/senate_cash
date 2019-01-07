# imports
import pandas as pd
import json
import os

# import csv - this is dumped from process_data.sql
data = pd.read_csv("/Users/tobiaslunt/Documents/projects/senate_cash/processing/pre_json.csv") 
data.head()

# establish a function to recursively build a nested dict structure
# over columns, assuming values in rightmost column
def jsonify(df):
    json_out = dict()
    ncols = df.values.shape[1]
    for line in df.values:
        d = json_out
        for j, col in enumerate(line[:-1]):
            if not col in d.keys():
                if j != ncols-2:
                    d[col] = {}
                    d = d[col]
                else:
                    d[col] = line[-1]
            else:
                if j != ncols-2:
                    d = d[col]
    return json_out

# run on our data
j = jsonify(data)

# dump to final json
with open("/Users/tobiaslunt/Documents/projects/senate_cash/map/static/contribs.json","w") as f:
    json.dump(j,f)

# remove the input CSV
os.remove("/Users/tobiaslunt/Documents/projects/senate_cash/processing/pre_json.csv")
