# Deploy ChaosForge on Render

Use Render for the current live Twitch app. It runs a persistent Node web service; Vercel is suitable for a presentation or short demo only, not this application's long-lived EventSub connection and in-memory shared state.

## 1 Create a private repository

Create an empty private GitHub repository, then run these commands in PowerShell from this project folder. Replace the sample URL with your own repository URL.

```powershell
git remote add origin https://github.com/YOUR-USERNAME/chaosforge.git
git branch -M main
git push -u origin main
```

Do not upload `.env`. It is already ignored by Git.

## 2 Create the Render web service

1. Go to [Render](https://render.com/) and select **New > Web Service**.
2. Connect GitHub and select the ChaosForge repository.
3. Use these settings:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check path | `/deck?mode=demo` |
| Instance count | 1 |

The application uses Render's `PORT` automatically. The server binds to `0.0.0.0` in production.

## 3 Add environment variables

In Render, open **Environment** and add these values there. Never commit them to the repository and never paste token values into chat.

```text
NODE_ENV=production
HOST=0.0.0.0
TWITCH_CLIENT_ID=62kid1hd2lof776aye7tqf3ailo0y4
TWITCH_USER_TOKEN=<your existing private token>
TWITCH_BROADCASTER_ID=<your broadcaster ID>
TWITCH_USER_ID=<your Twitch user ID>
EVENTSUB_URL=wss://eventsub.wss.twitch.tv/ws
```

`OPENAI_API_KEY` is not needed because the current project uses the deterministic parser only.

Obtain or refresh the Twitch values locally with `npm run twitch:login` and `npm run twitch:check`; do not make the hosted `/auth/save` callback public. The original localhost-only safeguard remains intentional.

## 4 Deploy and test

Click **Create Web Service**. After deployment, Render gives you an HTTPS URL such as `https://chaosforge.onrender.com`.

Use:

```text
https://YOUR-SERVICE.onrender.com/deck?mode=demo
https://YOUR-SERVICE.onrender.com/overlay?mode=demo
```

Keep the service at one instance. The queue and active round are in memory, so multiple instances would not share state. A free Render service can spin down after inactivity, so use an always-on plan for a real Twitch stream.

## Vercel

You can deploy the project to Vercel as an Express Function for a preview or presentation. Do not rely on that deployment for continuous EventSub connection state: function instances may change between requests and the current queue is not durable. Use Render for the working live app.
