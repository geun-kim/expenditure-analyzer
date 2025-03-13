# Expenditure Analyzer 

## Overview

[Expenditure Analyzer](https://expenditure-analyzer-6teq.onrender.com/dashboard) is a web application designed to help users track and categorize their financial transactions. Users can upload CSV files containing transaction data, and the system will automatically categorize expenses based on predefined category keywords. The app provides a simple and intuitive interface to visualize spending habits.

## Features

- Upload CSV files with transaction data.

- Automatically categorize transactions.

- View and manage categorized spending.

- Personalized managment using UserID

- Persistent data storage using PostgreSQL.

## Tech Stack

### Frontend:

- Angular

- Angular Material

### Backend:

- NestJS (Node.js Framework)

- TypeORM (ORM for PostgreSQL)

- PostgreSQL (Database)

## Deployment:

Hosted on Render (Free Tier)

Continuous Deployment via GitHub

## Installation & Setup

1. Clone the Repository

```
  git clone https://github.com/geun-kim/expenditure-analyzer.git
  cd expenditure-analyzer
```

2. Install Dependencies

```
  npm install
```

3. Run Database

```
  cd Backend
  docker-compose up -d
  cd ..
```

4. Run the Application Locally

```
  npm run build 
  npm run start
```

The server will start on http://localhost:3000.

## CSV File Format

The imported file must be in CSV format with the following columns:

| Account Type | Account Number   | Transaction Date | Cheque Number | Description 1                      | Description 2 | CAD$  | USD$  |
|-------------|-----------------|----------------|--------------|--------------------------------|-------------|------|------|
| Visa        | {AccountNumber} | 1/1/2025       |              | SAFEWAY |             | -17.54 |      |


Ensure the file follows this format for proper parsing.

## License

This project is licensed under the MIT License.