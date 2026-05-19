# 🚀 Déploiement NexusOS sur Coolify - Résumé Exécutif

## ✅ Ce qui a été créé pour toi

### Fichiers Docker/Infrastructures

| Fichier | Description |
|---------|-------------|
| `infra/docker-compose.yml` | Configuration complète (PostgreSQL, Redis, MinIO, API, Web, Workers) |
| `infra/.env.example` | Template des variables d'environnement |
| `infra/start.sh` | Script de démarrage rapide |
| `infra/README.md` | Guide Docker complet |
| `infra/DEPLOYMENT.md` | Guide de déploiement Coolify pas à pas |
| `apps/api/Dockerfile` | Dockerfile multi-stage pour l'API NestJS |
| `apps/web/Dockerfile` | Dockerfile multi-stage pour le frontend Next.js |
| `apps/workers/Dockerfile` | Dockerfile pour les workers BullMQ |
| `.dockerignore` | Filtres pour optimiser les builds Docker |
| `packages/core/prisma/schema.prisma` | Schéma de base de données complet |

## 🎯 3 Étapes pour Déployer

### Étape 1: Préparer les Variables

```bash
cd /workspace/infra
cp .env.example .env
nano .env  # ou ton éditeur préféré
```

**Variables CRITIQUES à changer:**
```bash
POSTGRES_PASSWORD=<ton-mot-de-passe-sécurisé>
REDIS_PASSWORD=<ton-mot-de-passe-sécurisé>
MINIO_ROOT_PASSWORD=<ton-mot-de-passe-sécurisé>
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
AI_OPENAI_API_KEY=sk-...
NEXT_PUBLIC_API_URL=https://api.tondomaine.com
```

### Étape 2: Push sur Git

```bash
cd /workspace
git add .
git commit -m "Initial NexusOS deployment ready for Coolify"
git push origin main
```

### Étape 3: Configurer dans Coolify

1. **Connecte-toi à Coolify**
2. **Add New Resource** → **Git Repository**
3. **Sélectionne ton repo** et branche `main`
4. **Build Pack**: `Docker Compose`
5. **Colle** le contenu de `infra/docker-compose.yml`
6. **Ajoute les variables** depuis ton `.env`
7. **Deploy!** 🚀

## 📦 Services Déployés

```
┌─────────────────────────────────────────────┐
│              COOLIFY MANAGED                │
│  ┌─────────────────────────────────────┐    │
│  │         TRAEFIK (Proxy/SSL)         │    │
│  └─────────────────────────────────────┘    │
│           ↓        ↓         ↓               │
│  ┌──────────┐ ┌───────┐ ┌──────────────┐    │
│  │   WEB    │ │  API  │ │   WORKERS    │    │
│  │ :3001    │ │ :3000 │ │   (async)    │    │
│  └──────────┘ └───────┘ └──────────────┘    │
│           ↓        ↓         ↓               │
│  ┌──────────┐ ┌───────┐ ┌──────────────┐    │
│  │ POSTGRES │ │ REDIS │ │    MINIO     │    │
│  │          │ │       │ │   (S3-like)  │    │
│  └──────────┘ └───────┘ └──────────────┘    │
└─────────────────────────────────────────────┘
```

## 🔗 URLs Après Déploiement

| Service | URL Type |
|---------|----------|
| Web App | `https://app.tondomaine.com` |
| API | `https://api.tondomaine.com` |
| API Docs | `https://api.tondomaine.com/docs` |
| MinIO Console | `https://minio.tondomaine.com` |
| WebSocket | `wss://api.tondomaine.com/ws` |

## ⚡ Commandes Utiles Post-Déploiement

```bash
# Via SSH sur ton serveur Coolify

# Voir les logs
docker compose logs -f api
docker compose logs -f web

# Status des services
docker compose ps

# Redémarrer un service
docker compose restart api

# Migrations DB
docker compose exec api npx prisma migrate deploy

# Backup DB
docker compose exec postgres pg_dump -U nexusos nexusos > backup.sql
```

## 🛡️ Sécurité Checklist

- [ ] ✅ Changer TOUS les mots de passe par défaut
- [ ] ✅ Générer JWT_SECRET et ENCRYPTION_KEY uniques
- [ ] ✅ Configurer HTTPS (automatique via Coolify)
- [ ] ✅ Ajouter tes clés API IA
- [ ] ✅ Configurer les backups automatiques dans Coolify
- [ ] ✅ Ne jamais committer `.env` dans Git

## 💰 Coût Estimé Infrastructure

Pour ~100 tenants actifs:

| Ressource | Spécification | Coût/mois |
|-----------|--------------|-----------|
| VPS | 4 vCPU, 8GB RAM, 80GB SSD | ~$20-40 |
| Domaine | .com | ~$12/an |
| **Total** | | **~$30-50/mois** |

Coolify est **gratuit** (open-source).

## 📈 Scaling Path

### Phase 1: Démarrage (0-100 tenants)
- 1 serveur: 4 vCPU, 8GB RAM
- Tous les services sur une machine

### Phase 2: Croissance (100-1000 tenants)
- 2-3 serveurs
- Séparation API/Workers
- Redis cluster

### Phase 3: Scale (1000+ tenants)
- Kubernetes
- Microservices séparés
- CDN pour assets
- Database réplication

## 🆘 Support & Next Steps

### Après le déploiement:

1. **Créer le premier tenant** via API
2. **Configurer les plugins** nécessaires
3. **Personnaliser le thème**
4. **Inviter l'équipe**
5. **Tester les workflows**
6. **Connecter les providers IA**

### Documentation Complète:

- Architecture: `/docs/ARCHITECTURE.md`
- Specs Techniques: `/docs/TECHNICAL_SPEC.md`
- Guide Docker: `/infra/README.md`
- Guide Déploiement: `/infra/DEPLOYMENT.md`

---

**Prêt à déployer? Lance-toi! 🚀**

Tu as tout ce qu'il faut pour une prod enterprise-grade.
