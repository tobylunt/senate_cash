# scrapes senatorial contribution data.
# toby lunt
# free to use


############
# PREAMBLE #
############

# import libraries
import urllib
import json
import requests
import shutil
import os
from requests.auth import HTTPDigestAuth

# open untracked apikey file, save the stored key from the top
# line. save your API key into this file and adjust the path as needed.
with open('/Users/tobiaslunt/Documents/projects/senate_cash/os_apikey.txt') as fp:
    lines = fp.read().split("\n")

# this code is modified from the Center for Responsive Politics python API, which is extremely helpful but not maintained.
# https://github.com/opensecrets/python-crpapi
# note that we also use some of the updates in unmerged pull requests in this repo, updated for python 3. thanks!

# set up a currently empty handler for API call errors
class CRPApiError(Exception):
    """ Exception for CRP API errors """
    

# CRP will handle our various API calls
class CRP(object):

    # initialize API key as empty
    apikey = None
    
    # define an API call method that concanates the URL
    @staticmethod
    def _apicall(func, params):
        
        # check for API key
        if CRP.apikey is None:
            raise CRPApiError('Missing CRP apikey')
        
        # compile URL - method, key, parameters
        url = 'http://www.opensecrets.org/api/' \
              '?method=%s&output=json&apikey=%s&%s' % \
              (func, CRP.apikey, urllib.parse.urlencode(params))
        
        # see if it works
        try:
            response = requests.get(url)
            return response.json()['response']
        except requests.exceptions.RequestException as e:  # This is the correct syntax
            print(e)
            sys.exit(1)
            
    class getLegislators(object):
        @staticmethod
        def get(**kwargs):
            results = CRP._apicall('getLegislators', kwargs)['legislator']
            return results
        
    class memPFDprofile(object):
        @staticmethod
        def get(**kwargs):
            results = CRP._apicall('memPFDprofile', kwargs)['member_profile']
            return results
        
    class candSummary(object):
        @staticmethod
        def get(**kwargs):
            result = CRP._apicall('candSummary', kwargs)['summary']
            return result['@attributes']
        
    class candContrib(object):
        @staticmethod
        def get(**kwargs):
            results = CRP._apicall('candContrib', kwargs)['contributors']['contributor']
            return results
        
    class candIndustry(object):
        @staticmethod
        def get(**kwargs):
            results = CRP._apicall('candIndustry', kwargs)['industries']['industry']
            return results
        
    class candSector(object):
        @staticmethod
        def get(**kwargs):
            results = CRP._apicall('candSector', kwargs)['sectors']['sector']
            return results
        
    class candIndByInd(object):
        @staticmethod
        def get(**kwargs):
            result = CRP._apicall('CandIndByInd', kwargs)['candIndus']
            return result['@attributes']
        
    class getOrgs(object):
        @staticmethod
        def get(**kwargs):
            results = CRP._apicall('getOrgs', kwargs)['organization']
            return results
        
    class orgSummary(object):
        @staticmethod
        def get(**kwargs):
            results = CRP._apicall('orgSummary', kwargs)['organization']
            return results
        
    class congCmteIndus(object):
        @staticmethod
        def get(**kwargs):
            results = CRP._apicall('congCmteIndus', kwargs)['committee']['member']
            return results


# establish our api key within CRP
CRP.apikey = lines[0]


############
# REQUESTS #
############

# begin with getting basic information about senators from CivilServiceUSA's repo
url = "https://raw.githubusercontent.com/CivilServiceUSA/us-senate/master/us-senate/data/us-senate.json"
r = requests.get(url)

# take a look at what we've got - full json
parsed = json.loads(r.text)
print(json.dumps(parsed, indent=4, sort_keys=True))

# explore the json. check to make sure we have two senators in each of
# our 50 states
len(parsed)

# cut this down to only attributes we want to retain
keys = ['state_code', 'name', 'opensecrets', 'photo_url']
trunc = [{ key: parsed[i][key] for key in keys } for i in range(len(parsed))]

# inspect visually
print(json.dumps(trunc, indent=4, sort_keys=True))

# explore the API. select the first senator for a test run
os = trunc[1]['opensecrets']

# retrieve and examine sectoral contributions
tmp = CRP.candSector.get(cid=os,cycle='2018')
print(json.dumps(tmp, indent=4, sort_keys=True))

# look at industry contributions, within sectors
tmp = CRP.candIndustry.get(cid=os,cycle='2018')
print(json.dumps(tmp, indent=4, sort_keys=True))

# now look at top firm-level contributors.
tmp = CRP.candContrib.get(cid=os,cycle='2018')
print(json.dumps(tmp, indent=4, sort_keys=True))

# we can see from this exploration that we can map sectors to
# industries, but with insufficient detail, and cannot easily map top
# contributors to industries or sectors. instead of the API, we'll
# switch to the raw bulk data.

# make a new directory to catch headshots
headshotFolder = 'headshots'
try:
    os.mkdir(headshotFolder)
except FileExistsError:
    print("Directory " , headshotFolder ,  " already exists")

# define a downloader
def imgDownload(url, file_name):
    # get request
    response = requests.get(url, stream=True)
    # write to file
    with open(file_name, 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)
    # remove the response
    del response

# save all of the headshots to disk
p = [imgDownload(trunc[i]['photo_url'], headshotFolder + '/' + trunc[i]['opensecrets'] + '.jpg') for i in range(len(trunc))]
del p

# trim the json further - only need osid and state code in the web app
keys = ['state_code', 'opensecrets']
trunc = [{ key: parsed[i][key] for key in keys } for i in range(len(parsed))]

# save opensecrets ID  and state code to a new json
with open('map/static/headshots.json', 'w') as outfile:
    json.dump(trunc, outfile)


