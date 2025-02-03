# Use an official Python image
FROM python:3.9-slim

# Install Oracle Instant Client dependencies
RUN apt-get update && apt-get install -y \
    libaio1 \
    curl \
    unzip

# Install required Python packages
COPY requirements.txt /app/
RUN pip install -r /app/requirements.txt

# Set working directory and copy your Flask API code
WORKDIR /app
COPY . /app

CMD ["gunicorn", "app:app"]
