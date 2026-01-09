# BER Contacts API - Deployment Guide

This guide walks you through deploying the Cloudflare Worker that syncs sign-up checkboxes across all devices.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com) (free tier works)
2. **Node.js**: Install from [nodejs.org](https://nodejs.org) if not already installed

## Step 1: Install Wrangler CLI

Open a terminal and run:

```bash
npm install -g wrangler
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window. Log in and authorize Wrangler.

## Step 3: Create the D1 Database

Navigate to the project directory and create the database:

```bash
cd c:\Users\Kevin\2026-Web-Changes-BER\ber-contacts-api
wrangler d1 create ber-contacts-db
```

**IMPORTANT**: Copy the `database_id` from the output. It will look like:
```
✅ Successfully created DB 'ber-contacts-db'
database_id = "abc123-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Step 4: Update wrangler.toml

Open `wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with the ID from Step 3:

```toml
database_id = "abc123-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Step 5: Apply the Database Schema

Run this command to create the `signups` table:

```bash
wrangler d1 execute ber-contacts-db --file=schema.sql
```

## Step 6: Deploy the Worker

```bash
wrangler deploy
```

You'll see output like:
```
Published ber-contacts-api
https://ber-contacts-api.YOUR_SUBDOMAIN.workers.dev
```

**Copy this URL!**

## Step 7: Update the Frontend

Open `organization-contacts.html` and find this line near the top of the `<script>` section:

```javascript
const API_URL = 'https://ber-contacts-api.YOUR_SUBDOMAIN.workers.dev';
```

Replace `YOUR_SUBDOMAIN` with the actual subdomain from your Cloudflare account (shown in Step 6 output).

## Testing

1. Open the HTML page in a browser
2. Check a few boxes
3. Open the same page on another device or in an incognito window
4. The checked boxes should appear!

## Troubleshooting

- **CORS Errors**: The Worker already includes CORS headers for `*`. If hosting on WordPress, it should work.
- **API Not Responding**: Run `wrangler tail` to see live logs from your Worker.
- **Database Empty**: Run `wrangler d1 execute ber-contacts-db --command="SELECT * FROM signups"` to check.

## Commands Reference

| Command | Description |
|---------|-------------|
| `wrangler dev` | Run Worker locally for testing |
| `wrangler deploy` | Deploy to Cloudflare |
| `wrangler tail` | View live logs |
| `wrangler d1 execute ber-contacts-db --command="..."` | Run SQL queries |
