FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:20-alpine AS runtime

RUN npm install -g serve \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

USER appuser

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
