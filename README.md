# Freelancer-Marketplace
a web-based Freelancer Marketplace  Platform that connects local service providers with clients in their geographical area,  facilitating secure, verified, and efficient service transactions.

## Project structure

server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    app.js
    server.js
  .env
  .gitignore
  package.json

client/
  src/
    App.jsx
    api.js
    main.jsx
    styles.css
  .env.example
  package.json

## Run backend

```bash
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

## Run frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Set frontend API URL by creating `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```
