# Deploying RamzShop (6valley V15.6) on a VPS

Target: Ubuntu 22.04/24.04, 2 GB RAM minimum, a domain pointed at the server IP.

## 1. Server packages
```bash
sudo apt update && sudo apt install -y nginx mariadb-server unzip certbot python3-certbot-nginx \
  php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-mbstring php8.3-xml php8.3-zip \
  php8.3-intl php8.3-bcmath php8.3-fileinfo php8.3-sqlite3
sudo mysql_secure_installation
```

## 2. Database
```bash
sudo mysql -e "CREATE DATABASE ramzshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ramzshop_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL ON ramzshop.* TO 'ramzshop_user'@'localhost'; FLUSH PRIVILEGES;"
```

## 3. Upload the site
Copy `ramzshop-production.zip` to the server, then:
```bash
sudo mkdir -p /var/www/ramzshop && sudo unzip ramzshop-production.zip -d /var/www/ramzshop
cd /var/www/ramzshop
cp .env.example .env        # edit: APP_URL, DB_*, then:
php artisan key:generate
sudo chown -R www-data:www-data /var/www/ramzshop
sudo chmod -R 775 storage bootstrap/cache
```
Then open `https://your-domain/` once to run the installer wizard (purchase code + DB), or import your
local database dump (`mysqldump 6valley > dump.sql`) into `ramzshop` if you already installed locally.

## 4. Nginx (`/etc/nginx/sites-available/ramzshop`)
```nginx
server {
    server_name your-domain.com;
    root /var/www/ramzshop/public;
    index index.php;
    client_max_body_size 200M;

    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }
    location ~ /\.(?!well-known) { deny all; }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/ramzshop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```
Also set `upload_max_filesize = 200M` and `post_max_size = 200M` in `/etc/php/8.3/fpm/php.ini`.

## 5. Cron + storage link
```bash
php artisan storage:link
sudo crontab -u www-data -e   # add:
* * * * * cd /var/www/ramzshop && php artisan schedule:run >> /dev/null 2>&1
```

## 6. Before going live
- `.env`: `APP_ENV=production`, `APP_DEBUG=false`
- In the admin panel: payment gateways, mail (SMTP), SMS, Google Maps key, Firebase (your own project)
- Mobile apps: set `baseUrl` in `app_constants.dart` to `https://your-domain.com`, change the `applicationId`,
  and replace `google-services.json` with your own Firebase file
- Backups: daily `mysqldump` + copy of `storage/app/public`
