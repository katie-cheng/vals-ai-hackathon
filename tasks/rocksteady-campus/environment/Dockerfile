FROM mcr.microsoft.com/playwright:v1.64.1-noble

# The verifier runs in this container after the agent (shared mode), so the image carries its browser driver.
# The base image ships Node and the matching Chromium build under /ms-playwright.
RUN mkdir -p /opt/verifier \
    && cd /opt/verifier \
    && npm init -y >/dev/null \
    && npm install --no-audit --no-fund playwright@1.64.1

WORKDIR /app
COPY app/ /app/
RUN npm ci --no-audit --no-fund
