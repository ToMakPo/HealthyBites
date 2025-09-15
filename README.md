# HealthyBites <img src="public\favicon.png" alt="HealthyBites Logo" width="24px" height="24px" />


[![React](https://img.shields.io/badge/React-17.0-blue?logo=react)](https://reactjs.org/) 
[![Vite](https://img.shields.io/badge/Vite-4.0-purple?logo=vite)](https://vitejs.dev/) 
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/) 
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/) 
[![Express](https://img.shields.io/badge/Express-4.18-black?logo=express)](https://expressjs.com/) 
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb)](https://www.mongodb.com/) 
[![Git](https://img.shields.io/badge/Git-2.43-orange?logo=git)](https://git-scm.com/)


HealthyBites is a web app that helps pet owners find healthy and affordable food for their pets. Users can input their pet’s details, see ranked lists of pet foods by quality and cost, and make smarter feeding decisions.

<img src="src/assets/hbLogo.png" alt="HealthyBites Logo" width="300px" />

## Features

- Add and manage pet food products (admin panel)
- Evaluate food based on ingredient quality and cost per day
- Calculate daily feeding costs based on pet weight and species
- Display ranked list of foods with detailed ingredient info and purchase links
- Built with modern technologies: React, Vite, TypeScript, SASS, Node.js, Express, and MongoDB


## Tech Stack

- **Frontend:** React, Vite, TypeScript, SASS (.sass syntax)
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB
- **Version Control:** Git

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance running locally or remotely
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/healthybites.git
cd healthybites
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Configure environment variables (create a `.env` file in `backend`):
```ini
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### Running the App

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend dev server:
```bash
cd frontend
npm run dev
```

Open your browser at http://localhost:5173 (or the port Vite specifies) to see the app.

### Project Structure
```bash
healthybites/
├─ backend/      # Express server, models, routes
├─ frontend/     # React app, pages, components, styles
├─ .gitignore
├─ README.md
```

### Contributing

This is a personal project, but feel free to fork or suggest improvements via GitHub issues or pull requests.

### License

MIT License