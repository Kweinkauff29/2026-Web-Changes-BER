# BER Floor Plans Library

A searchable floor plan viewer for Bonita Springs & Estero neighborhoods.

## Contents

- **floorplans-viewer.html** - Main viewer page
- **floorplan_manifest.json** - Index of all floor plans
- **extracted_pdfs/** - Directory containing all PDF files organized by neighborhood

## Deployment to Cloudflare Pages

### Option 1: Deploy via Wrangler CLI

1. Install Wrangler if not already installed:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create and deploy the Pages project:
   ```bash
   cd Floorplans
   wrangler pages deploy . --project-name=ber-floorplans
   ```

### Option 2: Deploy via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Click "Create a project" → "Direct Upload"
3. Name the project (e.g., `ber-floorplans`)
4. Upload the following files/folders:
   - `floorplans-viewer.html` (rename to `index.html` for root access)
   - `floorplan_manifest.json`
   - `extracted_pdfs/` folder (with all subdirectories)
5. Deploy!

## File Structure

```
Floorplans/
├── floorplans-viewer.html      # Main HTML page
├── floorplan_manifest.json     # JSON index (124 neighborhoods, 1,790 PDFs)
├── extracted_pdfs/             # All extracted PDFs
│   ├── bonita-bay/             # 117 floor plans
│   ├── pelican-landing/        # 115 floor plans
│   ├── the-brooks/             # 77 floor plans
│   └── ... (120+ neighborhoods)
├── extract_floorplans.py       # Script used to generate the above
└── Bonita Springs Floor Plans/ # Original source zip files
```

## Stats

- **124** Neighborhoods
- **1,790** Floor Plans
- Organized by community/neighborhood

## Accessing the Page

After deployment, the page will be available at:
- `https://ber-floorplans.pages.dev/floorplans-viewer.html`
- Or if you rename to `index.html`: `https://ber-floorplans.pages.dev/`

You can also add a custom domain through the Cloudflare Pages settings.
