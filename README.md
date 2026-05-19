# NexusOS - Enterprise SaaS Platform

**Plateforme SaaS modulaire de type ERP/CRM enterprise-grade**, spécialisée dans la prospection B2B, le marketing digital, l'IA et l'automatisation.

## 🚀 Quick Start - Déploiement Coolify

### 1. Cloner le repository
```bash
git clone https://github.com/votre-org/nexusos.git
cd nexusos
```

### 2. Copier les variables d'environnement
```bash
cp .env.example .env
# Éditez .env avec vos valeurs
```

### 3. Déployer sur Coolify

Suivez le guide complet: **[infra/docker/coolify.md](infra/docker/coolify.md)**

En résumé:
1. Créez un projet "NexusOS" dans Coolify
2. Ajoutez PostgreSQL, Redis, MinIO, OpenSearch
3. Déployez les 3 services: API, Web, Workers
4. Configurez votre domaine
5. Exécutez les migrations DB

### 4. Vérification
- **Web**: https://votre-domaine.com
- **API**: https://api.votre-domaine.com/docs
- **MinIO**: https://minio.votre-domaine.com

## 📦 Architecture

```
nexusos/
├── apps/
│   ├── api/          # NestJS Backend (Port 4000)
│   ├── web/          # Next.js Frontend (Port 3000)
│   └── workers/      # BullMQ Workers
├── packages/
│   └── core/         # Modules core (15 modules)
├── plugins/          # 18 plugins officiels
├── themes/           # 4 thèmes
├── infra/
│   └── docker/       # Docker & Coolify configs
└── docs/             # Documentation complète
```

## 🔧 Stack Technique

**Frontend**: React, Next.js 14, TypeScript, TailwindCSS, shadcn/ui, Zustand  
**Backend**: NestJS, PostgreSQL, Prisma, Redis, BullMQ, WebSockets  
**Infra**: Docker, Kubernetes-ready, Traefik, MinIO, OpenSearch  
**IA**: OpenAI, Anthropic, Mistral via AI Gateway  

## 🎯 Fonctionnalités

### Core System
- ✅ Multi-tenant natif
- ✅ Plugin engine avancé
- ✅ Theme engine (white-label)
- ✅ Event bus centralisé
- ✅ Workflow engine (type Zapier)
- ✅ AI Gateway multi-provider
- ✅ RBAC avancé
- ✅ Marketplace intégrée

### Plugins Officiels (18)
- CRM, Prospection B2B, Emailing
- LinkedIn & WhatsApp Automation
- SEO, E-réputation
- AI Content Generation
- Analytics, Reporting
- Funnels, Landing Pages
- Calendrier, Facturation
- Et plus...

### AI Agents (8)
- SDR Agent, SEO Agent, Reputation Agent
- Copywriting Agent, Closing Agent
- Audit Agent, Social Media Agent
- Lead Scoring Agent

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture complète (3100+ lignes) |
| [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) | Spécifications techniques |
| [infra/docker/coolify.md](infra/docker/coolify.md) | Guide de déploiement Coolify |

## 🔐 Sécurité

- 5 couches de sécurité
- Plugin sandboxing (VM2)
- Rate limiting
- Audit logs
- JWT rotation
- CSP headers
- Non-root containers

## 💰 Business Model

- 4 tiers: Free, Pro, Business, Enterprise
- Marketplace avec revenue share 70/30
- Credits system pour l'IA
- White-label option

## 🛠️ Développement Local

### Prérequis
- Node.js 20+
- Docker & Docker Compose
- Git

### Installation
```bash
# Installer les dépendances
npm install

# Démarrer les services infra
docker-compose up -d postgres redis minio

# Lancer en développement
npm run dev
```

### Services locaux
- Web: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/docs
- MinIO: http://localhost:9000
- MinIO Console: http://localhost:9001

## 📈 Scaling

- Horizontal: Workers replicables
- Vertical: Ressources ajustables
- Database: Read replicas supportées
- Cache: Redis cluster ready
- Storage: S3-compatible (MinIO)

## 🤝 Contributing

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Push vers la branche
5. Ouvrez une Pull Request

## 📄 License

Propriétaire - Tous droits réservés

## 📞 Support

- Documentation: `/docs`
- API Docs: `/docs` endpoint
- Issues: GitHub Issues
- Email: support@nexusos.com

---

**NexusOS** - Built for scale, designed for growth.
