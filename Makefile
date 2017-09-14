.PHONY: help build serve start_notebook start_webpack

NOTEBOOK_OPTS = --no-browser --NotebookApp.allow_origin="*" --NotebookApp.disable_check_xsrf=True --NotebookApp.token=''

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build Javascript bundle
	yarn run build

serve: start_notebook start_webpack ## Start Python and webpack watch (must run with make -j2)
	@echo "Serving..."

start_notebook:
	python -m notebook $(NOTEBOOK_OPTS)

start_webpack:
	yarn run watch
