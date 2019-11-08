FROM nginx:1.12.2
LABEL maintainer="Lunit"

RUN apt-get update && \
#    apt-get upgrade -y && \
    apt-get install -y \
    procps \
    curl \
	vim

RUN mkdir -p /home/annotation/
RUN mkdir -p /home/annotation/logs

# NGINX config for loading conf files from sites-enabled
COPY nginx.conf /etc/nginx/nginx.conf

# COPY default files to the sites-enabled and sites-available
COPY default /etc/nginx/sites-enabled/default
COPY default /etc/nginx/sites-available/default

# File for nginx configuration
COPY mmg-annotation.conf /etc/nginx/sites-available/mmg_annotation.conf

# create soft link from site available to enableed
RUN ln -s /etc/nginx/sites-available/mmg_annotation.conf /etc/nginx/sites-enabled/mmg_annotation.conf