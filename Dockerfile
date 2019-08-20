# resource https://github.com/BretFisher/node-docker-good-defaults/blob/master/Dockerfile
FROM node:12-alpine

# install dependencies first, in a different location for easier app bind mounting for local development
# due to default /opt permissions we have to create the dir with root and change perms
RUN mkdir /opt/node_app && chown node:node /opt/node_app
WORKDIR /opt/node_app

COPY package.json tsconfig.json yarn.lock ./

RUN yarn install
ENV PATH /opt/node_app/node_modules/.bin:$PATH

COPY src ./src
RUN yarn build-ts
RUN pwd
RUN ls -al node_modules

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

CMD ["node", "dist/server.js"]


