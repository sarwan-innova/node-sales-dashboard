# Deliberately old base image (Node 16 / Alpine 3.16, both end-of-life) from the
# ECR Public mirror of the official image. The remediation platform moves it.
FROM public.ecr.aws/docker/library/node:16-alpine3.16

WORKDIR /app
COPY package.json .
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js .

ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "server.js"]
