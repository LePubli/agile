-- NexusOS - Script d'initialisation PostgreSQL
-- Ce script est exécuté automatiquement au premier démarrage

-- Création des extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Configuration pour les performances
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'NexusOS PostgreSQL initialization completed successfully!';
    RAISE NOTICE 'Extensions installed: uuid-ossp, pg_trgm, btree_gin';
END $$;
