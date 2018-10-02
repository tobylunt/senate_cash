# scrapes senatorial contribution data.
# by: toby lunt

# imports
import urllib
import json

# open apikey file
with open('os_apikey.txt') as fp:
    lines = fp.read().split("\n")

# set the api key into an object
apikey = lines[0]

# example api requests
https://www.opensecrets.org/api/?method=getLegislators&output=json&id=NJ&apikey=apikey
http://www.opensecrets.org/api/?method=getLegislators&id=NJ&apikey=apikey
https://www.opensecrets.org/api/?method=candContrib&cid=N00007360&cycle=2018&apikey=apikey
