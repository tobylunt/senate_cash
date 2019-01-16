# Senate Cash

This repo uses public data to visualize Senatorial campaign contributions in an accessible, transparent, and reproducible way. This is a complete and functional web app nearing a v1.0 release, but is still a work in progress.

The web app can be viewed [here](https://senate-cash.herokuapp.com/). Chrome recommended.

Note that the app currently visualizes the 2016 contribution cycle; this will be updated as the 2018 data come in.

![Tammy Baldwin](https://github.com/tobylunt/senate_cash/raw/master/map/static/tammy.png "Tammy Baldwin")

## What this repo contains

This Github repo includes everything needed to assemble and process the Senatorial data required for the visualization, and to build and serve the web app to the local host (except for a CRP API key - you need your own). The data is downloaded and processed in Python, and the web app uses the Django web framework. The visualization uses D3, borrowing from various D3 blocks (thank you).

## What the data will tell you

The impetus for this project was to create an accessible yet information-rich visualization of widely available political financial data - i.e. to make it as easy as possible for concerned citizens with limited available time to easily figure out what kinds of organizations (and people!) are funding the campaigns of the senators that represent them. These data are freely available yet difficult to access or intuit for the average American. That's a problem!

This web app presents individual and institutional campaign contributions for the most recent campaign cycle, which is subject to contribution limits and reporting requirements. These are split by industry - including the individual contributions. Per the [Open Secrets FAQ](https://www.opensecrets.org/resources/faq/), "Since corporations and other organizations are prohibited from making political contributions from their treasuries, one must look at the contributions from people associated with the institution to gauge its political persuasion and how it might be trying to exert influence in Washington." I agree.

For a primer on this subject, I recommend an [excellent summary](https://sunlightfoundation.com/2016/04/21/arent-there-limits-on-campaign-contributions-and-other-questions-youre-too-embarrassed-to-ask/) from the Sunlight Foundation.

## What the data will NOT tell you

We don't cover PACs, Super PACs, national party disbursements, 527s or the various 501s.

The Citizens United decision cleared the way for unlimited contributions to Super PACs, which can say whatever they want as long as they don't get caught coordinating with a candidate. Super PACs are a huge force in electoral outcomes and are impossible to attribute to specific individuals or interests, due to the ease of routing money through an anonymizing shell corporation. Currently, this analysis does not consider Super PACs.

## How it works

There are a few steps to the build:

1) Download full contributions data from Open Secrets (also download pre-processed OS data for examination, but don't end up using it)
2) Get the contributions data into Postgres tables
3) Process the data in SQL to provide summaries for each candidate, and export to JSON
4) Download headshots for all senators
5) map.js holds all the the D3, which automatically pairs senators to states, and the data to the appropriate senators for the web app itself.

The bash script `processing/process_data.sh` calls all external .sql and .py scripts required to build the webapp.

## What's in this repo

The raw directory structure is as follows:

![Tree](https://github.com/tobylunt/senate_cash/raw/master/map/static/dirtree.png "tree")

`map/static/` has all image files and `.json` blobs that are used as input for the D3. For the scripts that do all the preparatory steps, see `processing/`. The rest of the directory tree is standard Django setup.

## Acknowledgements

This project is not associated with any organization. This is a personal endeavor entirely. However, I relied upon the following sources.

I use the Civil Services repo on Senator demography for Senator headshots. See https://github.com/CivilServiceUSA/us-senate.

Data are from the Center for Responsive Politics, which assembles and cleans publicly available campaign finance data and makes it available for non-commercial uses through their API and bulk data portal. Thank you. See https://www.opensecrets.org/ for more information. 

![OS](https://github.com/tobylunt/senate_cash/raw/master/map/static/opensecrets.png "open secrets")

## Get involved

Please let me know of any suggestions for improvement, and feel free to submit a pull request. I intend to keep this up to date.