# 🚀 Guide de Déploiement Coolify - NexusOS

Ce guide vous accompagne pas à pas pour déployer NexusOS sur Coolify.

## 📋 Prérequis

- Instance Coolify installée et fonctionnelle
- Domaine configuré (optionnel mais recommandé)
- Clés API pour les providers IA (OpenAI, Anthropic, Mistral)

## 🎯 Étape 1 : Préparer le Repository

```bash
# Initialiser Git
git init
git add .
git commit -m "feat: NexusOS initial commit - Ready for Coolify"

# Créer un repository GitHub/GitLab
git remote add origin https://github.com/VOTRE_USER/nexusos.git
git branch -M main
git push -u origin main
```

## 🎯 Étape 2 : Configuration dans Coolify

### 2.1 Créer un Nouveau Projet

1. Connectez-vous à Coolify
2. Cliquez sur **"Create New Project"**
3. Nommez-le `NexusOS`

### 2.2 Ajouter les Ressources

Coolify peut gérer automatiquement PostgreSQL et Redis via Docker Compose, mais nous allons utiliser notre `docker-compose.yml` complet.

**Option A : Déploiement Docker Compose (Recommandé)**

1. Dans votre projet, cliquez sur **"Add Service"**
2. Sélectionnez **"Docker Compose"**
3. Collez le contenu du `docker-compose.yml` OU pointez vers votre repo Git
4. Coolify détectera automatiquement tous les services

**Option B : Services Séparés**

Si vous préférez gérer chaque service individuellement :

#### Base de Données PostgreSQL
- **Nom**: `nexus-postgres`
- **Image**: `postgres:16-alpine`
- **Variables d'environnement**:
  ```
  POSTGRES_USER=nexus
  POSTGRES_PASSWORD=<générer_mot_de_passe_fort>
  POSTGRES_DB=nexus_db
  ```
- **Volume**: `/var/lib/postgresql/data`

#### Redis
- **Nom**: `nexus-redis`
- **Image**: `redis:7-alpine`
- **Commande**: `redis-server --appendonly yes --requirepass <mot_de_passe>`
- **Volume**: `/data`

#### MinIO (Optionnel)
- **Nom**: `nexus-minio`
- **Image**: `minio/minio:latest`
- **Commande**: `server /data --console-address ":9001"`
- **Variables**:
  ```
  MINIO_ROOT_USER=nexusadmin
  MINIO_ROOT_PASSWORD=<mot_de_passe_fort>
  ```

### 2.3 Déployer l'API (Backend NestJS)

1. **Add Resource** → **Git Repository**
2. Sélectionnez votre repo `nexusos`
3. **Build Pack**: `Nixpacks` ou `Dockerfile`
4. **Dockerfile**: `apps/api/Dockerfile`
5. **Domain**: `api.votre-domaine.com` (optionnel)
6. **Port**: `4000`
7. **Variables d'environnement** (copiez depuis `.env.example`):
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=postgresql://nexus:<password>@nexus-postgres:5432/nexus_db
   REDIS_HOST=nexus-redis
   REDIS_PORT=6379
   REDIS_PASSWORD=<redis_password>
   JWT_SECRET=<générer_clé_secrète>
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   MISTRAL_API_KEY=...
   ```

### 2.4 Déployer le Frontend (Next.js)

1. **Add Resource** → **Git Repository**
2. Même repo `nexusos`
3. **Build Pack**: `Nixpacks` ou `Dockerfile`
4. **Dockerfile**: `apps/web/Dockerfile`
5. **Domain**: `app.votre-domaine.com`
6. **Port**: `3000`
7. **Variables d'environnement**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
   NEXT_PUBLIC_APP_NAME=NexusOS
   ```

### 2.5 Déployer les Workers

1. **Add Resource** → **Git Repository**
2. Même repo `nexusos`
3. **Dockerfile**: `apps/workers/Dockerfile`
4. **Port**: Aucun (service interne)
5. **Variables d'environnement**: Mêmes que l'API +
   ```
   WORKER_CONCURRENCY=5
   API_INTERNAL_URL=http://nexus-api:4000
   ```

## 🎯 Étape 3 : Exécuter les Migrations

Une fois l'API déployée et fonctionnelle :

### Via Coolify Console
1. Allez sur le service `nexus-api`
2. Ouvrez la **Console**
3. Exécutez :
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Via Commande Locale (si accès SSH)
```bash
coolify exec nexus-api npx prisma migrate deploy
coolify exec nexus-api npx prisma db seed
```

## 🎯 Étape 4 : Vérification

### Health Checks
- **API**: `https://api.votre-domaine.com/health`
- **Web**: `https://app.votre-domaine.com/health`

### Logs
Vérifiez les logs dans Coolify pour chaque service :
- API : Doit afficher "NestJS application started"
- Web : Doit afficher "Ready on http://0.0.0.0:3000"
- Workers : Doit afficher "Worker started"

## 🎯 Étape 5 : Configuration DNS (Optionnel)

Si vous utilisez des domaines personnalisés :

```
# Enregistrements DNS à ajouter chez votre registrar
A     api      -> IP_de_votre_instance_Coolify
A     app      -> IP_de_votre_instance_Coolify
CNAME www      -> app.votre-domaine.com
```

Dans Coolify :
1. Allez sur chaque service
2. **Settings** → **Domains**
3. Ajoutez vos domaines personnalisés
4. Coolify gérera automatiquement les certificats SSL via Let's Encrypt

## 🎯 Étape 6 : Premier Login

1. Accédez à `https://app.votre-domaine.com`
2. Créez votre premier compte administrateur
3. Configurez vos premiers plugins
4. Activez les modules souhaités

## 🔧 Dépannage

### L'API ne démarre pas
```bash
# Vérifier les logs
coolify logs nexus-api

# Vérifier la connexion DB
coolify exec nexus-api ping postgres
```

### Erreur de migration
```bash
# Reset et re-migrate
coolify exec nexus-api npx prisma migrate reset
coolify exec nexus-api npx prisma migrate deploy
```

### Workers ne se connectent pas
- Vérifiez que `REDIS_HOST` pointe vers le bon service
- Vérifiez le mot de passe Redis
- Redémarrez le service workers

## 📊 Monitoring

Coolify fournit nativement :
- ✅ Métriques CPU/RAM
- ✅ Logs en temps réel
- ✅ Status des services
- ✅ Alertes (à configurer)

Pour un monitoring avancé, installez Prometheus + Grafana via Coolify Marketplace.

## 🎉 C'est terminé !

Votre NexusOS est maintenant déployé et opérationnel sur Coolify.

**Prochaines étapes recommandées :**
1. Configurer les sauvegardes automatiques (PostgreSQL)
2. Mettre en place la surveillance (uptime, performance)
3. Activer les notifications d'alerte
4. Installer vos premiers plugins
5. Configurer l'IA avec vos clés API

---

**Support & Documentation :**
- Docs complètes : `/docs/ARCHITECTURE.md`
- Spécifications techniques : `/docs/TECHNICAL_SPEC.md`
- Issues GitHub : https://github.com/votre-repo/nexusos/issues
