# Deploy ChaosForge on Render

Use Render for the live Twitch app or presentation demo. It runs a persistent Node web service with an in-memory shared state and long-lived EventSub connections.

## Option A: Deploy via Blueprint (Recommended - 1 Click)

A `render.yaml` Blueprint file is included at the repository root.

1. In Render, select **New > Blueprint** (or open your existing Blueprint deployment screen).
2. For **Blueprint Name**, enter: `chaosforge` (or any unique name).
3. Ensure the branch is set to `main` and Blueprint Path is set to `render.yaml`.
4. Click **Retry** / **Apply**. Render will automatically detect the web service configuration, build command, start command, health check (`/healthz`), and environment variables.
5. Click **Apply Changes** to deploy.

## Option B: Deploy via Web Service (Manual)

1. Go to [Render](https://render.com/) and select **New > Web Service**.
2. Connect your GitHub repository (`ChaosForge-deployment-and-compliance-check.`).
3. Configure the following settings:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check path | `/healthz` |
| Instance count | 1 |

The application reads Render's `PORT` and automatically binds to `0.0.0.0` in production.

## Environment Variables

The following default environment variables are already defined in `render.yaml`:
- `NODE_ENV`: `production`
- `HOST`: `0.0.0.0`
- `NODE_VERSION`: `22`
- `EVENTSUB_URL`: `wss://eventsub.wss.twitch.tv/ws`
- `TWITCH_CLIENT_ID`: `62kid1hd2lof776aye7tqf3ailo0y4`

### For Live Twitch Streaming (Optional)
If you wish to stream live Twitch events (beyond the login-free demo mode), open your service in Render, navigate to **Environment**, and add:
- `TWITCH_USER_TOKEN`: Your Twitch user OAuth token (from `npm run twitch:login`)
- `TWITCH_BROADCASTER_ID`: Your broadcaster user ID
- `TWITCH_USER_ID`: Your Twitch user ID

Never commit Twitch tokens to the Git repository.

## Testing Your Deployment

Once Render finishes deploying, your service URL will look like:
`https://chaosforge-xxxx.onrender.com`

Verify the deployment using:
- **Interactive Control Deck (Demo)**: `https://chaosforge-xxxx.onrender.com/deck?mode=demo`
- **OBS Canvas Overlay**: `https://chaosforge-xxxx.onrender.com/overlay?mode=demo`
- **Health Check**: `https://chaosforge-xxxx.onrender.com/healthz`
