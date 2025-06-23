# Setup Database

psql -U postgres
CREATE DATABASE constella_wallet;
CREATE USER constella_user WITH PASSWORD 'constella_password' CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE constella_wallet TO constella_user;

DATABASE_URL="postgresql://constella_user:constella_password@localhost:5432/constella_wallet"