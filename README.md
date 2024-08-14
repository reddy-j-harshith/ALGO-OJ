# Algorithmix

## Overview

This is an Online Judge platform built using Django for the backend and React for the frontend. The platform allows users to solve coding problems, submit their solutions, and receive feedback on the correctness of their code. The backend is a REST API, and the frontend is a single-page application (SPA). 

The application is deployed and accessible online at [https://www.algorithmix.online](https://www.algorithmix.online).

## Features

- **User Authentication:** Managed by the Django REST Framework using the Simple JWT library.
- **Problem Management:** Add, update, and delete problems.
- **Solution Submission:** Users can submit code solutions to problems and get instant feedback.
- **Forum Section:** Users can discuss specific problems in a dedicated forum.
- **Test Case Management:** Test cases can be extracted and parsed from files, making it easier to set up new problems.

## Project Structure

- **Backend (Django)**
  - URL: `localhost:8000`
  - Framework: Django
  - Authentication: JWT (Simple JWT)
  - Dependencies: Listed in `requirements.txt`
  
- **Frontend (React)**
  - URL: `localhost:3000`
  - Framework: React
  - Configuration: Managed via a `Config` file where API endpoints and other settings can be configured.

## Prerequisites

- Python 3.x
- Node.js & npm
- Django & Django REST Framework
- React

## Setup Instructions

### Backend (Django)

1. **Clone the repository:**

    ```bash
    git clone https://your-repository-url.git
    cd your-repository
    ```

2. **Install the required dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3. **Run migrations:**

    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

4. **Create a superuser:**

    ```bash
    python manage.py createsuperuser
    ```

5. **Run the development server:**

    ```bash
    python manage.py runserver
    ```

    The backend will be running on `http://localhost:8000`.

### Frontend (React)

1. **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2. **Install the required dependencies:**

    ```bash
    npm install
    ```

3. **Update API configuration (optional):**

    In the `Config` file, you can adjust the API endpoints if needed. By default, the frontend is configured to send requests to `http://localhost:8000`.

4. **Run the development server:**

    ```bash
    npm start
    ```

    The frontend will be running on `http://localhost:3000`.

## Usage

1. **Access the Application:**

   Open your browser and navigate to `http://localhost:3000` for local development or visit [https://www.algorithmix.online](https://www.algorithmix.online) for the live version.

2. **Authentication:**

   Register or log in using the provided authentication system. Token-based authentication is used for securing the API endpoints.

3. **Problem Solving:**

   Browse the problems, submit your code, and get instant feedback.

4. **Forum:**

   Discuss problems with other users in the forum section, accessible via each problem page.

## Configuration

The frontend `Config` file allows you to configure the API endpoints and other settings. By default, the API requests are sent to `http://localhost:8000`, but you can change this to suit your deployment needs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
