\set ON_ERROR_STOP on
DO $$
BEGIN
  IF (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name <> 'flyway_schema_history') <> 82 THEN
    RAISE EXCEPTION 'Expected 82 pilot tables';
  END IF;
  IF (SELECT count(*) FROM information_schema.table_constraints WHERE constraint_schema='public' AND constraint_type='FOREIGN KEY') <> 230 THEN
    RAISE EXCEPTION 'Expected 230 foreign keys';
  END IF;
  IF (SELECT count(*) FROM roles) <> 15 OR (SELECT count(*) FROM policy_versions) <> 11 OR (SELECT count(*) FROM retention_rules) <> 10 THEN
    RAISE EXCEPTION 'Reference seed is incomplete';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM fulfillment_profiles WHERE code='PARCEL') OR NOT EXISTS (SELECT 1 FROM fulfillment_profiles WHERE code='ONSITE') THEN
    RAISE EXCEPTION 'Pilot fulfillment profiles are missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='v_party_kyc_status') THEN
    RAISE EXCEPTION 'KYC status view is missing';
  END IF;
  IF (SELECT count(*) FROM flyway_schema_history WHERE success AND version IN ('1','2')) <> 2 THEN
    RAISE EXCEPTION 'Flyway migrations V1 and V2 have not both succeeded';
  END IF;
END $$;
