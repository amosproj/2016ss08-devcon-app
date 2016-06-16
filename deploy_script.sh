#!/bin/sh
set -e
# This file is part of MyConference.
#
# MyConference is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License version 3
# as published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should find a copy of the GNU Affero General Public License in the
# root directory along with this program.
# Script for deploy image to docker hub

cd MyConference/
docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker pull osrgroup/amos-downloader-base-image:1.0
docker build -t najmeddineaskri/amos-ss16-proj8:1.0 docker/
docker push najmeddineaskri/amos-ss16-proj8:1.0
