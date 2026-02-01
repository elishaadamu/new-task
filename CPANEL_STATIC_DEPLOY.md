# How to Deploy to cPanel (Static Export)

Since you want to deploy a static version of your site using `npm run build`, follow these steps.

## Prerequisites

- cPanel host.
- Ability to upload files to `public_html`.

## Step 1: Configure for Static Export

(Done) We have already updated `next.config.mjs` to include `output: 'export'`.

## Step 2: Build the Project

1. Open your terminal in the project directory.
2. Run the build command:
   ```bash
   npm run build
   ```
   This will generate an **`out`** folder in your project root containing the static files (HTML, CSS, JS, Images).

## Step 3: Upload to cPanel

1. Log in to cPanel.
2. Go to **File Manager**.
3. Navigate to `public_html` (or the folder for your subdomain).
4. **Delete** any critical existing files index files (like `index.php` or `default.html`) if you are replacing an old site.
5. Create a **Zip archive** of the contents inside the **`out`** folder.
   - _Important:_ Do not zip the `out` folder itself, zip the _contents_ (index.html, \_next folder, etc.).
6. Upload the zip file to `public_html`.
7. **Extract** the zip file.
   - Ensure the `index.html` file is directly in `public_html` (not inside a subfolder).

## Step 4: Configure Fallback for Client-Side Routing (Important!)

Since this is a Single Page Application (SPA), navigating to a subpage like `/dashboard` directly might cause a 404 error because that file doesn't physically exist (it's handled by React/Next.js).

To fix this, create a `.htaccess` file in your `public_html` folder with the following content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures that any request for a page that doesn't exist (like `/auth/login`) is redirected to `index.html` so the React app can handle the routing.

## Troubleshooting

- **Images not loading?** Ensure `images: { unoptimized: true }` is in your `next.config.mjs` (we already set this).
- **404 on refresh?** Ensure you added the `.htaccess` file correctly.
- **API Calls failing?** Ensure your `NEXT_PUBLIC_API_BASE_URL` in `.env` is pointing to a live, accessible backend URL (e.g., `https://api.yourdomain.com`). Localhost URLs will not work on a live server.
