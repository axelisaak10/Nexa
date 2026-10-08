FROM node:22.22.3-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=80 SOCKET_PORT=6061 DATA_DIR=/data
COPY --chown=node:node practica-devops/package.json practica-devops/server.mjs practica-devops/contracts.mjs practica-devops/schema.sql ./
COPY --chown=node:node practica-devops/public ./public
RUN mkdir -p /data/backups && chown -R node:node /data
USER node
VOLUME ["/data"]
EXPOSE 80 6061
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:80/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
