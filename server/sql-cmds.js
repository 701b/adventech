const NUMBER_OF_TEMPS_RETURNED = 30;

module.exports.sqlQueryTemps = `
SELECT * 
  FROM (SELECT * FROM fetal_information.heart_rate ORDER BY timestamp DESC LIMIT ${NUMBER_OF_TEMPS_RETURNED})
  AS lastRows
  ORDER BY timestamp ASC;
`;

module.exports.sqlCreatTable = `
CREATE SCHEMA IF NOT EXISTS "fetal_information";
ALTER SCHEMA "fetal_information" OWNER TO "groupFamily";
CREATE TABLE IF NOT EXISTS "fetal_information"."heart_rate"(
  id serial,
  timestamp timestamp without time zone NOT NULL
    DEFAULT (current_timestamp AT TIME ZONE 'UTC'),
  heart_rate integer,
  PRIMARY KEY (id)
);
ALTER TABLE "fetal_information"."heart_rate" OWNER to "groupFamily";
GRANT ALL ON ALL TABLES IN SCHEMA "fetal_information" TO "groupFamily";
GRANT ALL ON ALL SEQUENCES IN SCHEMA "fetal_information" TO "groupFamily";
`;
