db-wipe:
	docker compose down -v

db-up:
	docker compose up -d

migrate:
	npm run migrate

all:
	docker compose down
	docker compose up -d
	sleep 5
	npm run migrate
	npm run server