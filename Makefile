.PHONY: help install dev build test test-frontend test-backend test-integration lint format clean docker-build docker-run

help:
	@echo "Pellucid Insights - Development & Testing Commands"
	@echo ""
	@echo "Installation:"
	@echo "  make install          Install all dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start development server"
	@echo "  make dev-adk          Start with ADK backend"
	@echo ""
	@echo "Building:"
	@echo "  make build            Build for production"
	@echo ""
	@echo "Testing:"
	@echo "  make test             Run all tests"
	@echo "  make test-frontend    Run frontend tests"
	@echo "  make test-backend     Run backend tests"
	@echo "  make test-integration Run integration tests"
	@echo "  make test-coverage    Generate coverage reports"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             Run linting checks"
	@echo "  make format           Format code"
	@echo "  make type-check       Run TypeScript type checking"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build     Build Docker image"
	@echo "  make docker-run       Run Docker container"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            Clean build artifacts"
	@echo "  make smoke-test       Run smoke tests"

install:
	npm install
	cd adk-backend && pip install -r requirements.txt

dev:
	npm run dev

dev-adk:
	@echo "Starting ADK backend..."
	cd adk-backend && uvicorn main:app --reload --port 8080 &
	@echo "Starting frontend with ADK backend..."
	USE_ADK_BACKEND=true ADK_BACKEND_URL=http://localhost:8080 npm run dev

build:
	npm run build

test: test-frontend test-backend test-integration

test-frontend:
	npm run test:coverage

test-backend:
	cd adk-backend && pytest tests/ -v --cov=. --cov-report=term-missing

test-integration:
	cd adk-backend && pytest tests/ -v -m integration

test-coverage:
	@echo "Generating frontend coverage..."
	npm run test:coverage
	@echo ""
	@echo "Generating backend coverage..."
	cd adk-backend && pytest tests/ --cov=. --cov-report=html --cov-report=term-missing
	@echo "Backend coverage report: adk-backend/htmlcov/index.html"

lint:
	npm run lint
	cd adk-backend && flake8 . --max-line-length=100
	cd adk-backend && black --check . --line-length=100

format:
	cd adk-backend && black . --line-length=100
	cd adk-backend && isort . --profile black
	npx prettier --write .

type-check:
	npx tsc --noEmit
	cd adk-backend && mypy . --ignore-missing-imports

clean:
	rm -rf .next
	rm -rf node_modules
	cd adk-backend && rm -rf __pycache__ .pytest_cache .mypy_cache
	cd adk-backend && rm -rf htmlcov coverage.xml

docker-build:
	docker build -t pellucid-adk-backend:latest adk-backend/

docker-run:
	docker run -p 8080:8080 \
		-e GOOGLE_API_KEY=${GOOGLE_API_KEY} \
		-e ENVIRONMENT=development \
		pellucid-adk-backend:latest

smoke-test:
	cd adk-backend && python smoke_test.py

.PHONY: help install dev dev-adk build test test-frontend test-backend test-integration test-coverage lint format type-check clean docker-build docker-run smoke-test
