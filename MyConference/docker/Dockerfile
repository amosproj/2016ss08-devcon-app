FROM osrgroup/amos-downloader-base-image:1.0


ENV HTML_INDEX_FILE MyConference.apk
ADD assets/$HTML_INDEX_FILE /var/www/html/$HTML_INDEX_FILE
RUN mkdir -p /etc/service/nginx
RUN cp /assets/run /etc/service/nginx/run
RUN chmod +x /etc/service/nginx/run
EXPOSE 80

