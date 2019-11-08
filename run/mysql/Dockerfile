FROM mysql:5.7.20
LABEL maintainer="Lunit"

ENV init_path /docker-entrypoint-initdb.d/

# Update and setup basic environment
RUN apt-get update  && \
#    apt-get upgrade -y && \
    apt-get install -y \
    procps \
    curl \
	vim

# SQL file inside this directory will be automaticlly run when mysql image starts
# Note that these files run in alphabetical order. So we will setup database sql file prefixed with a
COPY database-setup.sql /docker-entrypoint-initdb.d/a-database-setup.sql
COPY mmg_annotation.sql /docker-entrypoint-initdb.d/mmg_annotation.sql