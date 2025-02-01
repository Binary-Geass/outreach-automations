# SaaS Application

A full-stack SaaS application built with React, Node.js, MongoDB, and Kinde Authentication.

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Kinde Auth React SDK

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Kinde Auth Express SDK
- JWT for API authentication

### Infrastructure
- AWS Amplify (Frontend hosting)
- AWS Lambda (Backend serverless)
- MongoDB Atlas (Database)

## Project Structure
```
project-root/
├── backend/         # Node.js Express backend
├── frontend/        # React frontend
```

## Getting Started

### Prerequisites
- Node.js >= 14.x
- MongoDB
- Kinde Account
- AWS Account

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

4. Set up environment variables
- Create `.env` files in both backend and frontend directories
- Add necessary environment variables (see .env.example files)

5. Start Development Servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Deployment

### Frontend (AWS Amplify)
1. Connect your repository to AWS Amplify
2. Configure build settings
3. Deploy

### Backend (AWS Lambda)
1. Package the backend code
2. Create Lambda function
3. Set up API Gateway
4. Deploy

## License
MIT 