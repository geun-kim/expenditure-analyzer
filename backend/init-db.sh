#!/bin/bash
set -e

# Check if the database exists, create it if not
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'expenditure_analyzer'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE expenditure_analyzer"
