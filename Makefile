.PHONY: help serve build publish docs install clean book bump_binder notebooks

NB_SERVER_OPTS = --port 8889 --no-browser --NotebookApp.allow_origin="*" --NotebookApp.disable_check_xsrf=True --NotebookApp.token='' --MappingKernelManager.cull_idle_timeout=300

BINDER_REGEXP=.*"message": "([^"]+)".*

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

serve: start_notebook start_webpack ## Start Python and webpack watch (must run with make -j2)
	@echo "Serving..."

build: build_py build_js ## Build python package and JS bundle
	@echo "Built python package and JS bundle"

publish: publish_py publish_js ## Build python package and JS bundle
	@echo "Published python package and JS bundle"

install: ## Installs Python package locally
	pip install -e .

notebooks: ## Convert notebooks to HTML for Gitbooks
	cd docs && python convert_notebooks_to_html_partial.py

docs: notebooks ## Runs documentation locally
	cd docs && guard

internal_examples: ## Converts internal examples for development
	nbinteract -t local packages/nbinteract-core/example-notebooks/* \
	  -o packages/nbinteract-core/examples

test: ## Run tests
	python setup.py test

test-all: ## Run tests, including slow ones
	python setup.py test -a '--runslow'

ping_binder: ## Force-updates BinderHub image
	sleep 5 && \
	curl -s https://mybinder.org/build/gh/SamLau95/nbinteract-image/master |\
		grep -E '${BINDER_REGEXP}' |\
		sed -E 's/${BINDER_REGEXP}/\1/' &

bump_binder: ## Updates Binder nbinteract version and rebuilds image
	VERSION=$$(grep -E -o [0-9]+\.[0-9]+\.[0-9]+ setup.py) ;\
	cd ../nbinteract-image ;\
	sed -E -i '' "s/nbinteract.*/nbinteract>=$$VERSION/" requirements.txt;\
	git add requirements.txt ;\
	git commit -m "nbinteract v$$VERSION" ;\
	git push origin master ;\
	cd ../nbinteract ;\
	make ping_binder

start_notebook:
	python -m notebook $(NB_SERVER_OPTS)

start_webpack:
	lerna run serve --stream

build_py: ## Build python package
	rm -rf dist/*
	python setup.py bdist_wheel

build_js: ## Build Javascript bundle
	lerna run build --stream

publish_py: build_py ## Publish nbinteract to PyPi and updates Binder image
	twine upload dist/*
	make bump_binder

publish_js: build_js ## Publish nbinteract to npm
	lerna publish --force-publish=* -m "Publish js %s"

clean: ## Clean built Python and JS files
	rm -rf build/* dist/*
	lerna run clean
