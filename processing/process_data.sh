#!/bin/bash

# exit on any non-zero status
set -e

# unset variables as an error
set -u

# check for necessary input variables
if [ $# != 2 ]; then
    echo "please enter a db host and a table suffix"
    exit 1
fi

# start the postgres server
pg_ctl -D /usr/local/var/postgres start

# check if our 'contribs' database exists, searching the psql list output
if psql -lqt | cut -d \| -f 1 | grep -qw contribs; then

    # if so, remove it and reinitialize so it can be rebuilt
    DROP DATABASE contribs;
    CREATE DATABASE contribs;
else

    # if not, create it
    CREATE DATABASE contribs;
fi

# get input vars into globals for psql
export DBHOST=$1
export TSUFF=$2

# run the psql script
psql \
    -X \ # avoid any .psqlrc file that may exist
    -U user \ 
    -h $DBHOST \ 
    -f /process_data.sql \ # this is where our psql commands exist
    --echo-all \ # make visible to stdout
    --set AUTOCOMMIT=off \ # no automatic commits!
    --set ON_ERROR_STOP=on \ # break if anything goes wrong
    --set TSUFF=$TSUFF \
    --set QTSTUFF=\'$TSUFF\' \ # quoted version of second argument (table suffix)
    contribs # db name

psql_exit_status = $?

if [ $psql_exit_status != 0 ]; then
    echo "psql failed while trying to run this sql script" 1>&2
    exit $psql_exit_status
fi

echo "sql script successful"
exit 0
