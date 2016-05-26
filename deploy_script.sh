#!/bin/sh
set -e
# Script for deploy image to docker hub

cd MyConference/
docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker pull osrgroup/amos-downloader-base-image:1.0
docker build -t clemenshuebner/amos-ss16-proj8:1.0 docker/
docker push clemenshuebner/amos-ss16-proj8:1.0
