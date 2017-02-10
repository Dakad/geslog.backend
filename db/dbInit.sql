-- Creation de l'admin
INSERT INTO "pfe"."Users" ("firstName","lastName","type") VALUES ('Bakary','POTTER','ADMIN','admin123');

-- Creation de l'app Windows
INSERT INTO "pfe"."Applications" ("name","format") VALUES ('Windows','bat#/');

-- Creation de l'app Claroline
INSERT INTO "pfe"."Applications" ("name","format") VALUES ('Claroline','csv#,');

-- Creation de l'app Nutrilog
INSERT INTO "pfe"."Applications" ("name","format") VALUES ('Nutrilog','csv#;');


-- Creation du profil 1BIN
INSERT INTO "pfe"."Profiles" ("name") VALUES ('1BIN');

-- Creation de l'app 2BBI
INSERT INTO "pfe"."Profiles" ("name") VALUES ('2BDI');

-- Creation du profil Guest
INSERT INTO "pfe"."Profiles" ("name") VALUES ('Invite');