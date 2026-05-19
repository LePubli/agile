# 🚀 NexusOS - Résumé du Déploiement Coolify

## ✅ Fichiers Créés pour le Déploiement

### Infrastructure Docker
| Fichier | Description |
|---------|-------------|
| `docker-compose.yml` | Configuration complète des services (PostgreSQL, Redis, MinIO, OpenSearch, API, Web, Workers) |
| `apps/api/Dockerfile` | Dockerfile multi-stage pour l'API NestJS |
| `apps/web/Dockerfile` | Dockerfile multi-stage pour le frontend Next.js |
| `apps/workers/Dockerfile` | Dockerfile multi-stage pour les workers BullMQ |
| `.env.example` | Template des variables d'environnement |
| `.gitignore` | Configuration Git complète |

### Documentation
| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation principale avec quick start |
| `infra/docker/coolify.md` | **Guide complet de déploiement sur Coolify** |
| `docs/ARCHITECTURE.md` | Architecture détaillée (3100+ lignes) |
| `docs/TECHNICAL_SPEC.md` | Spécifications techniques |

### Applications
| Dossier | Description |
|---------|-------------|
| `apps/api/` | API NestJS avec modules (auth, tenants, plugins, events, workflows, ai) |
| `apps/web/` | Frontend Next.js |
| `apps/workers/` | Workers BullMQ pour jobs async (emails, IA, workflows, scraping, enrichment) |

### Core & Plugins
| Dossier | Description |
|---------|-------------|
| `packages/core/` | 15 modules core (auth, tenants, permissions, plugin-engine, etc.) |
| `plugins/` | 18 plugins officiels (crm, prospection, emailing, seo, reputation, etc.) |
| `themes/` | 4 thèmes installables |

---

## 📋 Checklist de Déploiement Coolify

### 1. Préparer le Repository
```bash
# Initialiser git si ce n'est pas fait
git init
git add .
git commit -m "Initial NexusOS setup"
git push origin main
```

### 2. Dans Coolify - Créer les Services

#### Base de Données
- [ ] PostgreSQL 16 → Database: `nexusos`
- [ ] Redis 7 → Password: (générer)
- [ ] MinIO → Bucket: `nexusos-assets`
- [ ] OpenSearch (optionnel)

#### Applications
- [ ] API (NestJS) → Port: 4000 → Dockerfile: `apps/api/Dockerfile`
- [ ] Web (Next.js) → Port: 3000 → Dockerfile: `apps/web/Dockerfile`
- [ ] Workers → Dockerfile: `apps/workers/Dockerfile`

### 3. Variables d'Environnement (API)
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
FRONTEND_URL=https://votre-domaine.com
```

### 4. Variables d'Environnement (Web)
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

### 5. Variables d'Environnement (Workers)
```
NODE_ENV=production
DATABASE_URL=postgresql://nexusos:PASSWORD@postgres:5432/nexusos
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=PASSWORD
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...
```

### 6. Post-Déploiement
```bash
# Exécuter les migrations
docker exec nexusos-api npx prisma migrate deploy

# Vérifier les logs
docker logs nexusos-api
docker logs nexusos-web
docker logs nexusos-workers
```

---

## 🔍 URLs à Vérifier

| Service | URL | Status |
|---------|-----|--------|
| Web | https://votre-domaine.com | ⬜ |
| API | https://api.votre-domaine.com | ⬜ |
| Swagger | https://api.votre-domaine.com/docs | ⬜ |
| Health API | https://api.votre-domaine.com/health | ⬜ |
| Health Web | https://votre-domaine.com/health | ⬜ |
| MinIO Console | https://minio.votre-domaine.com:9001 | ⬜ |

---

## 🛠️ Commandes Utiles

### Logs en temps réel
```bash
docker logs -f nexusos-api
docker logs -f nexusos-web
docker logs -f nexusos-workers
```

### Redémarrer un service
```bash
docker restart nexusos-api
docker restart nexusos-web
docker restart nexusos-workers
```

### Accéder au container
```bash
docker exec -it nexusos-api sh
docker exec -it nexusos-workers sh
```

### Vérifier les queues Redis
```bash
docker exec -it nexusos-redis redis-cli
> KEYS *
> LLEN bull:emails:wait
> LLEN bull:ai-tasks:wait
```

---

## 📊 Ressources Recommandées

| Service | RAM | CPU | Notes |
|---------|-----|-----|-------|
| API | 2GB | 2 | Scale horizontal si besoin |
| Web | 2GB | 2 | CDN recommandé |
| Workers | 4GB | 4 | Ajuster selon charge IA |
| PostgreSQL | 4GB | 4 | Backups quotidiens |
| Redis | 1GB | 1 | Persistence activée |
| MinIO | 2GB | 2 | Storage S3-compatible |

---

## 🆘 Support & Dépannage

### Problème: API ne démarre pas
```bash
# Vérifier les logs
docker logs nexusos-api

# Vérifier la connexion DB
docker exec nexusos-api ping postgres

# Vérifier les variables d'env
docker exec nexusos-api env | grep DATABASE
```

### Problème: Workers ne processent pas
```bash
# Vérifier connexion Redis
docker exec nexusos-workers ping redis

# Vérifier les queues
docker exec nexusos-redis redis-cli KEYS 'bull:*'
```

### Problème: MinIO inaccessible
```bash
# Vérifier le service
docker ps | grep minio

# Accéder à la console
http://minio.votre-domaine.com:9001
```

---

## 📞 Next Steps

1. ✅ Déployer sur Coolify
2. ✅ Configurer le domaine
3. ✅ Exécuter les migrations
4. ✅ Créer le premier tenant
5. ✅ Installer les plugins nécessaires
6. ✅ Configurer les providers IA
7. ✅ Tester les workflows
8. ✅ Activer le monitoring

**Documentation complète**: `infra/docker/coolify.md`

---

**NexusOS** - Ready for production deployment on Coolify! 🚀
