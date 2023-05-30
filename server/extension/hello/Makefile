help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## build Go code
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o hello-linux-amd64.exe main.go
	CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o hello-linux-arm64.exe main.go
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o hello-darwin-amd64.exe main.go
	CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -o hello-darwin-arm64.exe main.go
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o hello-windows-amd64.exe main.go
	CGO_ENABLED=0 GOOS=windows GOARCH=arm64 go build -o hello-windows-arm64.exe main.go

clean: ## remove binaries
	rm -f *.exe
