# scrapes senatorial contribution data.
# by: toby lunt

# imports
import urllib
import json
import requests
from requests.auth import HTTPDigestAuth

# open apikey file
with open('os_apikey.txt') as fp:
    lines = fp.read().split("\n")

# set the api key into an object
apikey = lines[0]

# attempt a scrape of the senate IDs
url = 'https://www.opensecrets.org/api/?method=getLegislators&output=json&id=NJ&apikey='
myResponse = requests.get(url,auth=HTTPDigestAuth(raw_input("username: "), raw_input("Password: ")), verify=True)

url = 'https://www.opensecrets.org/api/?method=getLegislators&output=json&id=NJ&apikey=' + apikey
myResponse = requests.get(url)

# check if we have an error code for our API request
if(myResponse.ok):

    # Loading the response data into a dict variable
    # json.loads takes in only binary or string variables so using content to fetch binary content
    # Loads (Load String) takes a Json file and converts into python data structure (dict or list, depending on JSON)
    jData = json.loads(myResponse.content)
    
    # print properties
    print("The response contains {0} properties".format(len(jData)))
    print("\n")
    
    # print the full json object for inspection
    print(json.dumps(jData, indent=4, sort_keys=True))

# If response code is not ok (200), print the resulting http error code with description
else:
    myResponse.raise_for_status()


# example api requests
# https://www.opensecrets.org/api/?method=getLegislators&output=json&id=NJ&apikey=apikey
# http://www.opensecrets.org/api/?method=getLegislators&id=NJ&apikey=apikey
# https://www.opensecrets.org/api/?method=candContrib&cid=N00007360&cycle=2018&apikey=apikey

