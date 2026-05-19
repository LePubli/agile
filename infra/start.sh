# ==================== SCRIPTS DE DÉMARRAGE ====================

#!/bin/bash
set -e

echo "🚀 Démarrage de NexusOS..."

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier que docker-compose est disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Déterminer la commande docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

cd "$(dirname "$0")"

case "${1:-up}" in
    up)
        echo "📦 Démarrage des services..."
        $COMPOSE_CMD up -d
        
        echo "⏳ Attente que les services soient prêts..."
        sleep 30
        
        echo "🗄️ Exécution des migrations..."
        $COMPOSE_CMD exec -T api npx prisma migrate deploy || true
        
        echo "✅ NexusOS est prêt!"
        echo ""
        echo "📍 Web App: http://localhost:3001"
        echo "📍 API: http://localhost:3000"
        echo "📍 MinIO Console: http://localhost:9001"
        echo ""
        echo "Pour voir les logs: $COMPOSE_CMD logs -f"
        ;;
        
    down)
        echo "🛑 Arrêt des services..."
        $COMPOSE_CMD down
        ;;
        
    restart)
        echo "🔄 Redémarrage des services..."
        $COMPOSE_CMD restart
        ;;
        
    logs)
        $COMPOSE_CMD logs -f ${2:-}
        ;;
        
    migrate)
        echo "🗄️ Exécution des migrations..."
        $COMPOSE_CMD exec -T api npx prisma migrate deploy
        $COMPOSE_CMD exec -T api npx prisma db seed || true
        ;;
        
    seed)
        echo "🌱 Seed de la base de données..."
        $COMPOSE_CMD exec -T api npx prisma db seed
        ;;
        
    status)
        echo "📊 Status des services..."
        $COMPOSE_CMD ps
        ;;
        
    build)
        echo "🔨 Build des images..."
        $COMPOSE_CMD build --no-cache
        ;;
        
    *)
        echo "Usage: $0 {up|down|restart|logs|migrate|seed|status|build}"
        exit 1
        ;;
esac
