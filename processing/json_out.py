# imports
from collections import defaultdict
import csv
import json
import os
import pandas as pd
import numpy as np

# set csv filename into object
fn = '/Users/tobiaslunt/Documents/projects/senate_cash/processing/pre_json.csv'

# preprocess the csv. read in data to dataframe
df = pd.read_csv(fn)

# remove missings. note that negative contributions are returns.
df = df.dropna()

# overwrite csv
df.to_csv(fn, index = False)

# establish functions to recursively build a nested dict structure
# over columns, assuming values in rightmost column. need to make sure
# the output JSON has the correct structure, where each nested feature
# is named "children:"
# see: https://stackoverflow.com/questions/43757965/convert-csv-to-json-tree-structure

def ctree():
    """ One of the python gems. Making possible to have dynamic tree structure.
    
    """
    return defaultdict(ctree)


#def build_leaf(name, leaf):
#    """ Recursive function to build desired custom tree structure
#    
#    """
#    # need our parent categories under the "name" feature
#    res = {"name": name}
#    
#    # add "children" node if the leaf actually has any children
#    if len(leaf.keys()) > 0:
#        res["children"] = [build_leaf(k, v) for k, v in leaf.items()]
#        
#    return res
#
#
# takes an input dataframe
#def jsonify(fn):
#    """ The main thread composed from two parts.
#    
#    First it's parsing the csv file and builds a tree hierarchy from it.
#    Second it's recursively iterating over the tree and building custom
#    json-like structure (via dict).
#    
#    And the last part is just printing the result.
#    """
#    tree = ctree()
#    
#    # insheet csvfile. get fn from input arg
#    with open(fn) as csvfile:
#        
#        # read in 
#        reader = csv.reader(csvfile)
#        
#        # enumerate over the csv, returning index and row/line
#        for rid, row in enumerate(reader):
#            
#            # skipping first header row. remove this logic if your csv is
#            # headerless
#            if rid == 0:
#                continue
#            
#            # usage of python magic to construct dynamic tree structure and
#            # basically grouping csv values under their parents
#            leaf = tree[row[0]]
#            for cid in range(1, len(row)):
#                leaf = leaf[row[cid]]
#                
#    # building a custom tree structure
#    res = []
#    for name, leaf in tree.items():
#        res.append(build_leaf(name, leaf))
#        
#    # printing results into the terminal
#    return json.dumps(res)

def build_leaf(name, leaf):
    """ Recursive function to build desired custom tree structure
    
    """
    # need our parent categories under the "name" feature
    res = {"name": name}
    
    # add "children" node if the leaf actually has any children beyond the final value
    if len(leaf.keys()) > 0:
        try:
            float(min(list(leaf.keys()))) 
            if float(min(list(leaf.keys()))) > 0:
                res["size"] = float(min(list(leaf.keys())))
        except ValueError:
            res["children"] = [build_leaf(k, v) for k, v in leaf.items()]
    return res

#def final_leaf(contrib_val, leaf):
#    """ Function to differentiate final values from new leaves
#    
#    """
#    # add the size to the existing leaf's dict and return it
#    res["size"] = contrib_val
#    return res


def jsonify(fn):
    """ The main thread composed from two parts.
    
    First it's parsing the csv file and builds a tree hierarchy from it.
    Second it's recursively iterating over the tree and building custom
    json-like structure (via dict).
    
    And the last part is just printing the result.
    """
    tree = ctree()
    
    # insheet csvfile. get fn from input arg
    with open(fn) as csvfile:
        
        # read in 
        reader = csv.reader(csvfile)
        
        # enumerate over the csv, returning index and row/line
        for rid, row in enumerate(reader):
            
            # skipping first header row. remove this logic if your csv is
            # headerless
            if rid == 0:
                continue
            
            # usage of python magic to construct dynamic tree structure and
            # basically grouping csv values under their parents
            leaf = tree[row[0]]
            for cid in range(1, len(row)):
                leaf = leaf[row[cid]]
                
    # building a custom tree structure
    res = []
    for name, leaf in tree.items():
        res.append(build_leaf(name, leaf))
    
    # printing results into the terminal
    return json.dumps(res)


# process our table. this is dumped from process_data.sql
j = jsonify(fn)

# dump to final json. need to be careful to avoid escaping double quotes
with open("/Users/tobiaslunt/Documents/projects/senate_cash/map/static/contribs.json","w") as f:
    f.write(j + '\n')

# remove the input CSV
os.remove("/Users/tobiaslunt/Documents/projects/senate_cash/processing/pre_json.csv")

