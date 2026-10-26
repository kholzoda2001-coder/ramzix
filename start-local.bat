@echo off
rem Starts MariaDB and the PHP dev server for the local 6valley install.
start "MariaDB" /min C:\mariadb\mariadb-11.4.5-winx64\bin\mariadbd.exe --defaults-file=C:\mariadb\data\my.ini --console
timeout /t 6 /nobreak >nul
cd /d C:\ramzshop-web
start "PHP server" /min C:\php\php.exe -S 0.0.0.0:8000 -t C:\ramzshop-web\public C:\ramzshop-web\server.php
echo Open http://localhost:8000 in your browser.
