FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs index.html styles.css app.js atlas.js favicon.svg ./
COPY assets ./assets
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
USER node
CMD ["npm","start"]
