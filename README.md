# E-Commerce Full Stack Application

A full-stack e-commerce application built with Next.js, React, Shadcn UI for the frontend and Django, Django REST Framework, and PostgreSQL for the backend.

## Project Structure

The project is divided into two main parts:

- **Frontend**: Next.js application with React and Shadcn UI
- **Backend**: Django REST API with PostgreSQL database

## Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- PostgreSQL

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/macOS
   ```

3. Install required packages:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a PostgreSQL database:

   ```bash
   createdb ecommerce_db
   ```

5. Run migrations:

   ```bash
   python manage.py migrate
   ```

6. Create a superuser:

   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- User authentication and authorization
- Product catalog with categories
- Shopping cart
- Checkout process
- Order management
- Admin panel

## Deployment

For deployment instructions, refer to the documentation of Next.js and Django.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# ecommerce
