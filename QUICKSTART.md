# 🚀 Quick Start - NexusOS

Démarrage rapide pour développer et déployer NexusOS.

## ⚡ Développement Local (5 minutes)

### 1. Prérequis
```bash
# Vérifier les versions
node --version  # >= 20.x
npm --version   # >= 9.x
docker --version
docker-compose --version
```

### 2. Installation
```bash
# Cloner le repo
git clone https://github.com/VOTRE_USER/nexusos.git
cd nexusos

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Modifier .env avec vos clés API (optionnel pour dev)
nano .env
```

### 3. Lancer avec Docker Compose
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### 4. Exécuter les migrations
```bash
# Dans le container API
docker exec nexus-api npx prisma migrate deploy
docker exec nexus-api npx prisma db seed
```

### 5. Accéder à l'application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs
- **MinIO Console**: http://localhost:9001
- **OpenSearch**: http://localhost:9200

---

## 🎯 Déploiement Coolify (10 minutes)

Suivez le guide complet : [`COOLIFY_DEPLOYMENT.md`](./COOLIFY_DEPLOYMENT.md)

### Résumé des étapes :
1. Pusher le code sur GitHub/GitLab
2. Créer un projet dans Coolify
3. Déployer via Docker Compose
4. Exécuter les migrations
5. Configurer les domaines

---

## 📁 Structure du Projet

```
nexusos/
├── apps/
│   ├── api/          # Backend NestJS
│   ├── web/          # Frontend Next.js
│   └── workers/      # Workers BullMQ
├── packages/core/    # Modules core
├── plugins/          # Plugins officiels
├── themes/           # Thèmes
├── infra/            # Infrastructure Docker
└── docs/             # Documentation
```

---

## 🔧 Commandes Utiles

### Développement
```bash
npm run dev          # Lancer tous les services en dev
npm run dev:api      # API seulement
npm run dev:web      # Frontend seulement
npm run build        # Build production
npm run lint         # Vérifier le code
```

### Docker
```bash
docker-compose up -d              # Démarrer
docker-compose down               # Arrêter
docker-compose logs -f            # Logs
docker-compose restart api        # Redémarrer API
docker-compose exec api bash      # Shell dans API
```

### Base de données
```bash
docker exec nexus-postgres psql -U nexus -d nexus_db
docker exec nexus-api npx prisma studio
```

---

## 🆘 Support

- **Documentation complète**: `/docs/ARCHITECTURE.md`
- **Spécifications techniques**: `/docs/TECHNICAL_SPEC.md`
- **Guide Coolify**: `/COOLIFY_DEPLOYMENT.md`
- **Issues**: https://github.com/votre-repo/nexusos/issues

---

## ✅ Prochaines Étapes

1. [ ] Configurer vos clés API IA
2. [ ] Créer votre premier compte admin
3. [ ] Installer des plugins
4. [ ] Configurer les workflows
5. [ ] Personnaliser le thème

**Prêt à lancer votre plateforme SaaS !** 🚀
