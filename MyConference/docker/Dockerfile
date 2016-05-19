FROM osrgroup/amos-downloader-base-image:1.0


ENV HTML_INDEX_FILE MyConference.apk
ADD assets/$HTML_INDEX_FILE /var/www/html/$HTML_INDEX_FILE
RUN cd /etc/nginx
RUN exec /usr/sbin/nginx
