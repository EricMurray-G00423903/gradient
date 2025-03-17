# Gradient

<p align="center">
  <img src="frontend/public/logo192.png" alt="Gradient Logo" width="100" height="100">
</p>

<p align="center">
  <strong>An AI-Powered Study Assistant & Portfolio Builder</strong>
</p>

<p align="center">
  <a href="https://nullnvoid.dev/">https://nullnvoid.dev/</a>
</p>

## 📚 Overview

Gradient is an AI-powered educational platform that helps students track their learning progress, plan their studies effectively, and build projects that showcase their skills. Whether you're learning to code, studying for exams, or just expanding your knowledge, Gradient helps you stay organized and focused on what matters most.

## ✨ Features

- **📊 Module Management**: Create and organize your study modules with ease
- **📝 AI-Generated Quizzes**: Test your knowledge with custom quizzes tailored to your proficiency level
- **📅 Study Planner**: Get personalized study plans based on your quiz performance and weak areas
- **🚀 Project Ideas**: Receive AI-generated project suggestions based on your modules and skill level
- **👤 User Profiles**: Track your progress and visualize your growth over time
- **🔄 Progressive Web App**: Install on your device for a better experience and offline access
- **🔐 Secure Authentication**: Log in with email or Google account

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Material UI
- **Backend**: Firebase Cloud Functions, Node.js
- **AI**: OpenAI GPT-4o API
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Deployment**: Firebase Hosting Function / Self Hosted Frontend

## 🏗️ Project Structure

- `/frontend`: React application codebase
  - `/src`: Source files
    - `/Components`: Reusable React components
    - `/Pages`: Main application pages
    - `/Context`: React context providers
    - `/Utils`: Utility functions and services
- `/backend`: Cloud Functions for Firebase
  - `/functions`: Server-side code and API endpoints

## 🚀 Getting Started

### Prerequisites

- Node.js (v22)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/gradient.git
   cd gradient
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```
   cd ../backend/functions
   npm install
   ```

4. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Set up Authentication, Firestore, and Functions
   - Add your Firebase config to `/frontend/src/firebase.ts`

5. Configure OpenAI API:
   - Create an account at [OpenAI](https://openai.com/)
   - Get your API key
   - Add your API key to the Firebase Functions environment variables

### Running the Application

1. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

2. Emulate Firebase services locally (optional):
   ```
   firebase emulators:start
   ```

## 📱 PWA Support

Gradient is a Progressive Web App, which means:

- It can be installed on your device's home screen
- It works offline or with a poor internet connection
- It loads quickly and reliably
