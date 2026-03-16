#!/bin/bash

set -e 

WEB_ENV="nextmarkapp-prod"
WORKER_ENV="nextmark-workers"
SCHEDULER_ENV="nextmark-schefuler"

echo="Deploying to web environment..."
eb deploy $WEB_ENV

echo "Fetching latest version label..."
VERSION=$(eb appversion --all | head -n 1 | awk '{print$1}')

echo "Latest version: $VERSION"

echo "Deploing same version to workers..."
eb deploy $WORKER_ENV --version $VERSION

echo "Deploying smae version to schedulers..."
eb deploy $SCHEDULER_ENV --version $VERSION

echo "Deployment completed for all environments."