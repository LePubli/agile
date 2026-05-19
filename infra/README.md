# 🐳 Guide de Déploiement Docker - NexusOS

## 📋 Vue d'ensemble

Ce dossier contient toute la configuration nécessaire pour déployer NexusOS avec Docker et Coolify.

## 🗂️ Structure des Fichiers

```
infra/
├── docker-compose.yml      # Configuration complète des services
├── .env.example           # Template des variables d'environnement
├── DEPLOYMENT.md          # Guide complet de déploiement
└── start.sh               # Script de démarrage rapide
```

## 🚀 Démarrage Rapide

### 1. Préparer l'environnement

```bash
cd infra
cp .env.example .env
# Éditez .env avec vos valeurs
```

### 2. Démarrer les services

```bash
# Méthode recommandée
./start.sh up

# Ou manuellement
docker compose up -d
```

### 3. Vérifier le statut

```bash
docker compose ps
docker compose logs -f
```

## 📦 Services Inclus

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | Base de données principale |
| redis | 6379 | Cache & file d'attente |
| minio | 9000/9001 | Stockage objets (S3-compatible) |
| opensearch | 9200 | Moteur de recherche (optionnel) |
| api | 3000 | API NestJS |
| web | 3001 | Frontend Next.js |
| workers | - | Workers BullMQ |

## 🔧 Commandes Utiles

### Gestion des services

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Redémarrer
docker compose restart

# Reconstruire
docker compose build --no-cache

# Voir les logs
docker compose logs -f api
docker compose logs -f web
docker compose logs -f workers
```

### Base de données

```bash
# Exécuter les migrations
docker compose exec api npx prisma migrate deploy

# Seeder la base
docker compose exec api npx prisma db seed

# Backup PostgreSQL
docker compose exec postgres pg_dump -U nexusos nexusos > backup.sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U nexusos nexusos
```

### Monitoring

```bash
# Status des services
docker compose ps

# Ressources utilisées
docker stats

# Logs en temps réel
docker compose logs -f --tail=100
```

## 🎯 Déploiement sur Coolify

### Option 1: Git Repository (Recommandé)

1. Pusher le code sur Git
2. Dans Coolify: Add New → Git Repository
3. Sélectionner Docker Compose comme Build Pack
4. Copier le contenu de `docker-compose.yml`
5. Ajouter les variables d'environnement

### Option 2: Docker Compose Direct

1. Dans Coolify: Add New → Docker Compose
2. Coller le contenu de `docker-compose.yml`
3. Configurer les variables d'environnement
4. Déployer

## 🔐 Sécurité

### Variables critiques à changer

```bash
# Dans .env
POSTGRES_PASSWORD=<generate-secure-password>
REDIS_PASSWORD=<generate-secure-password>
MINIO_ROOT_PASSWORD=<generate-secure-password>
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
```

### Bonnes pratiques

- ✅ Ne jamais committer `.env`
- ✅ Utiliser des mots de passe forts
- ✅ Activer HTTPS via Coolify
- ✅ Limiter l'accès MinIO au réseau interne
- ✅ Sauvegarder régulièrement la base de données
- ✅ Mettre à jour les images Docker régulièrement

## 📊 Scaling

### Horizontal (Workers)

```yaml
# Dans docker-compose.yml
workers:
  deploy:
    replicas: 3
```

### Vertical (Ressources)

```yaml
# Dans docker-compose.yml
api:
  deploy:
    resources:
      limits:
        memory: 4G
        cpus: '2.0'
```

## 💾 Backups

### Automatisés avec Coolify

Coolify gère automatiquement les backups:
- PostgreSQL: quotidien
- MinIO: hebdomadaire
- Redis: optionnel

### Manuels

```bash
# PostgreSQL
docker compose exec postgres pg_dump -U nexusos nexusos | gzip > backup-$(date +%Y%m%d).sql.gz

# MinIO
mc cp -r myminio/nexusos-assets ./backup-minio/

# Redis
docker compose exec redis redis-cli --rdb /backups/dump.rdb SAVE
```

## 🆘 Troubleshooting

### Les containers ne démarrent pas

```bash
# Vérifier les logs
docker compose logs

# Vérifier les ressources
docker stats

# Redémarrer
docker compose down && docker compose up -d
```

### Erreur de connexion DB

```bash
# Vérifier que PostgreSQL est prêt
docker compose exec postgres pg_isready

# Vérifier les credentials
docker compose logs postgres | grep password
```

### Problèmes de mémoire

```bash
# Augmenter les limites dans docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
```

## 📈 Monitoring Avancé

### Prometheus + Grafana (Optionnel)

```bash
# Créer docker-compose.monitoring.yml
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Health Checks

```bash
# API
curl http://localhost:3000/health

# Web
curl http://localhost:3001/health

# PostgreSQL
docker compose exec postgres pg_isready

# Redis
docker compose exec redis redis-cli ping

# MinIO
curl http://localhost:9000/minio/health/live
```

## 🔄 Mises à Jour

### Automatique (Git + Coolify)

Coolify peut auto-déploier à chaque push sur `main`.

### Manuelle

```bash
# Sur le serveur
git pull
docker compose pull
docker compose up -d --build
```

## 📞 Support

- Documentation: `/docs/ARCHITECTURE.md`
- Guide de déploiement: `DEPLOYMENT.md`
- Issues: GitHub Repository

---

**Déployé avec ❤️ par NexusOS Team**
