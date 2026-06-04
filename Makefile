.PHONY: help dev build start stop clean install db-migrate db-seed db-reset docker-up docker-down docker-build logs

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ─── Development ───────────────────────────────────────────────
install: ## Install all dependencies
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed!"

dev: ## Start both servers in development mode (requires tmux or run in separate terminals)
	@echo "🚀 Starting development servers..."
	@echo "Backend: http://localhost:5000"
	@echo "Frontend: http://localhost:3000"
	@make -j 2 dev-backend dev-frontend

dev-backend: ## Start backend dev server only
	cd backend && npm run dev

dev-frontend: ## Start frontend dev server only
	cd frontend && npm run dev

# ─── Database ───────────────────────────────────────────────────
db-generate: ## Generate Prisma client
	cd backend && npx prisma generate

db-migrate: ## Run database migrations
	cd backend && npx prisma migrate dev

db-migrate-prod: ## Run migrations in production (no prompt)
	cd backend && npx prisma migrate deploy

db-seed: ## Seed database with demo data
	cd backend && npm run db:seed

db-reset: ## Reset database (WARNING: destroys all data)
	@read -p "⚠️  This will delete ALL data. Are you sure? [y/N] " confirm && \
	[ "$$confirm" = "y" ] && cd backend && npx prisma migrate reset --force || echo "Aborted"

db-studio: ## Open Prisma Studio (database GUI)
	cd backend && npx prisma studio

# ─── Build ──────────────────────────────────────────────────────
build-backend: ## Build backend for production
	cd backend && npm run build

build-frontend: ## Build frontend for production
	cd frontend && npm run build

build: ## Build all for production
	@make build-backend
	@make build-frontend

# ─── Docker ─────────────────────────────────────────────────────
docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start all Docker services
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:5000"
	@echo "  Postgres:  localhost:5432"

docker-down: ## Stop all Docker services
	docker-compose down

docker-restart: ## Restart all Docker services
	docker-compose restart

docker-prod: ## Start with production profile (includes Nginx)
	docker-compose --profile production up -d

logs: ## Show Docker logs (all services)
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs only
	docker-compose logs -f frontend

# ─── Setup ──────────────────────────────────────────────────────
setup: ## Full first-time setup
	@echo "🔧 Setting up SLM Store..."
	@cp -n .env.example .env 2>/dev/null || true
	@cp -n backend/.env.example backend/.env 2>/dev/null || true
	@cp -n frontend/.env.example frontend/.env.local 2>/dev/null || true
	@make install
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Edit backend/.env with your database and API credentials"
	@echo "  2. Edit frontend/.env.local with your API URL"
	@echo "  3. Run: make docker-up (Docker) or start Postgres manually"
	@echo "  4. Run: make db-migrate"
	@echo "  5. Run: make db-seed"
	@echo "  6. Run: make dev"

clean: ## Clean all build artifacts and node_modules
	@echo "🧹 Cleaning..."
	rm -rf backend/dist backend/node_modules backend/logs
	rm -rf frontend/.next frontend/node_modules frontend/out
	@echo "✅ Clean complete"
