FROM mcr.microsoft.com/playwright/python:v1.49.0-noble
RUN python -m pip install --no-cache-dir playwright==1.49.0
WORKDIR /app
COPY . /tests/
RUN chmod +x /tests/test.sh
