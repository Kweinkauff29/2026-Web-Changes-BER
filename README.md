# BER Web Changes - 2026

This repository contains various web tools and dashboards for Bonita & Estero Realtors.

## Project Structure

```
├── market-reports/          # Market Reports Dashboard
│   ├── market-reports-dashboard.html   # Interactive dashboard with charts
│   ├── ber-contacts-api/               # Cloudflare Worker API
│   └── *.xlsx                          # Original spreadsheet data
│
├── infographic-generator/   # Real Estate Infographic Generator
│   ├── infographic-generator.html      # Main generator page
│   ├── generate-infographic.js         # Generation logic
│   └── *.png                           # Templates and references
│
├── contacts-management/     # Organization Contacts System
│   ├── organization-contacts.html      # Contacts UI
│   ├── contacts.js                     # Contact management logic
│   └── contacts.json                   # Contact data
│
├── fast-stats/              # Fast Stats Generator
│   ├── fast-stats-generator.html       # Stats generator UI
│   └── BER FAST STATS.pdf              # Reference document
│
├── data-sources/            # Raw Data Files
│   └── *.xlsx                          # Excel data exports
│
├── misc-tools/              # Miscellaneous Tools & Debug Files
│   └── Various helper scripts and temp files
│
├── Video Generator/         # Video Generation Tools
│
├── Header.html              # Site header component
├── analytics-dashboard.html # Analytics dashboard
├── written-guides.html      # Written guides page
└── youtube-shorts-page.html # YouTube shorts page
```

## Main Projects

### 1. Market Reports Dashboard (`/market-reports`)
Interactive dashboard for tracking real estate market statistics:
- Monthly data entry with password protection
- Year-over-year comparison charts (2019-2025)
- Multi-metric trend comparison
- CSV export functionality
- Connected to Cloudflare D1 database

### 2. Infographic Generator (`/infographic-generator`)
Tool for creating real estate market infographics.

### 3. Contacts Management (`/contacts-management`)
Organization contact management system.

### 4. Fast Stats Generator (`/fast-stats`)
Quick stats generation tool for market reports.

## Cloudflare Worker API

The API is deployed at: `https://ber-contacts-api.bonitaspringsrealtors.workers.dev`

**Endpoints:**
- `GET /metrics` - Get all market metrics data
- `POST /metrics` - Add/update metric values
- `GET /metrics/export` - Download CSV export
- `GET /signups` - Contact signups (legacy)
