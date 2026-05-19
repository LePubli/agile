# Déploiement NexusOS sur Coolify

## Prérequis
- Serveur avec Docker et Coolify installé
- Domaine configuré (optionnel mais recommandé)
- Clés API pour les providers IA (optionnel)

## Étapes de déploiement

### 1. Créer un nouveau projet dans Coolify
1. Connectez-vous à Coolify
2. Cliquez sur "New Project"
3. Nommez-le "NexusOS"

### 2. Ajouter les services

#### PostgreSQL
- Service: PostgreSQL 16
- Database: nexusos
- User: nexusos
- Password: (générer un mot de passe fort)

#### Redis
- Service: Redis 7
- Password: (générer un mot de passe fort)

#### MinIO
- Service: MinIO
- Access Key: nexusos_minio_admin
- Secret Key: (générer un mot de passe fort)
- Bucket par défaut: nexusos-assets

#### OpenSearch (optionnel)
- Service: OpenSearch 2.11
- Admin Password: (générer un mot de passe fort)

### 3. Déployer l'API (NestJS)
1. Source: Git (votre repository)
2. Build Pack: Nixpacks ou Dockerfile
3. Dockerfile: `apps/api/Dockerfile`
4. Port: 4000
5. Variables d'environnement:
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://nexusos:PASSWORD@postgres:5432/nexusos
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=PASSWORD
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=nexusos_minio_admin
MINIO_SECRET_KEY=SECRET
JWT_SECRET=votre_jwt_secret_64_chars_minimum
ENCRYPTION_KEY=votre_encryption_key_32_chars
ENABLE_SWAGGER=true
```

### 4. Déployer le Web (Next.js)
1. Source: Git (votre repository)
2. Build Pack: Nixpacks ou Dockerfile
3. Dockerfile: `apps/web/Dockerfile`
4. Port: 3000
5. Variables d'environnement:
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

### 5. Déployer les Workers
1. Source: Git (votre repository)
2. Build Pack: Nixpacks ou Dockerfile
3. Dockerfile: `apps/workers/Dockerfile`
4. Variables d'environnement:
```
NODE_ENV=production
DATABASE_URL=postgresql://nexusos:PASSWORD@postgres:5432/nexusos
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=PASSWORD
OPENAI_API_KEY=votre_cle_openai
ANTHROPIC_API_KEY=votre_cle_anthropic
MISTRAL_API_KEY=votre_cle_mistral
```

### 6. Configuration du domaine
1. Dans Coolify, configurez un domaine personnalisé
2. API: api.votre-domaine.com → Port 4000
3. Web: votre-domaine.com → Port 3000
4. MinIO Console: minio.votre-domaine.com → Port 9001

### 7. Initialisation de la base de données
Après le premier déploiement de l'API:
```bash
# Exécuter les migrations
docker exec nexusos-api npx prisma migrate deploy

# Optionnel: Seeder des données initiales
docker exec nexusos-api npm run db:seed
```

## Vérification

1. **Health Checks**:
   - API: https://api.votre-domaine.com/health
   - Web: https://votre-domaine.com/health
   - Swagger: https://api.votre-domaine.com/docs

2. **MinIO Console**:
   - Accédez à https://minio.votre-domaine.com
   - Login avec les credentials configurés

3. **Première connexion**:
   - Créez un compte administrateur via l'API ou l'interface web

## Scaling

### Horizontal
- Augmentez `WORKER_REPLICAS` dans les variables d'environnement
- Coolify gère automatiquement le scaling des conteneurs

### Vertical
- Augmentez les ressources (CPU/RAM) dans Coolify
- Recommandations minimales:
  - API: 2GB RAM, 2 CPU
  - Web: 2GB RAM, 2 CPU
  - Workers: 4GB RAM, 4 CPU (selon charge IA)
  - PostgreSQL: 4GB RAM, 4 CPU
  - Redis: 1GB RAM, 1 CPU

## Monitoring

Coolify fournit nativement:
- Logs en temps réel
- Métriques de ressources
- Health checks
- Alertes

Pour un monitoring avancé:
- Ajoutez Prometheus + Grafana
- Configurez les métriques custom dans l'API

## Sauvegardes

Configurez dans Coolify:
- PostgreSQL: Backup quotidien vers S3/MinIO
- MinIO: Versioning activé
- Redis: RDB snapshots

## Mises à jour

1. Poussez vos changements Git
2. Coolify détecte automatiquement et rebuild
3. Les migrations DB s'exécutent automatiquement
4. Zero-downtime deployment activé par défaut

## Sécurité

✅ Déjà configuré:
- HTTPS automatique via Let's Encrypt
- Isolation réseau entre services
- Secrets managés par Coolify
- Non-root users dans les containers
- Health checks

✅ À configurer:
- Firewall rules (ports 80/443 uniquement)
- Rate limiting dans l'API
- CORS policies
- CSP headers

## Support

Documentation complète: `/docs/ARCHITECTURE.md`
API Documentation: `https://api.votre-domaine.com/docs`
