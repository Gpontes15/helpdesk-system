FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

# Recebe o token como build arg e o expõe como variável de ambiente
# para o Next.js "assar" a variável NEXT_PUBLIC_ no bundle durante o build
ARG NEXT_PUBLIC_API_ESTOQUE_TOKEN
ENV NEXT_PUBLIC_API_ESTOQUE_TOKEN=$NEXT_PUBLIC_API_ESTOQUE_TOKEN

RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]