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
from requests.auth import HTTPDigestAuth

# open untracked apikey file, save the stored key from the top
# line. save your API key into this file and adjust the path as needed.
with open('../os_apikey.txt') as fp:
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

tmp = parsed[1]
dict((k, tmp[k]) for k in ('state_code', 'name', 'opensecrets', 'photo_url'))
keys = ['state_code', 'name', 'opensecrets', 'photo_url']
dict_short = { key: tmp[key] for key in keys }

[for i in range(len(parsed)) dict((k, tmp[i][k]) for k in ('state_code', 'name', 'opensecrets', 'photo_url'))]
