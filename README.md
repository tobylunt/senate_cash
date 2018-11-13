# Senate Cash

This repo uses public data to visualize Senatorial campaign contributions in an accessible, transparent, and reproducible way. 

## Acknowledgements

Data are from the Center for Responsive Politics, which assembles and cleans publicly available campaign finance data and makes it available for non-commercial uses through their API and bulk data portal. Thank you. See https://www.opensecrets.org/ for more information.

We also use the Civil Services repo on Senator demography for Senator headshots. See https://github.com/CivilServiceUSA/us-senate.

## What this repo contains

This Github repo includes everything needed to assemble and process the Senatorial data required for the visualization, and to serve the web app to the local host (except for a CRP API key). The data is downloaded and processed in Python, and the web app uses the Django web framework. The visualization is in D3, borrowing from various D3 blocks (thank you).

## What the data will tell you

The impetus for this project was to create an accessible yet information-rich visualization of widely available political financial data - i.e. making it as easy as possible for concerned citizens with other obligations on their time to easily figure out what kinds of organizations (and people!) are funding the campaigns of the Senators that represent them. These data are freely available yet difficult to access for the average American. That's a problem!

We present campaign contribution data, which is subject to contribution limits and reporting requirements. 

For a primer on this subject, I recommend an [excellent summary](https://sunlightfoundation.com/2016/04/21/arent-there-limits-on-campaign-contributions-and-other-questions-youre-too-embarrassed-to-ask/) from the Sunlight Foundation.

## What the data will NOT tell you

We don't cover PACs, Super PACs, national party disbursements, 527s or 501s.

The Citizens United decision cleared the way for unlimited contributions to Super PACs, which can say whatever they want as long as they don't get caught coordinating with a candidate. Super PACs are a huge force in electoral politics and are impossible to attribute to specific individuals or interests, due to the ease of routing money through an anonymizing shell corporation. Currently, this analysis does not consider Super PACs.

## Get involved

Please let me know of any suggestions for improvement, and feel free to submit a pull request. I intend to keep this up to date.