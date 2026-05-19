# ==================== GUIDE DE DÉPLOIEMENT COOLIFY ====================

# 🚀 Déploiement de NexusOS sur Coolify

Ce guide vous accompagne pas à pas pour déployer NexusOS sur Coolify.

## 📋 Prérequis

- Serveur avec Docker et Coolify installé
- Domaine configuré (ex: `api.yourdomain.com`, `app.yourdomain.com`)
- Clés API pour les providers IA (optionnel mais recommandé)

## 🔧 Étape 1 : Préparation des Variables d'Environnement

1. Copiez le fichier `.env.example` vers `.env` :
```bash
cd /workspace/infra
cp .env.example .env
```

2. Éditez `.env` et personnalisez :
```bash
# Changez TOUS les mots de passe par défaut
POSTGRES_PASSWORD=votre_mot_de_passe_super_secure
REDIS_PASSWORD=votre_mot_de_passe_redis
MINIO_ROOT_PASSWORD=votre_mot_de_passe_minio

# Générez des secrets cryptographiques
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Ajoutez vos clés API IA
AI_OPENAI_API_KEY=sk-votre-clé-openai
AI_ANTHROPIC_API_KEY=sk-ant-votre-clé-anthropic
AI_MISTRAL_API_KEY=votre-clé-mistral

# Configurez vos domaines
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws
```

## 🎯 Étape 2 : Configuration dans Coolify

### Option A : Déploiement via Git (Recommandé)

1. **Push votre code sur Git** :
```bash
git add .
git commit -m "Initial NexusOS deployment"
git push origin main
```

2. **Dans Coolify** :
   - Allez dans votre projet
   - Cliquez sur "Add New" → "Resource"
   - Sélectionnez "Git Repository"
   - Entrez l'URL de votre repository
   - Branche : `main`
   - Build Pack : `Nixpacks` ou `Docker Compose`

3. **Configurez Docker Compose** :
   - Dans les paramètres du service
   - Section "Docker Compose"
   - Collez le contenu de `infra/docker-compose.yml`
   - EXCLUZ les services suivants de Coolify (gérés séparément) :
     - traefik (Coolify gère déjà le proxy)
     - opensearch (optionnel, à ajouter plus tard)

4. **Variables d'environnement dans Coolify** :
   - Allez dans "Environment Variables"
   - Ajoutez toutes les variables de votre `.env`
   - Coolify les injectera automatiquement

### Option B : Déploiement Direct Docker Compose

1. **Sur votre serveur** :
```bash
cd /workspace/infra
docker compose up -d
```

2. **Vérifiez les logs** :
```bash
docker compose logs -f
```

## 🌐 Étape 3 : Configuration des Domaines

Dans Coolify, configurez les domaines suivants :

| Service | Domaine | Port |
|---------|---------|------|
| Web | `app.yourdomain.com` | 3001 |
| API | `api.yourdomain.com` | 3000 |
| MinIO Console | `minio.yourdomain.com` | 9001 |

**Note** : Coolify gère automatiquement :
- Les certificats SSL (Let's Encrypt)
- Le reverse proxy
- La redirection HTTPS

## 🗄️ Étape 4 : Initialisation de la Base de Données

Après le premier déploiement :

```bash
# Attendez que PostgreSQL soit prêt
docker compose exec postgres pg_isready

# Exécutez les migrations Prisma
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

## ✅ Étape 5 : Vérification

1. **Health Checks** :
```bash
curl https://api.yourdomain.com/health
curl https://app.yourdomain.com/health
```

2. **Logs des services** :
```bash
docker compose logs api
docker compose logs web
docker compose logs workers
docker compose logs postgres
docker compose logs redis
docker compose logs minio
```

3. **Accès aux interfaces** :
   - Web App : https://app.yourdomain.com
   - API Swagger : https://api.yourdomain.com/docs
   - MinIO Console : https://minio.yourdomain.com

## 🔐 Sécurité Post-Déploiement

1. **Changez les mots de passe par défaut** dans Coolify
2. **Activez le firewall** du serveur
3. **Configurez les backups** dans Coolify :
   - PostgreSQL : quotidien
   - MinIO : hebdomadaire
   - Redis : optionnel

4. **Limitez l'accès MinIO** :
   - Ne jamais exposer le port 9000 publiquement
   - Utiliser uniquement via l'API interne

## 📊 Monitoring

Coolify fournit nativement :
- Health checks en temps réel
- Logs centralisés
- Métriques de ressources
- Alertes automatiques

Pour un monitoring avancé :
```bash
# Ajoutez Prometheus + Grafana (optionnel)
docker compose -f docker-compose.monitoring.yml up -d
```

## 🔄 Mises à Jour

### Mise à jour automatique (Git)
Coolify peut auto-déploier à chaque push :
- Allez dans "Settings" → "Auto Deploy"
- Activez pour la branche `main`

### Mise à jour manuelle
```bash
# Sur le serveur
cd /workspace
git pull
docker compose pull
docker compose up -d --build
```

## 🆘 Troubleshooting

### Les containers ne démarrent pas
```bash
# Vérifiez les logs
docker compose logs

# Redémarrez les services
docker compose down
docker compose up -d
```

### Erreur de connexion à la base de données
```bash
# Vérifiez que PostgreSQL est prêt
docker compose exec postgres pg_isready

# Vérifiez les credentials
docker compose logs postgres | grep password
```

### Problèmes de mémoire
Ajustez les limites dans `docker-compose.yml` :
```yaml
deploy:
  resources:
    limits:
      memory: 4G  # Augmentez si nécessaire
```

### Workers ne traitent pas les jobs
```bash
# Vérifiez les logs workers
docker compose logs workers

# Redémarrez les workers
docker compose restart workers
```

## 📈 Scaling

### Scale horizontal des workers
Dans `docker-compose.yml` :
```yaml
workers:
  deploy:
    replicas: 3  # Augmentez selon la charge
```

### Scale vertical
Augmentez les ressources dans Coolify :
- CPU : 2 → 4 cores
- RAM : 4GB → 8GB

## 💾 Backups

Coolify gère automatiquement les backups :

1. **Configuration** :
   - Allez dans "Settings" → "Backups"
   - Configurez la fréquence
   - Choisissez la destination (S3, local, etc.)

2. **Backup manuel** :
```bash
# PostgreSQL
docker compose exec postgres pg_dump -U nexusos nexusos > backup.sql

# MinIO
mc cp -r myminio/nexusos-assets ./backup-minio/
```

3. **Restore** :
```bash
# PostgreSQL
cat backup.sql | docker compose exec -T postgres psql -U nexusos nexusos

# MinIO
mc cp -r ./backup-minio/ myminio/nexusos-assets
```

## 🎯 Prochaines Étapes

Après le déploiement :

1. **Créez votre premier tenant** via l'API
2. **Configurez les plugins** nécessaires
3. **Personnalisez le thème**
4. **Invitez votre équipe**
5. **Configurez les workflows**
6. **Connectez vos providers IA**

## 📞 Support

- Documentation complète : `/docs/ARCHITECTURE.md`
- Spécifications techniques : `/docs/TECHNICAL_SPEC.md`
- Issues GitHub : [votre-repo]/issues

---

**Déployé avec ❤️ par NexusOS Team**
