-- open up psql
psql postgres

-- turn on query timing
\timing

-- list users
\du

-- create a user with write permissions for this db
createuser senate_cash --createdb

-- list databases
\l

-- create the db
contribs

-- connect to test_db
\connect test_db

-- list tables
\dt

-- create a new table
--CREATE TABLE agency (
--    agency_id character varying,
--    agency_name character varying NOT NULL,
--    agency_url character varying NOT NULL,
--    agency_timezone character varying NOT NULL,
--    agency_lang character varying,
--    agency_phone character varying,
--    agency_fare_url character varying
--);

CREATE TABLE "Pac_Other16" (
    Cycle char(4) NOT NULL,
    FECRecNo char(19) NOT NULL,
    FilerID char(9) NOT NULL,
    DonorCmte varchar(50) NULL,
    ContribLendTrans varchar(50) NULL,
    City varchar(30) NULL,
    State char(2) NULL,
    Zip char(5) NULL,
    FECOccEmp varchar(38) NULL,
    PrimCode char(5) NULL,
    Date timestamp NULL,
    Amount float NULL,
    RecipID char(9) NULL,
    Party char(1) NULL,
    OtherID char(9) NULL,
    RecipCode char(2) NULL,
    RecipPrimcode char(5) NULL,
    Amend char(1) NULL,
    Report char(3) NULL,
    PG char(1) NULL,
    Microfilm char(11) NULL,
    Type char(3) NULL,
    Realcode char(5) NULL,
    Source char(5) NULL
)
;


CREATE TABLE "Pac_Other16" (
    Cycle varchar(4) NOT NULL
);



-- query table info
SELECT *
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'test_table';

-- another query
select *
from test_table
where false;


-- copy from file on desktop
COPY test_table FROM '/Users/tobiaslunt/Desktop/pac_other16.txt' WITH CSV QUOTE '|' DELIMITER ',';



\q
