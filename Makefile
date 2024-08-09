# Defined main target of the Makefile
all: build

# Build the Go project
build:
	@echo "Building the project..."
	go build -o exe/Tradex cmd/main.go

# Run tests
test:
	@echo "Running tests..."
	go test ./...

# Clean up the project
clean:
	@echo "Cleaning up..."
	rm -f Tradex/Tradex

# Run the project
run: build
	@echo "Running the project..."
	./exe/Tradex

# Tidy up Go modules
tidy:
	@echo "Tidying up Go modules..."
	go mod tidy

.PHONY: all build test clean run tidy
