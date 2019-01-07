#!/bin/bash

# note: this script requires a 2-digit cycle year (e.g. 18)

# exit on any non-zero status
set -e

# unset variables as an error
set -u

# check for necessary input variables
if [ $# != 1 ]; then
    echo "please enter 2-digit contribution cycle (e.g. 16)"
    exit 1
fi

# get input vars into globals for readability (and for psql)
export CYCLE=$1

# remove any previous iterations of the raw data, recreate the dir, and cd
rm -rf raw
mkdir raw
cd raw

# get the industry categories from CRP
wget https://www.opensecrets.org/downloads/crp/CRP_Categories.txt

# remove the preamble from the industry codes .txt
split -p "Catcode"  CRP_Categories.txt
rm xaa
rm CRP_Categories.txt
mv xab CRP_Categories.txt

# wget the zip, using the input election cycle, following CRP naming conventions
wget --header="Host: s3.amazonaws.com" --header="User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36" --header="Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8" --header="Accept-Language: en-US,en;q=0.9" "https://s3.amazonaws.com/assets3.opensecrets.org/bulk-data/CampaignFin$CYCLE.zip" -O "CampaignFin$CYCLE.zip" -c

# unzip the download
unzip CampaignFin$CYCLE.zip

# clean all input data to UTF8
for file in *.txt
do
    iconv -f latin1 -t utf-8 "$file" > "$file.new" &&
	mv -f "$file.new" "$file"
done

# start the postgres server
pg_ctl -D /usr/local/var/postgres start

# check if our 'contribs' database exists, searching the psql list output
if psql -lqt | cut -d \| -f 1 | grep -qw contribs; then

    # if so, remove it and reinitialize so it can be rebuilt
    DROP DATABASE contribs;
fi

# run the psql script
psql \
    -X \ # avoid any .psqlrc file that may exist
    -U user \ 
    -h $DBHOST \ 
    -f /process_data.sql \ # this is where our psql commands exist
    --echo-all \ # make visible to stdout
    --set AUTOCOMMIT=off \ # no automatic commits!
    --set ON_ERROR_STOP=on \ # break if anything goes wrong
    contribs # db name

psql_exit_status = $?

# check for psql errors
if [ $psql_exit_status != 0 ]; then
    echo "psql failed while trying to run this sql script" 1>&2
    exit $psql_exit_status
fi

# if no errors, display message
echo "sql script successful"

# run the python script converting flattened output table to deeply nested JSON in /maps/static/
python json_out.py

# exit the script
exit 0
