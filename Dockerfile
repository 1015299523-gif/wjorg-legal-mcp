# stdio 桥的容器镜像。目录评测（Glama / Docker MCP Catalog 等）用这个入口。
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY bin ./bin
COPY SKILL.md README.md ./

ENV NODE_ENV=production
ENV WJORG_MCP_URL=https://wjorg.com/mcp

ENTRYPOINT ["node", "/app/bin/wjorg-legal-mcp.js"]
