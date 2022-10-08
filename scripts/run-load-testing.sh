#! /bin/bash
cd tests
docker run --rm --add-host=kv-store.dev:host-gateway -i grafana/k6 run --vus 1000 --duration 120s - <load-test.js
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT