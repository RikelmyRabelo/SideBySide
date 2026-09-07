FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 5173
RUN chown -R node:node /usr/src/app
USER node
CMD ["npm", "run", "dev:frontend", "--", "--host"]
