help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## build Go code
	GOOS=linux go build -o hello-linux.exe main.go
	GOOS=windows go build -o hello-windows.exe main.go
	GOOS=darwin GOARCH=amd64 go build -o hello-darwin.exe main.go

clean: ## remove binaries
	rm -f *.exe
