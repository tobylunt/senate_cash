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

if(myResponse.ok):

    # Loading the response data into a dict variable
    # json.loads takes in only binary or string variables so using content to fetch binary content
    # Loads (Load String) takes a Json file and converts into python data structure (dict or list, depending on JSON)
    jData = json.loads(myResponse.content)

    print("The response contains {0} properties".format(len(jData)))
    print("\n")
    for key in jData:
        print key + " : " + jData[key]
else:
  # If response code is not ok (200), print the resulting http error code with description
    myResponse.raise_for_status()


# example api requests
https://www.opensecrets.org/api/?method=getLegislators&output=json&id=NJ&apikey=apikey
http://www.opensecrets.org/api/?method=getLegislators&id=NJ&apikey=apikey
https://www.opensecrets.org/api/?method=candContrib&cid=N00007360&cycle=2018&apikey=apikey

