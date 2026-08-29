FROM node:20-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node prisma ./prisma/
RUN npx prisma generate

COPY --chown=node:node . .

EXPOSE 3000

USER node

CMD ["npm", "run", "dev"]