# base image
FROM node:14.15.4-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . ./

ARG ONECADEMYCRED_PROJECT_ID="Default Value"
ARG ONECADEMYCRED_CLIENT_EMAIL="Default Value"
ARG ONECADEMYCRED_CLIENT_ID="Default Value"
ARG ONECADEMYCRED_CLIENT_X509_CERT_URL="Default Value"
ARG ONECADEMYCRED_PRIVATE_KEY="Default Value"
ARG ONECADEMYCRED_PRIVATE_KEY_ID="Default Value"

ENV ONECADEMYCRED_PROJECT_ID=$ONECADEMYCRED_PROJECT_ID
ENV ONECADEMYCRED_CLIENT_EMAIL=$ONECADEMYCRED_CLIENT_EMAIL
ENV ONECADEMYCRED_CLIENT_ID=$ONECADEMYCRED_CLIENT_ID
ENV ONECADEMYCRED_CLIENT_X509_CERT_URL=$ONECADEMYCRED_CLIENT_X509_CERT_URL
ENV ONECADEMYCRED_PRIVATE_KEY=$ONECADEMYCRED_PRIVATE_KEY
ENV ONECADEMYCRED_PRIVATE_KEY_ID=$ONECADEMYCRED_PRIVATE_KEY_ID

RUN npm run build

# Run the web service on container startup.
CMD [ "npm", "start" ]