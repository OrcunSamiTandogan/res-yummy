# Yummy — production deployment checklist

This folder is configuration only. A deployment is not complete until the target host, TLS, DNS and production secrets have been verified. Never copy Eren's credentials, media or database.

## Before deploying

1. Verify that the existing Vercel project uses `OrcunSamiTandogan/res-yummy` and `master`, and record the last working commit.
2. Identify the **actual** public domain, API domain, DNS account and target VPS. No domain or VPS is assumed in these templates.
3. Confirm the target VPS has enough memory/disk, a working MongoDB service, and TCP 8672 available on loopback.
4. Back up Nginx configs and any existing Yummy MongoDB database and media volume. Never touch Eren's data or services.
5. Create a separate MongoDB user with least privilege for a **Yummy-only** database. Do not expose port 27017 to the internet.
6. Set up `yummy-api` service user, `/srv/yummy-cms/backend`, `/var/lib/yummy-cms/media` and mode 0600 `/etc/yummy-cms/api.env`. Ensure `MEDIA_ROOT` points to that persistent directory.
7. Generate distinct random `JWT_SECRET` and `PRIVACY_HASH_SECRET`. Configure `APP_ENV=production`, Mongo URI, the exact HTTPS `PUBLIC_ORIGIN` and `ADMIN_ORIGIN`.
8. Confirm public and API hosts are in the same **site** for host-only Secure SameSite cookies. A Vercel *.vercel.app URL and an unrelated API domain do not meet this condition.

## Install / validate

1. Install Python 3.12 venv, then `pip install --require-hashes -r requirements.lock` from `backend`.
2. Run backend tests. Use `python -m app.cli bootstrap-admin` only for an initial account, then remove bootstrap credentials from the long-running service environment.
3. Run `python -m app.cli seed-content` once. The command will not overwrite edited menu content.
4. Configure and enable the systemd unit using `deploy/yummy-api.service.example`. Check systemd journal and `curl -f http://127.0.0.1:8672/health`.
5. Install the Nginx template only after replacing placeholders and obtaining valid certs. Check with `nginx -t` before reloading. Open only 80/443 and restrict API traffic as appropriate.
6. From the deployed public HTTPS origin, check login/refresh/logout, GET/PUT menu with revision (expect 409 on stale data), site settings, message submission/reading, upload and browser image loading.
7. On Vercel, set `NEXT_PUBLIC_YUMMY_API_URL` to the actual API `https://.../api/v1` endpoint and `YUMMY_API_ORIGIN` to the origin without the API prefix. Redeploy frontend. Verify all four languages and WhatsApp links.
8. Verify media survives API restart and MongoDB is accessible only from the intended private network; test backups and restoration.

## Rollback

1. Remove the two new CMS environment variables from Vercel, then redeploy the previous working frontend build; the static GitHub menu remains the fallback.
2. Preserve the new database and media volume for later reconciliation. Changes made in MongoDB are **not** automatically exported to the GitHub menu JSON.
3. If the API must roll back, stop the Yummy API service only, switch to a saved release and restart; do not modify Eren's service.
4. Restore Yummy database backup only if absolutely required and after verifying the correct database target.

## Remaining ownership/credentials

This repository does **not** provide access to Vercel environment variables, DNS, VPS, TLS certificate issuance, MongoDB production secrets, or a production admin password. Those must be provided via authorized provider connections or provisioned directly by the operator. Do not commit secrets.
