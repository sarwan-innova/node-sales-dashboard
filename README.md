# node-sales-dashboard

Node.js + Express sales dashboard (revenue KPI, sparkline, revenue by region).

**Deliberately vulnerable test app** for the image remediation platform — never deploy it publicly.

- Base image: `public.ecr.aws/docker/library/node:16-alpine3.16` (end-of-life)
- Pinned old dependencies — package.json: express 4.17.1, lodash 4.17.15, axios 0.21.1, moment 2.29.1

Every push to `main` is built by AWS CodeBuild, pushed to ECR and scanned; the
remediation console can then propose an AI fix as a `fix/...` branch + pull request.

Run locally: `docker build -t node-sales-dashboard . && docker run --rm -p 3000:3000 node-sales-dashboard` then open http://localhost:3000
