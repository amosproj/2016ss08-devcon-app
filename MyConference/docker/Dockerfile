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

FROM osrgroup/amos-downloader-base-image:1.0


ENV HTML_INDEX_FILE my-conference.apk
ADD assets/$HTML_INDEX_FILE /var/www/html/$HTML_INDEX_FILE
# ------------------Install jdk 8
RUN /usr/bin/add-apt-repository -y "ppa:openjdk-r/ppa" \
  && apt-get -y update \
  && apt-get -y --no-install-recommends install \
    openjdk-8-jdk openjdk-8-jre-headless
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
# ------------------Install Baasbox
RUN apt-get update && \
    apt-get install -y software-properties-common wget unzip && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
RUN wget http://www.baasbox.com/download/baasbox-stable.zip && \
    unzip -o baasbox-stable.zip && \
    mv baasbox*/ /etc/service/baasbox && \
    mkdir -p /etc/service/baasbox
ADD run /etc/service/baasbox/run
RUN chmod +x /etc/service/baasbox/run