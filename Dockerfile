FROM ubuntu:16.04
LABEL maintainer="Lunit"

RUN sed -i "s/archive.ubuntu.com/mirror.kakao.com/g" /etc/apt/sources.list

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
	build-essential \
	vim \
	git \
	rdate \
	apt-utils \
	python-dev \
	python-setuptools \
	python-pip \
	python-scipy \
	libmysqlclient-dev \
	python-gdcm \
	tmpreaper \
	supervisor \
	sudo \
	libtiff5-dev libjpeg8-dev zlib1g-dev \
	libfreetype6-dev liblcms2-dev libwebp-dev tcl8.6-dev tk8.6-dev python-tk && \
    rm -rf /var/lib/apt/lists/*

RUN pip install pip --upgrade

RUN pip install \
	uwsgi \
	Django==1.10.6 \
	jsonstruct==0.2a1 \
	PyJWT \
	SQLAlchemy \
	MySQL-python \
	pydicom

RUN mkdir /var/log/uwsgi
RUN mkdir /var/run/uwsgi
RUN mkdir /etc/uwsgi
RUN mkdir /etc/uwsgi/apps-enabled
RUN mkdir /etc/uwsgi/apps-available
COPY run/supervisor/* /etc/supervisor/conf.d/

# Copying uwsgi ini files to the directory
COPY run/uwsgi/mmg-annotation-uwsgi-conf.ini /etc/uwsgi/apps-enabled/mmg-annotation-uwsgi-conf.ini
CMD ["supervisord", "-n"]

# Create shared volume between this contaier(tool) and nginx container
RUN mkdir /var/run/lunit/

# Make annotation_result, logs dir
RUN mkdir -p  /home/annotation/logs

# Change directory permission for uwsgi to able to write logs
RUN chown www-data:www-data /home/annotation/logs

RUN mkdir -p /home/annotation/result
RUN chown www-data:www-data /home/annotation/result

# If the permission is not set right, it can't create the file
RUN chown www-data:www-data /var/run/lunit
