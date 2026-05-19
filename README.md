# NexusOS - Enterprise SaaS Platform

## 🚀 Vision

NexusOS est un système d'exploitation modulaire pour agences marketing, SDR, growth hackers et commerciaux B2B. Inspiré d'Odoo mais orienté prospection, marketing digital, IA et automatisation.

## 📦 Architecture

```
nexusos/
├── apps/                    # Applications principales
│   ├── web/                 # Frontend Next.js
│   ├── api/                 # Backend NestJS
│   └── workers/             # Workers BullMQ
├── packages/                # Packages partagés
│   ├── core/                # Core system (15 modules)
│   │   ├── auth/            # Authentification
│   │   ├── tenants/         # Multi-tenant
│   │   ├── permissions/     # RBAC
│   │   ├── plugin-engine/   # Moteur de plugins
│   │   ├── theme-engine/    # Moteur de thèmes
│   │   ├── event-bus/       # Système événementiel
│   │   ├── billing/         # Facturation
│   │   ├── logs/            # Audit logs
│   │   ├── notifications/   # Notifications
│   │   ├── api-gateway/     # API Gateway
│   │   ├── settings/        # Paramètres
│   │   ├── jobs/            # Jobs queue
│   │   ├── security/        # Sécurité
│   │   ├── marketplace/     # Marketplace
│   │   └── sdk/             # SDK développeur
│   └── ui/                  # UI components library
├── plugins/                 # Plugins officiels
│   ├── crm/                 # CRM complet
│   ├── prospection/         # Prospection B2B
│   ├── emailing/            # Emailing
│   ├── workflows/           # Automatisation
│   ├── ai-engine/           # IA Gateway
│   ├── seo/                 # SEO tools
│   ├── reputation/          # E-réputation
│   ├── analytics/           # Analytics
│   ├── calendar/            # Calendrier
│   ├── files/               # Gestion fichiers
│   ├── social-media/        # Social media
│   ├── landing-pages/       # Landing pages
│   ├── funnels/             # Funnels
│   ├── telephony/           # Téléphonie
│   ├── billing/             # Facturation avancée
│   ├── support/             # Support client
│   └── recruitment/         # Recrutement
├── themes/                  # Thèmes officiels
│   ├── default/             # Thème par défaut
│   ├── dark-modern/         # Thème sombre moderne
│   ├── light-professional/  # Thème clair pro
│   └── custom-white-label/  # White-label custom
├── infra/                   # Infrastructure
│   ├── docker/              # Docker configs
│   ├── kubernetes/          # K8s manifests
│   └── traefik/             # Reverse proxy
├── docs/                    # Documentation
└── tools/                   # Outils de développement
```

## 🛠 Stack Technique

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts / Tremor
- **Real-time**: Socket.io client

### Backend
- **Framework**: NestJS
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 16+
- **ORM**: Prisma
- **Cache**: Redis
- **Queue**: BullMQ
- **Search**: OpenSearch / Elasticsearch
- **Real-time**: Socket.io / WebSockets
- **API**: REST + GraphQL + WebSocket

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optionnel)
- **Reverse Proxy**: Traefik
- **Deployment**: Coolify / Railway / AWS
- **Storage**: MinIO / S3
- **CDN**: Cloudflare

### IA
- **Providers**: OpenAI, Anthropic, Mistral
- **Gateway**: AI Gateway centralisé
- **Agents**: SDRAgent, SEOAgent, ReputationAgent, etc.

## 🔌 Plugin System

Le cœur de NexusOS : TOUT est plugin.

### Structure d'un plugin

```
plugins/crm/
├── plugin.json              # Manifeste
├── signature.json           # Signature
├── migrations/              # Migrations DB
├── backend/                 # Backend NestJS
│   ├── module.ts
│   ├── controllers/
│   ├── services/
│   └── events/
├── frontend/                # Frontend React
│   ├── index.tsx
│   ├── pages/
│   ├── components/
│   └── widgets/
├── locales/                 # i18n
└── assets/                  # Assets
```

### Commands CLI

```bash
# Créer un nouveau plugin
pnpm plugin:create my-plugin

# Développer avec hot-reload
cd plugins/my-plugin
pnpm dev

# Build production
pnpm build

# Publier sur marketplace
pnpm publish
```

## 🎨 Theme Engine

Personnalisation complète de l'UI.

```bash
# Appliquer un thème
POST /api/themes/apply
{
  "themeId": "dark-modern",
  "config": { ... }
}
```

## ⚡ Event Bus

Système événementiel central.

### Events principaux

```typescript
// CRM
lead.created
lead.updated
deal.won
deal.lost

// Marketing
email.sent
email.opened
campaign.completed

// AI
ai.task.finished
ai.content.generated

// Workflow
workflow.triggered
workflow.completed
```

## 🤖 AI Engine

Gateway IA unifié avec fallback automatique.

```typescript
const response = await aiGateway.generate({
  provider: 'auto', // Load balancing
  model: 'gpt-4',
  messages: [...],
  fallback: ['anthropic', 'mistral']
});
```

## 🔐 Sécurité

- RBAC avancé
- Audit logs complets
- Rate limiting
- Plugin sandboxing
- JWT rotation
- OAuth2 / SSO
- 2FA
- CSP headers
- Encrypted secrets

## 📊 Multi-Tenant

Isolation complète des données :
- Row-level isolation (défaut)
- Schema isolation (option)
- Database isolation (enterprise)

## 🚀 Quick Start

```bash
# Installer les dépendances
pnpm install

# Générer Prisma client
pnpm db:generate

# Lancer les migrations
pnpm db:migrate

# Démarrer en développement
pnpm dev

# Build production
pnpm build
```

## 📖 Documentation Complète

Voir [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) pour :
- Architecture détaillée
- Schémas de base de données
- APIs complètes
- SDK développeur
- Stratégie de scaling
- Roadmap technique

## 📄 License

MIT - Voir LICENSE

---

**NexusOS** - Built for scale, designed for extensibility.
