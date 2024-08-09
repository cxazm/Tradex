# Defined main target of the Makefile
all: build-backend build-frontend

# Build the  project
build-backend:
	@echo "Building Go project..."
	cd backend && go build -o bin/Tradex cmd/main.go

# Run tests for  project
test-backend:
	@echo "Running tests for Go project..."
	cd backend && go test ./...

# Clean up the Go project
clean-backend:
	@echo "Cleaning up Go project..."
	cd backend && rm -f bin/Tradex

# Run the Go project
run-backend: build-backend
	@echo "Running Go project..."
	./backend/bin/Tradex

# Tidy up Go modules
tidy-backend:
	@echo "Tidying up Go modules..."
	cd backend && go mod tidy

# Start Next.js development server
dev-frontend:
	@echo "Starting Next.js development server..."
	cd frontend && npm run dev

# Build Next.js production bundle
build-frontend:
	@echo "Building Next.js production bundle..."
	cd frontend && npm run build

.PHONY: all build-backend test-backend clean-backend run-backend tidy-backend dev-frontend build-frontend