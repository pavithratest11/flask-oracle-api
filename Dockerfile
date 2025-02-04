# Use an official Python image
FROM python:3.9-slim

# Install Oracle Instant Client dependencies
RUN apt-get update && apt-get install -y \
    libaio1 \
    curl \
    unzip

# Download and install Oracle Instant Client
RUN mkdir -p /opt/oracle && \
    curl -o /opt/oracle/instantclient-basiclite-linux.x64-19.12.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/1912000/instantclient-basiclite-linux.x64-19.12.0.0.0dbru.zip && \
    unzip /opt/oracle/instantclient-basiclite-linux.x64-19.12.0.0.0dbru.zip -d /opt/oracle && \
    rm /opt/oracle/instantclient-basiclite-linux.x64-19.12.0.0.0dbru.zip && \
    echo /opt/oracle/instantclient_19_12 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

# Install required Python packages
COPY requirements.txt /app/
RUN pip install -r /app/requirements.txt

# Set working directory and copy your Flask API code
WORKDIR /app
COPY . /app

CMD ["gunicorn", "app:app"]
