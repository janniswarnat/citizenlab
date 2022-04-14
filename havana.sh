#!/usr/bin/env bash

set -ex

kubectl config use-context havana
# Services
kubectl apply -f front-service.yaml,mailcatcher-service.yaml,postgres-citizenlab-service.yaml,que-service.yaml,web-service.yaml
# PersistentVolumes
kubectl apply -f postgres-citizenlab-persistentvolumeclaim.yaml
# Deployments
kubectl apply -f mailcatcher-deployment.yaml,postgres-citizenlab-deployment.yaml
kubectl wait --for=condition=available --timeout=300s deployment/mailcatcher
kubectl wait --for=condition=available --timeout=300s deployment/postgres-citizenlab
# Jobs
kubectl apply -f rake-postgres-citizenlab-create.yaml
kubectl wait --for=condition=complete --timeout=300s job/rake-postgres-citizenlab-create
kubectl apply -f rake-postgres-citizenlab-reset.yaml
kubectl wait --for=condition=complete --timeout=300s job/rake-postgres-citizenlab-reset
# Deployments
kubectl apply -f que-deployment.yaml,web-deployment.yaml
kubectl wait --for=condition=available --timeout=300s deployment/que
kubectl wait --for=condition=available --timeout=300s deployment/web
kubectl apply -f front-deployment.yaml
kubectl wait --for=condition=available --timeout=300s deployment/front
# Rest
kubectl apply -f ../janniswarnat/foreman/ingress.yaml
