@echo off
cd /d C:\Users\dell\Documents\marketplace\backend
node src/seeders/seed-mass.js > C:\Users\dell\Documents\marketplace\backend\src\seeders\seed-output.txt 2>&1
echo EXIT CODE: %errorlevel%
