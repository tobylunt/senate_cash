-- much of this code has been adapted from Solomon's repo on getting opensecrets data into Postgres. thanks!
-- https://github.com/Solomon/opensecrets_to_postgres

-- turn on timing
\timing

-- create the contributions database and connect
create database contribs;
\c contribs

-- initialize the candidates table
DROP TABLE candidates;
CREATE TABLE candidates(
  id bigserial primary key,
  cycle varchar(255),
  fec_cand_id varchar(255),
  cid varchar(255),
  first_last_party varchar(255),
  party varchar(255),
  dist_id_run_for varchar(255),
  dist_id_currently_held varchar(255),
  current_candidate varchar(255),
  cycle_candidate varchar(255),
  crpico varchar(255),
  recip_code varchar(255),
  nopacs varchar(255),
  raised_from_pacs integer,
  raised_from_individuals integer,
  raised_total integer,
  raised_unitemized integer
);

-- \copy depends on relative filepath - you need to be in /raw for this to work.
\COPY candidates(cycle, fec_cand_id, cid, first_last_party, party, dist_id_run_for, dist_id_currently_held, current_candidate, cycle_candidate, crpico, recip_code, nopacs) from 'cands16.txt'  WITH CSV QUOTE '|' DELIMITER ',';

# commitees data next
DROP TABLE committees;
CREATE TABLE committees(
  id bigserial primary key,
  cycle varchar(255),
  committee_id varchar(255),
  pac_short varchar(255),
  affiliate varchar(255),
  ultorg varchar(255),
  recip_id varchar(255),
  recip_code varchar(255),
  fec_cand_id varchar(255),
  party varchar(255),
  prim_code varchar(255),
  source varchar(255),
  sensitive varchar(255),
  foreign_owned varchar(255),
  active integer
);

-- populate the commitees table
\COPY committees(cycle, committee_id, pac_short, affiliate, ultorg, recip_id, recip_code, fec_cand_id, party, prim_code, source, sensitive, foreign_owned, active) from 'cmtes16.txt' WITH CSV QUOTE '|' DELIMITER ',';

-- now for individual contribs
DROP TABLE individual_contributions;
CREATE TABLE individual_contributions(
  id bigserial primary key,
  cycle varchar(255),
  fec_trans_id varchar(255),
  contributor_id varchar(255),
  contributor_name varchar(255),
  recipient_id varchar(255),
  org_name varchar(255),
  ult_org varchar(255),
  real_code varchar(255),
  date timestamp,
  amount integer,
  street varchar(255),
  city varchar(255),
  state varchar(255),
  zip varchar(255),
  recip_code varchar(255),
  type varchar(255),
  committee_id varchar(255),
  other_id varchar(255),
  gender varchar(255),
  old_format_employer_occupation varchar(255),
  microfilm varchar(255),
  occupation varchar(255),
  employer varchar(255),
  source varchar(255)
);

-- get data in from raw. largest table. 
\COPY individual_contributions(cycle, fec_trans_id, contributor_id, contributor_name, recipient_id, org_name, ult_org, real_code, date, amount, street, city, state, zip, recip_code, type, committee_id, other_id, gender, microfilm, occupation, employer, source) from 'indivs16.txt' WITH CSV QUOTE '|' DELIMITER ',';

-- pacs now
DROP TABLE pacs;
CREATE TABLE pacs(
  id bigserial primary key,
  cycle varchar(255),
  fec_rec_no varchar(255),
  pac_id varchar(255),
  cid varchar(255),
  amount integer,
  date timestamp,
  real_code varchar(255),
  type varchar(255),
  di varchar(255),
  fec_cand_id varchar(255)
);
\COPY pacs(cycle, fec_rec_no, pac_id, cid, amount, date, real_code, type, di, fec_cand_id) from 'pacs16.txt' WITH CSV QUOTE '|' DELIMITER ',';

-- pac to pacs
DROP TABLE pac_to_pacs;
CREATE TABLE pac_to_pacs(
  id bigserial primary key,
  cycle varchar(255),
  fec_rec_no varchar(255),
  filer_id varchar(255),
  donor_committee varchar(255),
  contrib_lend_trans varchar(255),
  city varchar(255),
  state varchar(255),
  zip varchar(255),
  fec_occ_emp varchar(255),
  prim_code varchar(255),
  date timestamp,
  amount decimal,
  recipient_id varchar(255),
  party varchar(255),
  other_id varchar(255),
  recip_code varchar(255),
  recip_prim_code varchar(255),
  amend varchar(255),
  report varchar(255),
  pg varchar(255),
  microfilm varchar(255),
  type varchar(255),
  real_code varchar(255),
  source varchar(255)
);
\COPY pac_to_pacs(cycle, fec_rec_no, filer_id, donor_committee, contrib_lend_trans, city, state, zip, fec_occ_emp, prim_code, date, amount, recipient_id, party, other_id, recip_code, recip_prim_code, amend, report, pg, microfilm, type, real_code, source ) from 'pac_other16.txt' WITH CSV QUOTE '|' DELIMITER ',';

---- industry codes - DONT HAVE THIS FILE YET.
--DROP TABLE industry_codes;
--CREATE TABLE industry_codes(
--  id bigserial primary key,
--  category_code varchar(255),
--  category_name varchar(255),
--  industry_code varchar(255),
--  industry_name varchar(255),
--  sector varchar(255),
--  sector_long varchar(255)
--);
---- Line 443 extra column at end of line needs to be deleted
--COPY industry_codes(category_code, category_name, industry_code, industry_name, sector, sector_long)
--from '/Users/sik/Downloads/CRP_Categories.txt'
--WITH CSV DELIMITER E'\t';

-- politicians identifiers - from candidate table
DROP TABLE politicians;
CREATE TABLE politicians(
  id bigserial primary key,
  cid varchar(255),
  name varchar(255)
);

-- load up the politician codes
INSERT INTO politicians(cid, name)(
  SELECT distinct on(cid) cid, left(first_last_party, -4)
  FROM candidates
);

-- pac identifiers
DROP TABLE pac_records;
CREATE TABLE pac_records(
  id bigserial primary key,
  committee_id varchar(255),
  pac_short varchar(255),
  affiliate varchar(255),
  ultorg varchar(255),
  recip_id varchar(255),
  recip_code varchar(255),
  fec_cand_id varchar(255),
  party varchar(255),
  prim_code varchar(255),
  source varchar(255),
  sensitive varchar(255),
  foreign_owned varchar(255)
);

-- load up pac identifiers from committees table
INSERT INTO pac_records(committee_id, pac_short, affiliate, ultorg, recip_id, recip_code, fec_cand_id, party, prim_code, source, sensitive, foreign_owned)(
  SELECT distinct on(committee_id)
    committee_id, pac_short, affiliate, ultorg, recip_id, recip_code, fec_cand_id, party, prim_code, source, sensitive, foreign_owned
  FROM committees
);

-- add desired indices to each of the tables
CREATE INDEX ON candidates (cid);
CREATE INDEX ON individual_contributions (recipient_id);
CREATE INDEX ON individual_contributions (real_code);
CREATE INDEX ON pacs (cid);
CREATE INDEX ON pacs (real_code);
--CREATE INDEX ON industry_codes (category_code);
CREATE INDEX ON politicians (cid);
CREATE INDEX ON politicians (name);
CREATE INDEX ON individual_contributions (cycle);
CREATE INDEX ON pacs (cycle);
CREATE INDEX ON candidates (cycle);
CREATE INDEX ON pac_records (committee_id);







-- commit

-- exit
\q
