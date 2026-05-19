# NexusOS - Enterprise SaaS Platform Architecture

## Vision

NexusOS est un système d'exploitation modulaire pour agences marketing, SDR, growth hackers et commerciaux B2B. Inspiré d'Odoo mais orienté prospection, marketing digital, IA et automatisation.

## Table des Matières

1. [Architecture Globale](#architecture-globale)
2. [Core System](#core-system)
3. [Plugin Engine](#plugin-engine)
4. [Theme Engine](#theme-engine)
5. [Event Bus](#event-bus)
6. [Workflow Engine](#workflow-engine)
7. [AI Engine](#ai-engine)
8. [Multi-Tenant System](#multi-tenant-system)
9. [Dynamic UI Engine](#dynamic-ui-engine)
10. [Marketplace](#marketplace)
11. [Security](#security)
12. [Database Schema](#database-schema)
13. [APIs](#apis)
14. [Developer SDK](#developer-sdk)
15. [Scaling Strategy](#scaling-strategy)
16. [Roadmap Technique](#roadmap-technique)

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LOAD BALANCER (Traefik)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│   Frontend    │          │   API Gateway │          │   Workers     │
│   Next.js     │◄────────►│   NestJS      │◄────────►│   BullMQ      │
│   MicroFE     │          │   CQRS        │          │   Async Jobs  │
└───────────────┘          └───────────────┘          └───────────────┘
        │                           │                           │
        │              ┌────────────┴────────────┐              │
        ▼              ▼                         ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT BUS (Redis/NATS)                          │
└─────────────────────────────────────────────────────────────────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│  PostgreSQL   │          │    Redis      │          │  OpenSearch   │
│  Prisma ORM   │          │   Cache/Pub   │          │   Search      │
│  Multi-tenant │          │   Sub/Queue   │          │   Analytics   │
└───────────────┘          └───────────────┘          └───────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         OBJECT STORAGE (MinIO)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Principes Fondamentaux

1. **Core Minimaliste** : Le core ne contient QUE l'infrastructure essentielle
2. **Tout est Plugin** : Aucune fonctionnalité métier dans le core
3. **Event-Driven** : Communication asynchrone via Event Bus
4. **Multi-Tenant Native** : Isolation complète des données
5. **Extensibilité Totale** : Plugins peuvent tout étendre

---

## Core System

Le core est extrêmement léger et ne contient que :

### Modules Core

```
packages/core/
├── auth/                    # Authentification (JWT, OAuth2, SSO, 2FA)
├── tenants/                 # Gestion multi-tenant
├── permissions/             # RBAC avancé
├── plugin-engine/           # Moteur de plugins
├── theme-engine/            # Moteur de thèmes
├── event-bus/               # Système événementiel
├── billing/                 # Facturation & abonnements
├── logs/                    # Audit logs & monitoring
├── notifications/           # Notifications temps réel
├── api-gateway/             # Routeur API principal
├── settings/                # Paramètres globaux
├── jobs/                    # Orchestration BullMQ
├── security/                # Sécurité (CSP, rate limiting, encryption)
├── marketplace/             # Marketplace interne
└── sdk/                     # SDK développeur
```

### Structure de Données Core

```prisma
// Tenant isolation
model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  plan      String
  status    String   @default("active")
  settings  Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  users     User[]
  plugins   TenantPlugin[]
  themes    TenantTheme[]
  workspaces Workspace[]
}

model User {
  id        String   @id @default(uuid())
  email     String
  password  String
  tenantId  String
  roles     Role[]
  permissions Permission[]
  createdAt DateTime @default(now())
  
  @@index([tenantId])
}

model Plugin {
  id          String   @id @default(uuid())
  name        String   @unique
  version     String
  description String
  author      String
  manifest    Json     // plugin.json
  routes      Json     // Routes exposées
  permissions Json     // Permissions requises
  dependencies String[] // Plugins dépendants
  isCore      Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  installations TenantPlugin[]
}

model TenantPlugin {
  id        String   @id @default(uuid())
  tenantId  String
  pluginId  String
  version   String
  config    Json     // Configuration spécifique tenant
  isActive  Boolean  @default(true)
  installedAt DateTime @default(now())
  
  @@unique([tenantId, pluginId])
  @@index([tenantId])
}
```

---

## Plugin Engine

Système de plugins inspiré de Odoo, VSCode et WordPress.

### Architecture Plugin

```
plugins/crm/
├── plugin.json              # Manifeste du plugin
├── signature.json           # Signature cryptographique
├── migrations/              # Migrations DB
│   ├── 001_initial.sql
│   └── 002_add_fields.sql
├── backend/                 # Backend NestJS
│   ├── module.ts
│   ├── controllers/
│   ├── services/
│   ├── entities/
│   └── events/
├── frontend/                # Frontend React
│   ├── index.tsx
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── widgets/
├── locales/                 # Internationalisation
│   ├── en.json
│   └── fr.json
└── assets/                  # Assets statiques
    ├── icons/
    └── images/
```

### plugin.json Schema

```json
{
  "name": "nexus-crm",
  "version": "1.0.0",
  "displayName": "CRM Module",
  "description": "Customer Relationship Management complet",
  "author": "NexusOS Team",
  "license": "MIT",
  "homepage": "https://nexusos.com/plugins/crm",
  "repository": "github:nexusos/plugin-crm",
  
  "engine": {
    "backend": ">=2.0.0",
    "frontend": ">=2.0.0"
  },
  
  "dependencies": [
    "nexus-core@>=2.0.0",
    "nexus-auth@>=2.0.0"
  ],
  
  "optionalDependencies": [
    "nexus-email@>=1.0.0",
    "nexus-workflows@>=1.0.0"
  ],
  
  "routes": [
    {
      "path": "/api/crm",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "path": "/crm",
      "type": "page",
      "component": "DashboardPage"
    }
  ],
  
  "permissions": [
    "crm:read",
    "crm:write",
    "crm:delete",
    "crm:export"
  ],
  
  "menus": [
    {
      "id": "crm-main",
      "label": "CRM",
      "icon": "users",
      "order": 10,
      "children": [
        {"id": "crm-leads", "label": "Leads", "route": "/crm/leads"},
        {"id": "crm-companies", "label": "Companies", "route": "/crm/companies"},
        {"id": "crm-deals", "label": "Deals", "route": "/crm/deals"}
      ]
    }
  ],
  
  "widgets": [
    {
      "id": "pipeline-widget",
      "name": "Pipeline View",
      "component": "PipelineWidget",
      "location": "dashboard"
    }
  ],
  
  "events": {
    "emits": [
      "lead.created",
      "lead.updated",
      "deal.won",
      "deal.lost"
    ],
    "listens": [
      "email.received",
      "task.completed"
    ]
  },
  
  "hooks": {
    "beforeInstall": "scripts/beforeInstall.ts",
    "afterInstall": "scripts/afterInstall.ts",
    "beforeUninstall": "scripts/beforeUninstall.ts",
    "afterUpdate": "scripts/afterUpdate.ts"
  },
  
  "settings": {
    "schema": {
      "pipelineStages": {"type": "array", "default": []},
      "autoAssign": {"type": "boolean", "default": false}
    }
  }
}
```

### Plugin Lifecycle

```typescript
// packages/core/plugin-engine/plugin-manager.ts

interface IPluginManager {
  install(pluginId: string, version?: string): Promise<void>;
  uninstall(pluginId: string): Promise<void>;
  activate(pluginId: string): Promise<void>;
  deactivate(pluginId: string): Promise<void>;
  update(pluginId: string, version: string): Promise<void>;
  list(filters?: PluginFilter): Promise<Plugin[]>;
  get(pluginId: string): Promise<Plugin>;
  validate(plugin: Plugin): Promise<boolean>;
  resolveDependencies(plugin: Plugin): Promise<Plugin[]>;
}

// Hook System
class PluginHooks {
  private hooks: Map<string, Function[]> = new Map();
  
  register(hookName: string, callback: Function): void;
  execute<T>(hookName: string, data: T): Promise<T>;
  remove(hookName: string, callback: Function): void;
}

// Sandboxing
class PluginSandbox {
  private vm: VM;
  
  constructor(plugin: Plugin) {
    this.vm = new VM({
      timeout: 5000,
      sandbox: {
        console,
        Buffer,
        // Restricted globals
      }
    });
  }
  
  run(code: string): any {
    return this.vm.run(code);
  }
}
```

### Hot Reload Development

```typescript
// packages/core/plugin-engine/hot-reload.ts

import chokidar from 'chokidar';

class PluginHotReload {
  watch(pluginPath: string) {
    const watcher = chokidar.watch(pluginPath, {
      ignored: /node_modules|\.git/,
      persistent: true
    });
    
    watcher.on('change', (file) => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        this.reloadPlugin(file);
      }
    });
  }
  
  async reloadPlugin(file: string) {
    // Invalidate cache
    // Rebuild plugin
    // Notify frontend via WebSocket
    // Update route registry
  }
}
```

---

## Theme Engine

Moteur de thèmes ultra-avancé avec white-label complet.

### Architecture Thème

```
themes/dark-modern/
├── theme.json               # Manifeste du thème
├── tokens/                  # Design Tokens
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   ├── shadows.json
│   └── breakpoints.json
├── components/              # Composants override
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Sidebar.tsx
├── layouts/                 # Layouts personnalisés
│   ├── DashboardLayout.tsx
│   └── AuthLayout.tsx
├── styles/                  # Styles globaux
│   └── global.css
└── preview.png              # Preview du thème
```

### theme.json Schema

```json
{
  "name": "dark-modern",
  "version": "1.0.0",
  "displayName": "Dark Modern",
  "description": "Thème sombre moderne avec accents violets",
  "author": "NexusOS Team",
  
  "baseTheme": "default",
  
  "tokens": {
    "colors": {
      "primary": {
        "50": "#f5f3ff",
        "100": "#ede9fe",
        "500": "#8b5cf6",
        "600": "#7c3aed",
        "700": "#6d28d9"
      },
      "background": {
        "primary": "#0f0f0f",
        "secondary": "#1a1a1a",
        "tertiary": "#262626"
      },
      "foreground": {
        "primary": "#ffffff",
        "secondary": "#a3a3a3"
      }
    },
    "typography": {
      "fontFamily": {
        "sans": ["Inter", "system-ui"],
        "mono": ["JetBrains Mono", "monospace"]
      },
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem"
      }
    },
    "spacing": {
      "unit": "4px",
      "scale": [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
    },
    "borderRadius": {
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "full": "9999px"
    }
  },
  
  "overrides": {
    "components": [
      "Button",
      "Card",
      "Input",
      "Sidebar",
      "TopBar"
    ],
    "layouts": [
      "DashboardLayout",
      "AuthLayout"
    ]
  },
  
  "branding": {
    "logo": "/assets/logo.svg",
    "favicon": "/assets/favicon.ico",
    "companyName": "My Company"
  }
}
```

### Theme Provider

```typescript
// packages/core/theme-engine/theme-provider.tsx

interface ThemeContext {
  tokens: ThemeTokens;
  components: ComponentOverrides;
  layouts: LayoutOverrides;
  branding: BrandingConfig;
  setTheme: (themeId: string) => void;
}

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme | null>(null);
  
  useEffect(() => {
    // Load theme from API
    // Apply CSS variables
    // Register component overrides
  }, []);
  
  return (
    <ThemeContext.Provider value={{ ... }}>
      <CSSVariables tokens={theme?.tokens}>
        {children}
      </CSSVariables>
    </ThemeContext.Provider>
  );
};

// Dynamic Component Injection
const ComponentInjector: React.FC<{ name: string }> = ({ name }) => {
  const { components } = useTheme();
  const OverrideComponent = components[name];
  
  if (OverrideComponent) {
    return <OverrideComponent />;
  }
  
  return <DefaultComponent name={name} />;
};
```

---

## Event Bus

Système événementiel central pour communication découplée.

### Events Catalogue

```typescript
// packages/core/event-bus/events.ts

// CRM Events
const CRM_EVENTS = {
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_DELETED: 'lead.deleted',
  COMPANY_ENRICHED: 'company.enriched',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',
  TASK_COMPLETED: 'task.completed'
};

// Marketing Events
const MARKETING_EVENTS = {
  EMAIL_SENT: 'email.sent',
  EMAIL_OPENED: 'email.opened',
  EMAIL_CLICKED: 'email.clicked',
  CAMPAIGN_STARTED: 'campaign.started',
  CAMPAIGN_COMPLETED: 'campaign.completed'
};

// AI Events
const AI_EVENTS = {
  AI_TASK_STARTED: 'ai.task.started',
  AI_TASK_FINISHED: 'ai.task.finished',
  AI_CONTENT_GENERATED: 'ai.content.generated',
  AI_ANALYSIS_COMPLETED: 'ai.analysis.completed'
};

// Workflow Events
const WORKFLOW_EVENTS = {
  WORKFLOW_TRIGGERED: 'workflow.triggered',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
  ACTION_EXECUTED: 'action.executed'
};

// Billing Events
const BILLING_EVENTS = {
  SUBSCRIPTION_CREATED: 'subscription.created',
  INVOICE_PAID: 'invoice.paid',
  PAYMENT_FAILED: 'payment.failed',
  QUOTA_EXCEEDED: 'quota.exceeded'
};
```

### Event Bus Implementation

```typescript
// packages/core/event-bus/event-bus.ts

import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

interface EventPayload<T = any> {
  type: string;
  payload: T;
  metadata: {
    tenantId: string;
    userId?: string;
    timestamp: Date;
    correlationId: string;
  };
}

interface EventHandler<T = any> {
  handle(event: EventPayload<T>): Promise<void>;
}

class EventBus {
  private redis: Redis;
  private localEmitter: EventEmitter;
  private handlers: Map<string, Set<EventHandler>>;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.localEmitter = new EventEmitter();
    this.handlers = new Map();
  }
  
  async publish<T>(event: EventPayload<T>): Promise<void> {
    // Publish to Redis for cross-service communication
    await this.redis.publish(event.type, JSON.stringify(event));
    
    // Also emit locally for same-process handlers
    this.localEmitter.emit(event.type, event);
    
    // Log event for audit
    await this.logEvent(event);
  }
  
  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
      // Subscribe to Redis channel
      this.redis.subscribe(eventType);
      this.redis.on('message', (channel, message) => {
        if (channel === eventType) {
          this.handleEvent(JSON.parse(message));
        }
      });
    }
    this.handlers.get(eventType)!.add(handler);
  }
  
  unsubscribe<T>(eventType: string, handler: EventHandler<T>): void {
    this.handlers.get(eventType)?.delete(handler);
  }
  
  private async handleEvent(event: EventPayload): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      await Promise.all(
        Array.from(handlers).map(h => h.handle(event).catch(console.error))
      );
    }
  }
  
  private async logEvent(event: EventPayload): Promise<void> {
    // Store in PostgreSQL for audit trail
  }
}

// Event Store for replay
class EventStore {
  async append(event: EventPayload): Promise<void>;
  async getEvents(tenantId: string, since: Date): Promise<EventPayload[]>;
  async replay(eventType: string, handler: EventHandler): Promise<void>;
}
```

### Event Handlers in Plugins

```typescript
// plugins/crm/backend/events/lead-handler.ts

@EventHandler('lead.created')
export class LeadCreatedHandler implements EventHandler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly aiService: AIService
  ) {}
  
  async handle(event: EventPayload<LeadCreatedEvent>): Promise<void> {
    const { lead } = event.payload;
    
    // Enrich lead with AI
    await this.aiService.enrichLead(lead);
    
    // Notify assigned user
    if (lead.assignedTo) {
      await this.notificationService.send({
        userId: lead.assignedTo,
        type: 'lead_assigned',
        data: { leadId: lead.id }
      });
    }
    
    // Trigger welcome workflow
    await this.workflowService.trigger('welcome-sequence', { lead });
  }
}
```

---

## Workflow Engine

Moteur d'automatisation visuel type Zapier/Make/n8n.

### Workflow Definition

```typescript
// packages/core/workflow-engine/types.ts

interface Workflow {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  trigger: Trigger;
  steps: Step[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Trigger {
  type: 'event' | 'schedule' | 'webhook' | 'manual';
  config: {
    eventType?: string;      // For event triggers
    cron?: string;           // For schedule triggers
    webhookPath?: string;    // For webhook triggers
  };
}

interface Step {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'loop' | 'branch';
  name: string;
  config: any;
  nextSteps?: string[];      // For branching
  retryPolicy?: RetryPolicy;
}

interface ActionStep extends Step {
  type: 'action';
  config: {
    actionType: string;      // e.g., 'send_email', 'create_lead'
    plugin?: string;         // Plugin providing the action
    inputs: Record<string, any>;
    outputs: string[];       // Output mappings
  };
}

interface ConditionStep extends Step {
  type: 'condition';
  config: {
    conditions: Condition[];
    logic: 'AND' | 'OR';
  };
}

interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'regex';
  value: any;
}

interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
  backoff: 'linear' | 'exponential';
}
```

### Workflow Execution Engine

```typescript
// packages/core/workflow-engine/execution-engine.ts

import { Queue, Worker } from 'bullmq';

class WorkflowExecutionEngine {
  private queue: Queue;
  private worker: Worker;
  
  constructor() {
    this.queue = new Queue('workflows', { connection: redisConfig });
    this.worker = new Worker('workflows', this.processJob.bind(this), {
      connection: redisConfig,
      concurrency: 10
    });
  }
  
  async trigger(workflowId: string, inputData: any): Promise<string> {
    const workflow = await this.getWorkflow(workflowId);
    
    const jobId = await this.queue.add('execute', {
      workflowId,
      inputData,
      startedAt: new Date(),
      currentStepId: null,
      context: {}
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });
    
    return jobId;
  }
  
  private async processJob(job: Job): Promise<any> {
    const { workflowId, inputData, currentStepId, context } = job.data;
    const workflow = await this.getWorkflow(workflowId);
    
    let currentStep = currentStepId 
      ? workflow.steps.find(s => s.id === currentStepId)
      : workflow.steps[0];
    
    while (currentStep) {
      try {
        const result = await this.executeStep(currentStep, context, inputData);
        context[currentStep.id] = result;
        
        // Determine next step
        if (currentStep.type === 'condition') {
          const nextStepId = this.evaluateCondition(currentStep, context);
          currentStep = workflow.steps.find(s => s.id === nextStepId);
        } else if (currentStep.nextSteps && currentStep.nextSteps.length > 0) {
          // Branching - create parallel jobs
          for (const nextStepId of currentStep.nextSteps) {
            await this.queue.add('execute', {
              workflowId,
              inputData,
              currentStepId: nextStepId,
              context: { ...context }
            });
          }
          break; // End this branch
        } else {
          const nextIndex = workflow.steps.indexOf(currentStep) + 1;
          currentStep = workflow.steps[nextIndex] || null;
        }
      } catch (error) {
        if (currentStep.retryPolicy) {
          await this.handleRetry(job, currentStep, error);
        } else {
          throw error;
        }
      }
    }
    
    // Emit workflow completed event
    await this.eventBus.publish({
      type: 'workflow.completed',
      payload: { workflowId, result: context },
      metadata: { tenantId: workflow.tenantId }
    });
    
    return context;
  }
  
  private async executeStep(step: Step, context: any, inputData: any): Promise<any> {
    switch (step.type) {
      case 'action':
        return this.executeAction(step as ActionStep, context, inputData);
      case 'delay':
        await this.delay(step.config.durationMs);
        return {};
      case 'loop':
        return this.executeLoop(step, context, inputData);
      default:
        return {};
    }
  }
  
  private async executeAction(step: ActionStep, context: any, inputData: any): Promise<any> {
    // Resolve action from plugin registry
    const action = this.pluginRegistry.getAction(step.config.actionType);
    
    // Prepare inputs with context variables
    const inputs = this.resolveInputs(step.config.inputs, context, inputData);
    
    // Execute action
    const result = await action.execute(inputs);
    
    // Map outputs
    return this.mapOutputs(step.config.outputs, result);
  }
}
```

### Built-in Actions

```typescript
// plugins/workflows/backend/actions/registry.ts

const builtInActions = {
  // Communication
  'send_email': EmailAction,
  'send_sms': SMSAction,
  'send_whatsapp': WhatsAppAction,
  'send_slack': SlackAction,
  
  // CRM
  'create_lead': CreateLeadAction,
  'update_contact': UpdateContactAction,
  'create_deal': CreateDealAction,
  
  // AI
  'ai_generate_content': AIGenerateContentAction,
  'ai_analyze_sentiment': AIAnalyzeSentimentAction,
  'ai_extract_data': AIExtractDataAction,
  
  // Data
  'http_request': HTTPRequestAction,
  'parse_json': ParseJSONAction,
  'transform_data': TransformDataAction,
  
  // Control
  'delay': DelayAction,
  'loop': LoopAction,
  'branch': BranchAction,
  
  // Webhooks
  'trigger_webhook': TriggerWebhookAction,
  'wait_webhook': WaitWebhookAction
};
```

### Visual Workflow Builder

```typescript
// plugins/workflows/frontend/components/WorkflowBuilder.tsx

const WorkflowBuilder: React.FC = () => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  return (
    <div className="workflow-builder">
      <Sidebar>
        <TriggerPalette />
        <ActionPalette />
        <ConditionPalette />
      </Sidebar>
      
      <Canvas>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          nodeTypes={{
            trigger: TriggerNode,
            action: ActionNode,
            condition: ConditionNode,
            delay: DelayNode,
            loop: LoopNode
          }}
        />
      </Canvas>
      
      <PropertiesPanel>
        <NodeConfigurator node={selectedNode} />
      </PropertiesPanel>
    </div>
  );
};
```

---

## AI Engine

Architecture IA centralisée avec AI Gateway.

### AI Gateway Architecture

```typescript
// packages/core/ai-engine/gateway.ts

interface AIProvider {
  id: string;
  name: string;
  models: string[];
  capabilities: Capability[];
  pricing: Pricing;
}

interface AIRequest {
  provider?: string;
  model?: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: Tool[];
}

interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
  latency: number;
}

class AIGateway {
  private providers: Map<string, AIProvider>;
  private loadBalancer: LoadBalancer;
  private fallbackChain: string[];
  
  async generate(request: AIRequest): Promise<AIResponse> {
    const selectedProvider = request.provider || 
      await this.loadBalancer.selectProvider(request);
    
    try {
      const response = await this.executeProvider(selectedProvider, request);
      await this.trackUsage(response);
      return response;
    } catch (error) {
      // Fallback to next provider
      const nextProvider = this.fallbackChain.find(p => p !== selectedProvider);
      if (nextProvider) {
        return this.generate({ ...request, provider: nextProvider });
      }
      throw error;
    }
  }
  
  private async executeProvider(providerId: string, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    switch (providerId) {
      case 'openai':
        return this.openAIProvider.generate(request);
      case 'anthropic':
        return this.anthropicProvider.generate(request);
      case 'mistral':
        return this.mistralProvider.generate(request);
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }
}
```

### Prompt Management

```typescript
// packages/core/ai-engine/prompt-manager.ts

interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  template: string;
  variables: string[];
  model: string;
  parameters: {
    temperature: number;
    maxTokens: number;
  };
}

class PromptManager {
  private templates: Map<string, PromptTemplate[]>;
  
  async render(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = await this.getLatestTemplate(templateId);
    
    return template.template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] || '';
    });
  }
  
  async execute(templateId: string, variables: Record<string, any>): Promise<AIResponse> {
    const rendered = await this.render(templateId, variables);
    const template = await this.getLatestTemplate(templateId);
    
    return this.aiGateway.generate({
      model: template.model,
      messages: [{ role: 'user', content: rendered }],
      temperature: template.parameters.temperature,
      maxTokens: template.parameters.maxTokens
    });
  }
}

// Example Prompts
const PROMPTS = {
  'lead-enrichment': {
    template: `
Analyze this company and provide:
1. Industry classification
2. Company size estimate
3. Key technologies used
4. Recent news summary
5. Pain points identification

Company: {{companyName}}
Website: {{website}}
Description: {{description}}
`,
    model: 'gpt-4',
    temperature: 0.3
  },
  
  'email-personalization': {
    template: `
Write a personalized cold email based on:

Prospect: {{prospectName}}
Role: {{prospectRole}}
Company: {{companyName}}
Recent Activity: {{recentActivity}}
Value Proposition: {{valueProp}}

Tone: Professional but friendly
Length: 100-150 words
Call-to-action: Schedule a 15-min call
`,
    model: 'gpt-4',
    temperature: 0.7
  },
  
  'sentiment-analysis': {
    template: `
Analyze the sentiment of this text:

"{{text}}"

Provide:
- Sentiment score (-1 to 1)
- Emotions detected
- Urgency level
- Recommended response tone
`,
    model: 'gpt-3.5-turbo',
    temperature: 0.1
  }
};
```

### AI Agents System

```typescript
// packages/core/ai-engine/agents/base-agent.ts

interface AgentConfig {
  name: string;
  description: string;
  tools: string[];
  memoryEnabled: boolean;
  maxIterations: number;
}

abstract class BaseAgent {
  protected config: AgentConfig;
  protected memory: MemoryStore;
  protected aiGateway: AIGateway;
  
  abstract execute(input: any): Promise<AgentResult>;
  
  protected async think(context: string): Promise<string> {
    return this.aiGateway.generate({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: context }
      ],
      tools: this.getTools()
    });
  }
  
  protected abstract getSystemPrompt(): string;
  protected abstract getTools(): Tool[];
}

// SDR Agent
class SDRAgent extends BaseAgent {
  config: AgentConfig = {
    name: 'SDR Agent',
    description: 'Automated Sales Development Representative',
    tools: ['search_prospects', 'enrich_data', 'write_email', 'schedule_followup'],
    memoryEnabled: true,
    maxIterations: 5
  };
  
  async execute(input: ProspectingInput): Promise<SDRResult> {
    const prospects = await this.searchProspects(input.criteria);
    const enriched = await this.enrichProspects(prospects);
    const emails = await this.generateEmails(enriched);
    const sequence = await this.createSequence(emails);
    
    return { prospects: enriched, emails, sequence };
  }
  
  getSystemPrompt(): string {
    return `You are an expert SDR assistant. Your goals:
1. Identify high-quality prospects
2. Personalize outreach at scale
3. Optimize response rates
4. Qualify leads efficiently`;
  }
}

// SEO Agent
class SEOAgent extends BaseAgent {
  async execute(input: SEOInput): Promise<SEOResult> {
    const audit = await this.performAudit(input.url);
    const keywords = await this.findKeywords(input.niche);
    const contentPlan = await this.createContentPlan(keywords);
    const optimizations = await this.generateRecommendations(audit);
    
    return { audit, keywords, contentPlan, optimizations };
  }
}

// Reputation Agent
class ReputationAgent extends BaseAgent {
  async execute(input: ReputationInput): Promise<ReputationResult> {
    const mentions = await this.monitorMentions(input.brand);
    const sentiment = await this.analyzeSentiment(mentions);
    const responses = await this.draftResponses(sentiment.negative);
    const strategy = await this.createStrategy(sentiment);
    
    return { mentions, sentiment, responses, strategy };
  }
}
```

### Token Tracking & Cost Management

```typescript
// packages/core/ai-engine/cost-tracker.ts

class CostTracker {
  async trackUsage(response: AIResponse, tenantId: string): Promise<void> {
    const cost = this.calculateCost(response);
    
    await this.db.costLog.create({
      data: {
        tenantId,
        provider: response.provider,
        model: response.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        cost: cost.total,
        timestamp: new Date()
      }
    });
    
    // Check quota
    const quota = await this.getTenantQuota(tenantId);
    if (quota.used + cost.total > quota.limit) {
      await this.eventBus.publish({
        type: 'quota.exceeded',
        payload: { type: 'ai_tokens', current: quota.used, limit: quota.limit }
      });
    }
  }
  
  private calculateCost(response: AIResponse): Cost {
    const pricing = this.getPricing(response.provider, response.model);
    return {
      prompt: (response.usage.promptTokens / 1000) * pricing.promptPer1K,
      completion: (response.usage.completionTokens / 1000) * pricing.completionPer1K,
      total: 0 // calculated
    };
  }
}
```

---

## Multi-Tenant System

Architecture SaaS multi-tenant complète.

### Tenant Isolation Strategies

```typescript
// packages/core/tenants/tenant-manager.ts

enum IsolationLevel {
  DATABASE = 'database',      // Separate database per tenant
  SCHEMA = 'schema',          // Separate schema per tenant
  ROW = 'row'                 // Row-level isolation with tenant_id
}

class TenantManager {
  private isolationLevel: IsolationLevel;
  
  async getCurrentTenant(): Promise<Tenant> {
    // Extract from JWT or subdomain
    const tenantId = this.extractTenantId();
    return this.getTenant(tenantId);
  }
  
  async setTenantContext(tenantId: string): Promise<void> {
    switch (this.isolationLevel) {
      case IsolationLevel.DATABASE:
        await this.switchDatabase(tenantId);
        break;
      case IsolationLevel.SCHEMA:
        await this.switchSchema(tenantId);
        break;
      case IsolationLevel.ROW:
        // Set in Prisma middleware
        globalThis.currentTenantId = tenantId;
        break;
    }
  }
}

// Prisma Middleware for Row-Level Isolation
prisma.$use(async (params, next) => {
  const tenantId = globalThis.currentTenantId;
  
  // Skip for tenant model itself
  if (params.model === 'Tenant') {
    return next(params);
  }
  
  // Inject tenant filter for reads
  if (params.action === 'findUnique' || params.action === 'findFirst' || 
      params.action === 'findMany') {
    if (!params.args.where) {
      params.args.where = {};
    }
    params.args.where.tenantId = tenantId;
  }
  
  // Inject tenant for writes
  if (params.action === 'create' || params.action === 'update') {
    if (!params.args.data) {
      params.args.data = {};
    }
    params.args.data.tenantId = tenantId;
  }
  
  return next(params);
});
```

### RBAC System

```typescript
// packages/core/permissions/rbac.ts

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  inheritedFrom?: string[];
}

interface Permission {
  resource: string;
  actions: string[];  // read, write, delete, export
  conditions?: Condition[];
}

class RBACManager {
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.getUser(userId);
    const permissions = this.getAllPermissions(user.roles);
    
    return permissions.some(p => 
      p.resource === resource && 
      p.actions.includes(action) &&
      this.evaluateConditions(p.conditions)
    );
  }
  
  private getAllPermissions(roles: Role[]): Permission[] {
    const permissions = new Set<string>();
    
    for (const role of roles) {
      for (const perm of role.permissions) {
        permissions.add(`${perm.resource}:${perm.actions.join(',')}`);
      }
      // Handle inheritance
      if (role.inheritedFrom) {
        const parentRoles = await this.getRoles(role.inheritedFrom);
        permissions.addAll(this.getAllPermissions(parentRoles));
      }
    }
    
    return Array.from(permissions);
  }
}

// Decorator for NestJS
const RequirePermission = (resource: string, action: string) => {
  return applyDecorators(
    UseGuards(PermissionGuard),
    SetMetadata('permission', `${resource}:${action}`)
  );
};

// Usage in controller
@Controller('leads')
export class LeadsController {
  @Get()
  @RequirePermission('leads', 'read')
  async findAll() {
    // ...
  }
  
  @Post()
  @RequirePermission('leads', 'write')
  async create() {
    // ...
  }
}
```

### Quota Management

```typescript
// packages/core/tenants/quota-manager.ts

interface QuotaDefinition {
  resource: string;
  limit: number;
  period: 'month' | 'day' | 'hour';
  softLimit?: number;  // Warning threshold
}

class QuotaManager {
  private quotas: Map<string, QuotaDefinition[]>;
  
  async checkQuota(tenantId: string, resource: string, amount: number = 1): Promise<boolean> {
    const quota = await this.getQuota(tenantId, resource);
    const usage = await this.getCurrentUsage(tenantId, resource, quota.period);
    
    if (usage + amount > quota.limit) {
      await this.eventBus.publish({
        type: 'quota.exceeded',
        payload: { resource, current: usage, limit: quota.limit, requested: amount }
      });
      return false;
    }
    
    if (quota.softLimit && usage + amount > quota.softLimit) {
      await this.eventBus.publish({
        type: 'quota.warning',
        payload: { resource, current: usage, limit: quota.limit }
      });
    }
    
    return true;
  }
  
  async incrementUsage(tenantId: string, resource: string, amount: number): Promise<void> {
    await this.db.quotaUsage.upsert({
      where: { tenantId_resource_period: { tenantId, resource, period: this.getCurrentPeriod() } },
      update: { used: { increment: amount } },
      create: { tenantId, resource, used: amount, period: this.getCurrentPeriod() }
    });
  }
}
```

---

## Dynamic UI Engine

Moteur UI permettant aux plugins d'injecter dynamiquement des composants.

### Component Registry

```typescript
// packages/core/ui-engine/component-registry.ts

interface UIComponent {
  id: string;
  name: string;
  type: 'page' | 'widget' | 'form' | 'table' | 'card' | 'modal' | 'kanban' | 'chart';
  location: string;  // Where it can be injected
  component: React.ComponentType;
  permissions?: string[];
}

class ComponentRegistry {
  private components: Map<string, UIComponent[]> = new Map();
  
  register(component: UIComponent): void {
    const locationComponents = this.components.get(component.location) || [];
    locationComponents.push(component);
    this.components.set(component.location, locationComponents);
  }
  
  getForLocation(location: string, userPermissions: string[]): UIComponent[] {
    const components = this.components.get(location) || [];
    return components.filter(c => 
      !c.permissions || 
      c.permissions.every(p => userPermissions.includes(p))
    );
  }
}

// Usage in layout
const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const widgets = useComponentRegistry().getForLocation('dashboard', user.permissions);
  
  return (
    <div className="dashboard">
      <Header />
      <Sidebar />
      <main>
        {widgets.map(widget => (
          <WidgetRenderer key={widget.id} widget={widget} />
        ))}
      </main>
    </div>
  );
};
```

### Dynamic Forms

```typescript
// packages/core/ui-engine/form-engine.tsx

interface FormDefinition {
  id: string;
  fields: FormField[];
  layout: 'vertical' | 'horizontal' | 'grid';
  validation?: ValidationRule[];
  onSubmit: (data: any) => Promise<void>;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'date' | 'datetime' | 
        'textarea' | 'checkbox' | 'radio' | 'file' | 'relation' | 'json';
  required?: boolean;
  defaultValue?: any;
  options?: SelectOption[];  // For select/multiselect
  relation?: {
    model: string;
    displayField: string;
    valueField: string;
  };
  validation?: ValidationRule[];
  visible?: (formData: any) => boolean;  // Conditional visibility
}

const DynamicForm: React.FC<{ definition: FormDefinition }> = ({ definition }) => {
  const [formData, setFormData] = useState({});
  
  return (
    <form onSubmit={handleSubmit(definition.onSubmit)}>
      {definition.fields.map(field => (
        <FormFieldRenderer
          key={field.name}
          field={field}
          value={formData[field.name]}
          onChange={(value) => setFormData({ ...formData, [field.name]: value })}
          visible={!field.visible || field.visible(formData)}
        />
      ))}
    </form>
  );
};
```

### Widget System

```typescript
// packages/core/ui-engine/widget-engine.tsx

interface WidgetDefinition {
  id: string;
  title: string;
  description?: string;
  icon: string;
  component: React.ComponentType<WidgetProps>;
  size: 'small' | 'medium' | 'large' | 'full';
  dataProvider?: string;  // API endpoint or query
  refreshInterval?: number;
  configurable?: boolean;
  settings?: WidgetSetting[];
}

const WidgetGrid: React.FC = () => {
  const { widgets, moveWidget, resizeWidget } = useWidgetLayout();
  
  return (
    <GridLayout
      layout={widgets}
      onLayoutChange={saveLayout}
      cols={12}
      rowHeight={100}
    >
      {widgets.map(widget => (
        <div key={widget.id} data-grid={widget.layout}>
          <WidgetContainer widget={widget}>
            <WidgetRenderer 
              component={widget.component}
              dataProvider={widget.dataProvider}
              refreshInterval={widget.refreshInterval}
            />
          </WidgetContainer>
        </div>
      ))}
    </GridLayout>
  );
};
```

---

## Marketplace

Marketplace complète pour plugins, thèmes et AI agents.

### Marketplace Architecture

```typescript
// packages/core/marketplace/marketplace-service.ts

interface MarketplaceItem {
  id: string;
  type: 'plugin' | 'theme' | 'agent';
  name: string;
  version: string;
  description: string;
  author: Author;
  pricing: Pricing;
  rating: number;
  reviews: Review[];
  downloads: number;
  screenshots: string[];
  documentation: string;
  changelog: string;
  compatibility: Compatibility;
}

interface Pricing {
  type: 'free' | 'one-time' | 'subscription';
  amount?: number;
  currency: string;
  trialDays?: number;
}

class MarketplaceService {
  async listItems(filters: MarketplaceFilter): Promise<MarketplaceItem[]> {
    // Query marketplace index
    // Apply filters
    // Sort by relevance/rating/downloads
  }
  
  async purchase(itemId: string, tenantId: string): Promise<PurchaseResult> {
    const item = await this.getItem(itemId);
    
    // Process payment
    const payment = await this.paymentService.process({
      itemId,
      tenantId,
      amount: item.pricing.amount
    });
    
    // Grant license
    const license = await this.licenseService.grant({
      itemId,
      tenantId,
      type: item.pricing.type
    });
    
    // Auto-install if applicable
    if (item.type === 'plugin') {
      await this.pluginManager.install(item.name);
    }
    
    return { success: true, license, downloadUrl: item.downloadUrl };
  }
  
  async checkUpdates(tenantId: string): Promise<Update[]> {
    const installed = await this.getInstalledItems(tenantId);
    const updates: Update[] = [];
    
    for (const item of installed) {
      const latest = await this.getLatestVersion(item.id);
      if (latest.version > item.version) {
        updates.push({ item, currentVersion: item.version, newVersion: latest.version });
      }
    }
    
    return updates;
  }
}
```

### License Management

```typescript
// packages/core/marketplace/license-manager.ts

class LicenseManager {
  async validateLicense(licenseKey: string, itemId: string): Promise<boolean> {
    const license = await this.db.license.findUnique({
      where: { key: licenseKey }
    });
    
    if (!license || license.itemId !== itemId) {
      return false;
    }
    
    if (license.expiresAt && license.expiresAt < new Date()) {
      return false;
    }
    
    if (license.status !== 'active') {
      return false;
    }
    
    return true;
  }
  
  async checkEntitlements(tenantId: string, itemId: string): Promise<Entitlements> {
    const license = await this.getActiveLicense(tenantId, itemId);
    
    return {
      canUse: !!license,
      canModify: license?.type !== 'viewer',
      canRedistribute: license?.type === 'enterprise',
      supportAccess: license?.tier === 'premium',
      updates: license?.type !== 'lifetime-old'
    };
  }
}
```

---

## Security

Stratégie de sécurité enterprise-grade.

### Security Layers

```typescript
// packages/core/security/security-middleware.ts

// Rate Limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    return req.user?.id || req.ip; // Per-user or per-IP
  }
});

// CSP Headers
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://trusted-cdn.com'],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'wss://', 'https://api.*'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"]
  }
};

// Input Validation
const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true
  }
});

// Encryption
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  
  encrypt(data: string, key: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encrypted: EncryptedData, key: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(key),
      Buffer.from(encrypted.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Audit Logging
@Injectable()
class AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    await this.db.auditLog.create({
      data: {
        tenantId: event.tenantId,
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        changes: event.changes,
        timestamp: new Date()
      }
    });
  }
}

// Usage
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('api/:tenantId/leads')
export class LeadsController {
  @Get()
  @RateLimit({ limit: 100, window: '15m' })
  async findAll(@User() user: User) {
    // ...
  }
}
```

### Plugin Sandboxing

```typescript
// packages/core/security/plugin-sandbox.ts

import { VM } from 'vm2';

class PluginSandbox {
  private vm: VM;
  
  constructor(plugin: Plugin, tenantId: string) {
    this.vm = new VM({
      timeout: 5000,
      eval: false,
      wasm: false,
      fixAsync: true,
      sandbox: {
        // Allowed APIs
        fetch: this.createSafeFetch(tenantId),
        console: this.createSafeConsole(plugin.id),
        Buffer: undefined, // Disabled
        require: this.createSafeRequire(plugin),
        
        // Plugin-specific context
        pluginContext: {
          id: plugin.id,
          tenantId,
          config: plugin.config
        }
      }
    });
  }
  
  async execute(code: string, context: any): Promise<any> {
    try {
      return await this.vm.run(code, context);
    } catch (error) {
      if (error.message.includes('timeout')) {
        throw new PluginTimeoutError(plugin.id);
      }
      throw error;
    }
  }
}
```

---

## Database Schema

Schéma de base de données complet.

```prisma
// packages/core/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== CORE MODELS ====================

model Tenant {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  plan        String   @default("free")
  status      String   @default("active")
  settings    Json     @default("{}")
  customDomain String? @unique
  branding    Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       User[]
  workspaces  Workspace[]
  plugins     TenantPlugin[]
  themes      TenantTheme[]
  subscriptions Subscription[]
  auditLogs   AuditLog[]
  
  @@index([slug])
  @@index([status])
}

model User {
  id            String    @id @default(uuid())
  email         String
  passwordHash  String
  firstName     String?
  lastName      String?
  avatar        String?
  timezone      String    @default("UTC")
  language      String    @default("en")
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  roles         UserRole[]
  permissions   UserPermission[]
  apiKeys       ApiKey[]
  sessions      Session[]
  
  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([email])
}

model Role {
  id          String   @id @default(uuid())
  name        String
  description String?
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  permissions RolePermission[]
  users       UserRole[]
  
  @@unique([tenantId, name])
  @@index([tenantId])
}

model Permission {
  id       String @id @default(uuid())
  resource String
  action   String
  scope    String @default("*") // *, own, team, all
  
  @@unique([resource, action, scope])
}

// ==================== PLUGIN MODELS ====================

model Plugin {
  id           String   @id @default(uuid())
  name         String   @unique
  displayName  String
  version      String
  description  String
  author       String
  homepage     String?
  repository   String?
  license      String   @default("MIT")
  manifest     Json
  routes       Json     @default("[]")
  permissions  Json     @default("[]")
  dependencies String[] @default([])
  isCore       Boolean  @default(false)
  isActive     Boolean  @default(true)
  downloads    Int      @default(0)
  rating       Float    @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  installations TenantPlugin[]
  versions      PluginVersion[]
  
  @@index([isActive])
  @@index([name])
}

model PluginVersion {
  id        String   @id @default(uuid())
  version   String
  changelog String?
  manifest  Json
  checksum  String
  downloadUrl String
  isLatest  Boolean @default(false)
  publishedAt DateTime @default(now())
  
  pluginId  String
  plugin    Plugin   @relation(fields: [pluginId], references: [id], onDelete: Cascade)
  
  @@unique([pluginId, version])
  @@index([pluginId])
  @@index([isLatest])
}

model TenantPlugin {
  id          String   @id @default(uuid())
  version     String
  config      Json     @default("{}")
  isActive    Boolean  @default(true)
  installedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  pluginId    String
  plugin      Plugin   @relation(fields: [pluginId], references: [id])
  
  @@unique([tenantId, pluginId])
  @@index([tenantId])
  @@index([isActive])
}

// ==================== THEME MODELS ====================

model Theme {
  id          String   @id @default(uuid())
  name        String   @unique
  displayName String
  version     String
  description String
  author      String
  manifest    Json
  tokens      Json
  overrides   Json     @default("[]")
  previewUrl  String?
  isActive    Boolean  @default(true)
  downloads   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  installations TenantTheme[]
}

model TenantTheme {
  id        String   @id @default(uuid())
  config    Json     @default("{}")
  isActive  Boolean  @default(false)
  appliedAt DateTime @default(now())
  
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  themeId   String
  theme     Theme    @relation(fields: [themeId], references: [id])
  
  @@unique([tenantId, themeId])
  @@index([tenantId])
}

// ==================== WORKFLOW MODELS ====================

model Workflow {
  id          String   @id @default(uuid())
  name        String
  description String?
  trigger     Json
  steps       Json
  isActive    Boolean  @default(true)
  executions  Int      @default(0)
  lastRunAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  executions  WorkflowExecution[]
  
  @@index([tenantId])
  @@index([isActive])
}

model WorkflowExecution {
  id          String   @id @default(uuid())
  status      String   @default("pending") // pending, running, completed, failed
  inputData   Json
  outputData  Json?
  error       String?
  startedAt   DateTime @default(now())
  completedAt DateTime?
  duration    Int?     // milliseconds
  
  workflowId  String
  workflow    Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  steps       WorkflowStepExecution[]
  
  @@index([workflowId])
  @@index([status])
  @@index([startedAt])
}

// ==================== AI MODELS ====================

model AIPrompt {
  id          String   @id @default(uuid())
  name        String
  template    String
  variables   String[]
  model       String
  parameters  Json
  version     Int      @default(1)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  executions  AIPromptExecution[]
  
  @@index([tenantId])
  @@index([isActive])
}

model AIPromptExecution {
  id            String   @id @default(uuid())
  input         Json
  output        Json
  provider      String
  model         String
  promptTokens  Int
  completionTokens Int
  cost          Decimal
  latency       Int      // milliseconds
  executedAt    DateTime @default(now())
  
  promptId      String
  prompt        AIPrompt @relation(fields: [promptId], references: [id])
  
  @@index([promptId])
  @@index([executedAt])
}

// ==================== AUDIT & LOGS ====================

model AuditLog {
  id          String   @id @default(uuid())
  action      String
  resource    String
  resourceId  String?
  changes     Json?
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  
  @@index([tenantId])
  @@index([timestamp])
  @@index([action])
  @@index([userId])
}

model EventLog {
  id          String   @id @default(uuid())
  eventType   String
  payload     Json
  processed   Boolean  @default(false)
  error       String?
  createdAt   DateTime @default(now())
  processedAt DateTime?
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([eventType])
  @@index([createdAt])
  @@index([processed])
}

// ==================== BILLING ====================

model Subscription {
  id              String   @id @default(uuid())
  plan            String
  status          String   @default("active")
  currentPeriodStart DateTime
  currentPeriodEnd DateTime
  cancelAtPeriodEnd Boolean @default(false)
  canceledAt      DateTime?
  metadata        Json     @default("{}")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  invoices        Invoice[]
  
  @@index([tenantId])
  @@index([status])
}

model Invoice {
  id          String   @id @default(uuid())
  number      String
  amount      Decimal
  currency    String   @default("USD")
  status      String   @default("pending")
  dueDate     DateTime
  paidAt      DateTime?
  items       Json
  metadata    Json     @default("{}")
  createdAt   DateTime @default(now())
  
  subscriptionId String
  subscription  Subscription @relation(fields: [subscriptionId], references: [id])
  
  @@index([subscriptionId])
  @@index([status])
}

// ==================== QUOTAS ====================

model QuotaUsage {
  id         String   @id @default(uuid())
  resource   String
  used       Int      @default(0)
  period     String   // month, day, hour
  periodStart DateTime
  periodEnd  DateTime
  
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@unique([tenantId, resource, periodStart])
  @@index([tenantId])
  @@index([periodEnd])
}
```

---

## APIs

Architecture API RESTful + GraphQL + WebSocket.

### REST API Structure

```typescript
// apps/api/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });
  
  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  });
  
  // Rate limiting
  app.use('/api', rateLimiter);
  
  await app.listen(3000);
}

// API Response Standard
interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters?: Record<string, any>;
  };
  links?: {
    self: string;
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
  };
}

// Example Controller
@Controller('leads')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiTags('Leads')
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}
  
  @Get()
  @ApiOperation({ summary: 'List all leads' })
  @ApiResponse({ type: PaginatedLeadResponse })
  async findAll(
    @Query() query: LeadFilterDto,
    @User() user: User
  ): Promise<ApiResponse<Lead[]>> {
    const { data, total } = await this.leadsService.findAll(query, user.tenantId);
    
    return {
      data,
      meta: {
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit)
        }
      },
      links: {
        self: `/api/v1/leads?page=${query.page}&limit=${query.limit}`,
        first: `/api/v1/leads?page=1&limit=${query.limit}`,
        last: `/api/v1/leads?page=${Math.ceil(total / query.limit)}&limit=${query.limit}`,
        ...(query.page < Math.ceil(total / query.limit) && {
          next: `/api/v1/leads?page=${query.page + 1}&limit=${query.limit}`
        }),
        ...(query.page > 1 && {
          prev: `/api/v1/leads?page=${query.page - 1}&limit=${query.limit}`
        })
      }
    };
  }
  
  @Post()
  @RequirePermission('leads', 'write')
  async create(
    @Body() dto: CreateLeadDto,
    @User() user: User
  ): Promise<ApiResponse<Lead>> {
    const lead = await this.leadsService.create(dto, user.tenantId);
    return { data: lead };
  }
}
```

### WebSocket Gateway

```typescript
// apps/api/src/websocket/websocket.gateway.ts

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL
  }
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;
  
  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    // Authenticate connection
    const token = client.handshake.auth.token;
    const user = this.authService.validateToken(token);
    
    if (user) {
      client.data.user = user;
      client.join(`tenant:${user.tenantId}`);
      client.join(`user:${user.id}`);
    } else {
      client.disconnect();
    }
  }
  
  // Broadcast to tenant
  broadcastToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, {
      type: event,
      payload: data,
      timestamp: new Date()
    });
  }
  
  // Send to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, {
      type: event,
      payload: data,
      timestamp: new Date()
    });
  }
}

// Usage in service
@Injectable()
export class LeadsService {
  constructor(
    private websocketGateway: WebsocketGateway,
    private eventBus: EventBus
  ) {}
  
  async create(dto: CreateLeadDto, tenantId: string): Promise<Lead> {
    const lead = await this.prisma.lead.create({ data: { ...dto, tenantId } });
    
    // Emit via event bus
    await this.eventBus.publish({
      type: 'lead.created',
      payload: { lead },
      metadata: { tenantId }
    });
    
    // Real-time notification
    this.websocketGateway.broadcastToTenant(tenantId, 'lead.created', lead);
    
    return lead;
  }
}
```

### GraphQL API

```typescript
// apps/api/src/graphql/resolvers/leads.resolver.ts

@Resolver('Lead')
export class LeadsResolver {
  constructor(private readonly leadsService: LeadsService) {}
  
  @Query(() => [Lead])
  @UseGuards(GqlAuthGuard)
  async leads(
    @Args('filter', { nullable: true }) filter: LeadFilter,
    @CurrentUser() user: User
  ): Promise<Lead[]> {
    return this.leadsService.findAll(filter, user.tenantId);
  }
  
  @Mutation(() => Lead)
  @UseGuards(GqlAuthGuard, GqlPermissionGuard('leads', 'write'))
  async createLead(
    @Args('input') input: CreateLeadInput,
    @CurrentUser() user: User
  ): Promise<Lead> {
    return this.leadsService.create(input, user.tenantId);
  }
  
  @Subscription(() => Lead, {
    filter: (payload, variables) => {
      return payload.leadCreated.tenantId === variables.tenantId;
    }
  })
  @UseGuards(GqlAuthGuard)
  leadCreated(@Args('tenantId') tenantId: string) {
    return pubSub.asyncIterator('lead.created');
  }
}
```

---

## Developer SDK

SDK complet pour développeurs de plugins.

### SDK Package Structure

```typescript
// packages/sdk/package.json

{
  "name": "@nexusos/sdk",
  "version": "1.0.0",
  "exports": {
    ".": "./src/index.ts",
    "./plugin": "./src/plugin.ts",
    "./ui": "./src/ui.tsx",
    "./api": "./src/api.ts",
    "./cli": "./src/cli.js"
  }
}
```

### Plugin CLI

```typescript
// packages/sdk/src/cli.ts

#!/usr/bin/env node

import { Command } from 'commander';
import { createPlugin } from './commands/create';
import { buildPlugin } from './commands/build';
import { publishPlugin } from './commands/publish';
import { devPlugin } from './commands/dev';

const program = new Command();

program
  .name('nexus-plugin')
  .description('NexusOS Plugin Development CLI')
  .version('1.0.0');

program
  .command('create <name>')
  .description('Create a new plugin')
  .option('-t, --template <type>', 'Plugin template', 'basic')
  .action(createPlugin);

program
  .command('build')
  .description('Build plugin for production')
  .option('--watch', 'Watch mode')
  .action(buildPlugin);

program
  .command('dev')
  .description('Start development server with hot reload')
  .option('--port <port>', 'Development port', '3001')
  .action(devPlugin);

program
  .command('publish')
  .description('Publish plugin to marketplace')
  .option('--version <version>', 'Version to publish')
  .option('--tag <tag>', 'Release tag')
  .action(publishPlugin);

program.parse();
```

### Plugin Development Kit

```typescript
// packages/sdk/src/plugin.ts

// Plugin Base Class
export abstract class NexusPlugin {
  abstract name: string;
  abstract version: string;
  
  // Lifecycle hooks
  async onInstall?(context: PluginContext): Promise<void>;
  async onUninstall?(context: PluginContext): Promise<void>;
  async onUpdate?(context: PluginContext): Promise<void>;
  async onActivate?(context: PluginContext): Promise<void>;
  async onDeactivate?(context: PluginContext): Promise<void>;
  
  // Extension points
  getRoutes?(): RouteDefinition[];
  getPermissions?(): PermissionDefinition[];
  getMenus?(): MenuDefinition[];
  getWidgets?(): WidgetDefinition[];
  getEvents?(): EventDefinition[];
  getActions?(): ActionDefinition[];
}

// Event Handler Decorator
export function EventHandler(eventType: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('event_handler', { eventType, method: propertyKey }, target);
  };
}

// API Route Decorator
export function ApiRoute(path: string, methods: string[]) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('api_route', { path, methods }, target, propertyKey);
  };
}

// Example Plugin
export class CRMPlugin extends NexusPlugin {
  name = 'nexus-crm';
  version = '1.0.0';
  
  async onInstall(context: PluginContext) {
    // Run migrations
    await context.database.migrate('crm');
    
    // Create default pipeline
    await context.database.pipeline.create({
      data: {
        name: 'Default Pipeline',
        stages: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won']
      }
    });
  }
  
  getRoutes(): RouteDefinition[] {
    return [
      { path: '/api/crm/leads', methods: ['GET', 'POST'] },
      { path: '/api/crm/companies', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
    ];
  }
  
  getPermissions(): PermissionDefinition[] {
    return [
      { resource: 'leads', actions: ['read', 'write', 'delete'] },
      { resource: 'companies', actions: ['read', 'write', 'delete'] }
    ];
  }
  
  @EventHandler('lead.created')
  async handleLeadCreated(event: EventPayload<LeadCreatedEvent>) {
    console.log('New lead created:', event.payload.lead);
  }
}
```

### Frontend SDK

```typescript
// packages/sdk/src/ui.tsx

// Plugin Component Wrapper
export const PluginComponent: React.FC<{
  pluginId: string;
  component: string;
  props?: any;
}> = ({ pluginId, component, props }) => {
  const { loadComponent } = usePluginLoader();
  const RemoteComponent = React.lazy(() => loadComponent(pluginId, component));
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RemoteComponent {...props} />
    </Suspense>
  );
};

// Hook for plugin APIs
export function usePluginAPI(pluginId: string) {
  return useMemo(() => {
    return {
      query: <T>(endpoint: string, options?: RequestInit) => 
        fetch(`/api/plugins/${pluginId}/${endpoint}`, options).then(r => r.json()),
      
      mutate: <T>(endpoint: string, data: any, options?: RequestInit) =>
        fetch(`/api/plugins/${pluginId}/${endpoint}`, {
          ...options,
          method: 'POST',
          body: JSON.stringify(data)
        }).then(r => r.json())
    };
  }, [pluginId]);
}

// Widget Registration
export function registerWidget(widget: WidgetDefinition) {
  const registry = useWidgetRegistry();
  useEffect(() => {
    registry.register(widget);
    return () => registry.unregister(widget.id);
  }, []);
}

// Menu Registration
export function registerMenu(menu: MenuDefinition) {
  const registry = useMenuRegistry();
  useEffect(() => {
    registry.register(menu);
    return () => registry.unregister(menu.id);
  }, []);
}
```

---

## Scaling Strategy

Stratégie de scaling horizontal et vertical.

### Infrastructure Scaling

```yaml
# infra/kubernetes/cluster.yaml

apiVersion: v1
kind: Namespace
metadata:
  name: nexusos

---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: nexusos
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60

---
# Database Connection Pooling
apiVersion: v1
kind: ConfigMap
metadata:
  name: database-config
  namespace: nexusos
data:
  POOL_SIZE: "20"
  MAX_CONNECTIONS: "100"
  IDLE_TIMEOUT: "30000"

---
# Redis Cluster
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
  namespace: nexusos
spec:
  serviceName: redis
  replicas: 6
  selector:
    matchLabels:
      app: redis
  template:
    spec:
      containers:
      - name: redis
        image: redis:7
        command:
        - redis-server
        - --cluster-enabled
        - "yes"
        - --cluster-config-file
        - /data/nodes.conf
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi

---
# Message Queue Scaling
apiVersion: apps/v1
kind: Deployment
metadata:
  name: workers
  namespace: nexusos
spec:
  replicas: 10
  selector:
    matchLabels:
      app: workers
  template:
    spec:
      containers:
      - name: worker
        image: nexusos/workers:latest
        env:
        - name: CONCURRENCY
          value: "5"
        - name: QUEUE_PREFIX
          value: "nexus"
```

### Database Scaling

```typescript
// packages/core/database/sharding.ts

class DatabaseSharding {
  private shards: Map<string, PrismaClient>;
  
  getShard(tenantId: string): PrismaClient {
    const shardKey = this.getShardKey(tenantId);
    
    if (!this.shards.has(shardKey)) {
      this.shards.set(shardKey, new PrismaClient({
        datasourceUrl: process.env[`DATABASE_${shardKey}_URL`]
      }));
    }
    
    return this.shards.get(shardKey)!;
  }
  
  private getShardKey(tenantId: string): string {
    // Consistent hashing
    const hash = this.hash(tenantId);
    const shardCount = parseInt(process.env.SHARD_COUNT || '4');
    return `shard_${hash % shardCount}`;
  }
}

// Read Replicas
class ReadReplicaManager {
  private primary: PrismaClient;
  private replicas: PrismaClient[];
  private replicaIndex = 0;
  
  getReadClient(): PrismaClient {
    // Round-robin across replicas
    const client = this.replicas[this.replicaIndex];
    this.replicaIndex = (this.replicaIndex + 1) % this.replicas.length;
    return client;
  }
  
  getWriteClient(): PrismaClient {
    return this.primary;
  }
}
```

### Caching Strategy

```typescript
// packages/core/cache/cache-manager.ts

import { Redis } from 'ioredis';

class CacheManager {
  private redis: Redis;
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } else {
      await this.redis.set(key, JSON.stringify(value));
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  // Multi-level caching
  async getWithFallback<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    // Try L1 cache (memory)
    const l1Cache = memoryCache.get<T>(key);
    if (l1Cache) return l1Cache;
    
    // Try L2 cache (Redis)
    const l2Cache = await this.get<T>(key);
    if (l2Cache) {
      memoryCache.set(key, l2Cache, 60); // 1min L1
      return l2Cache;
    }
    
    // Fetch from source
    const data = await fetchFn();
    
    // Populate caches
    memoryCache.set(key, data, 60);
    await this.set(key, data, ttl);
    
    return data;
  }
}

// Cache decorators
const Cacheable = (keyPattern: string, ttl: number = 3600) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const key = keyPattern.replace(/{(\w+)}/g, (_, param) => args[param]);
      const cached = await cacheManager.get(key);
      
      if (cached) return cached;
      
      const result = await originalMethod.apply(this, args);
      await cacheManager.set(key, result, ttl);
      
      return result;
    };
  };
};

const CacheInvalidate = (pattern: string) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      await cacheManager.invalidate(pattern);
      return result;
    };
  };
};
```

### CDN & Edge Caching

```yaml
# infra/traefik/dynamic.yml

http:
  middlewares:
    cache-static:
      headers:
        customResponseHeaders:
          Cache-Control: "public, max-age=31536000, immutable"
    
    cache-api:
      buffersize:
        maxSize: 4096
    
    rate-limit:
      rateLimit:
        average: 100
        burst: 50

  routers:
    static-assets:
      rule: "PathPrefix(`/static`)"
      service: static
      middlewares:
        - cache-static
    
    api:
      rule: "PathPrefix(`/api`)"
      service: api
      middlewares:
        - rate-limit
```

---

## Roadmap Technique

### Phase 1: Foundation (Months 1-3)

**Objectif:** Core system fonctionnel

- [ ] Setup monorepo (Turborepo/Nx)
- [ ] Core authentication & RBAC
- [ ] Multi-tenant system (row-level)
- [ ] Plugin engine (basic)
- [ ] Event bus (Redis-based)
- [ ] Database schema core
- [ ] API gateway basic
- [ ] Frontend shell (Next.js)
- [ ] Theme engine (basic)
- [ ] Docker setup

### Phase 2: Plugin System (Months 4-6)

**Objectif:** Plugin system mature

- [ ] Plugin CLI complete
- [ ] Hot reload development
- [ ] Plugin marketplace (basic)
- [ ] Plugin sandboxing
- [ ] Migration system
- [ ] Dependency resolution
- [ ] Version management
- [ ] Plugin signatures & security
- [ ] Documentation SDK

### Phase 3: Core Plugins (Months 7-9)

**Objectif:** Plugins officiels de base

- [ ] CRM plugin
- [ ] Workflows plugin
- [ ] AI Engine plugin
- [ ] Email plugin
- [ ] Calendar plugin
- [ ] Files plugin
- [ ] Analytics plugin
- [ ] Notifications plugin

### Phase 4: Advanced Features (Months 10-12)

**Objectif:** Fonctionnalités avancées

- [ ] Workflow builder visuel
- [ ] AI Agents marketplace
- [ ] Advanced theming
- [ ] White-label complete
- [ ] Custom domains
- [ ] Advanced RBAC
- [ ] Audit logging
- [ ] Performance optimization

### Phase 5: Scale & Growth (Months 13-15)

**Objectif:** Production-ready à grande échelle

- [ ] Database sharding
- [ ] Multi-region deployment
- [ ] Advanced caching
- [ ] CDN integration
- [ ] Monitoring & observability
- [ ] Disaster recovery
- [ ] Security hardening
- [ ] Compliance (GDPR, SOC2)

### Phase 6: Ecosystem (Months 16-18)

**Objectif:** Marketplace et écosystème

- [ ] Public marketplace launch
- [ ] Developer portal
- [ ] Partner program
- [ ] Certification program
- [ ] Community forums
- [ ] Plugin revenue sharing
- [ ] Third-party integrations

---

## Conclusion

NexusOS représente une architecture enterprise-grade complète pour une plateforme SaaS modulaire. Les principes clés sont :

1. **Core Minimaliste** : Seulement l'infrastructure essentielle
2. **Tout est Plugin** : Extensibilité maximale
3. **Event-Driven** : Couplage faible entre composants
4. **Multi-Tenant Native** : Isolation et sécurité
5. **Developer-First** : SDK et outils complets
6. **Scalable by Design** : Horizontal scaling prévu
7. **Security First** : Multiple layers de sécurité
8. **Marketplace Ready** : Écosystème extensible

Cette architecture permet de construire un produit valorisable plusieurs millions d'euros, concurrent direct des leaders du marché tout en étant spécialisé sur la prospection B2B, le marketing digital et l'IA.
