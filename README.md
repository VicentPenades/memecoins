# Cat Season

Landing page de memecoin construida con Nuxt 4, Tailwind CSS y un sistema de
votación respaldado por Neon PostgreSQL.

## Setup

```bash
npm install
cp .env.example .env
# Añade DATABASE_URL y VOTE_IP_HASH_SECRET a .env
npm run db:migrate
npm run dev
```

Para generar un secreto seguro:

```bash
openssl rand -hex 32
```

En Vercel deben configurarse `DATABASE_URL` y `VOTE_IP_HASH_SECRET` en
**Project Settings → Environment Variables**. La migración solo debe ejecutarse
manualmente cuando se crea o actualiza el esquema.

## Producción

```bash
npm run build
```

La aplicación usa funciones serverless para la API de votos, por lo que no debe
desplegarse como un sitio puramente estático.
