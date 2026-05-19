# ✅ Checklist de Déploiement - NexusOS

## 📋 Avant le Déploiement

### Code & Repository
- [ ] Code pushé sur GitHub/GitLab
- [ ] Branche `main` à jour
- [ ] `.env.example` présent avec toutes les variables
- [ ] `docker-compose.yml` validé
- [ ] Dockerfiles présents (api, web, workers)

### Secrets & Configuration
- [ ] Générer mot de passe PostgreSQL fort
- [ ] Générer mot de passe Redis fort
- [ ] Générer JWT_SECRET (openssl rand -base64 32)
- [ ] Générer REFRESH_TOKEN_SECRET
- [ ] Configurer clés API IA (OpenAI, Anthropic, Mistral)
- [ ] Configurer SMTP (optionnel)

### Domaine & DNS
- [ ] Domaine acheté
- [ ] Enregistrements DNS configurés
- [ ] SSL via Let's Encrypt (automatique avec Coolify)

---

## 🚀 Pendant le Déploiement

### Infrastructure (Coolify)
- [ ] Projet créé dans Coolify
- [ ] PostgreSQL déployé et healthy
- [ ] Redis déployé et healthy
- [ ] MinIO déployé (optionnel)
- [ ] OpenSearch déployé (optionnel)

### Applications
- [ ] API buildée et démarrée
- [ ] Web buildé et démarré
- [ ] Workers démarrés
- [ ] Health checks passing

### Base de Données
- [ ] Migrations exécutées (`prisma migrate deploy`)
- [ ] Seed exécuté (`prisma db seed`)
- [ ] Connexion DB fonctionnelle

---

## ✅ Après le Déploiement

### Tests Fonctionnels
- [ ] Page d'accueil accessible
- [ ] Login/Register fonctionne
- [ ] API répond sur `/health`
- [ ] WebSocket connecté
- [ ] Plugins chargés

### Sécurité
- [ ] HTTPS activé
- [ ] Mots de passe par défaut changés
- [ ] Rate limiting actif
- [ ] CORS configuré

### Monitoring
- [ ] Logs visibles dans Coolify
- [ ] Métriques CPU/RAM OK
- [ ] Alertes configurées (optionnel)

### Sauvegardes
- [ ] Backup PostgreSQL automatique
- [ ] Backup Redis (optionnel)
- [ ] Backup MinIO (optionnel)

---

## 🎯 Mise en Production

### Communication
- [ ] Email de bienvenue configuré
- [ ] Documentation utilisateur prête
- [ ] Support technique organisé

### Performance
- [ ] CDN configuré (optionnel)
- [ ] Cache Redis actif
- [ ] Images optimisées

### SEO & Analytics
- [ ] Google Analytics (optionnel)
- [ ] Sitemap généré
- [ ] Meta tags configurés

---

## 🆘 En Cas de Problème

### API ne démarre pas
```bash
# Vérifier logs
docker-compose logs api

# Vérifier DB
docker exec nexus-api ping postgres

# Rebuild
docker-compose build api
docker-compose up -d api
```

### Frontend ne se connecte pas
- [ ] Vérifier `NEXT_PUBLIC_API_URL`
- [ ] Vérifier CORS dans l'API
- [ ] Rebuild frontend

### Erreur de migration
```bash
docker exec nexus-api npx prisma migrate reset
docker exec nexus-api npx prisma migrate deploy
```

---

## 📞 Contacts & Support

- **Docs**: `/docs/ARCHITECTURE.md`
- **Guide Coolify**: `/COOLIFY_DEPLOYMENT.md`
- **Quick Start**: `/QUICKSTART.md`
- **Issues**: https://github.com/votre-repo/nexusos/issues

**Déploiement réussi !** 🎉
