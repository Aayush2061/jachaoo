# Jachao — AI-Powered HealthTech Application

Jachao is a full-stack, AI-powered healthcare application built with **React Native**, **Node.js**, **Flask**, and **MongoDB**. It combines conversational AI health support (via the Gemini API) with core healthcare features like symptom diagnosis, medical report management, and menstrual cycle tracking. The app was published on the Google Play Store and reached 1,000+ downloads.

> ⚠️ **Note:** The backend is currently offline, so live app functionality is temporarily unavailable. The codebase and architecture remain fully intact — see below for an overview of what was built.

## Features

- 🩺 **Symptom Diagnosis** — AI-assisted preliminary symptom analysis
- 📄 **Medical Report Management** — Upload, store, and interpret medical reports using AI
- 🌸 **Menstrual Cycle Tracking** — Log and track cycle data with personalized insights
- 🤖 **AI Health Assistant** — Conversational support powered by the Gemini API
- 🔐 **Secure Authentication** — JWT-based user authentication
- 🌐 **SEO-Optimized Landing Page** — Built with Next.js

## Tech Stack

| Layer            | Technology                                  |
|-------------------|----------------------------------------------|
| Mobile Frontend    | React Native (Expo)                          |
| Backend            | Node.js, Express.js                          |
| AI/ML Services     | Flask, Gemini API                            |
| Database           | MongoDB, Mongoose                            |
| Authentication      | JWT                                          |
| Deployment          | Google Cloud Platform                        |
| Landing Page        | Next.js                                      |

## Project Structure

```
jachaoo/
├── jachaoo-backend/     # Node.js/Express REST API + Flask AI services
├── jachaoo-frontend/    # React Native (Expo) mobile app
└── .expo/               # Expo configuration
```

## API Overview

The backend exposes RESTful APIs for:

- **Authentication** — signup, login, token refresh
- **Symptom Diagnosis** — submit symptoms, receive AI-assisted analysis
- **Medical Reports** — upload and interpret medical documents
- **Menstrual Cycle Tracking** — log and retrieve cycle data
- **AI Assistant** — conversational health support endpoints

## Deployment

- Backend services are deployed on **Google Cloud Platform**.
- The mobile app is published on the **Google Play Store**.
- The landing page is built with **Next.js** for SEO optimization.

## Author

**Aayush Bhandari**
Final-year Computer Engineering student, Institute of Engineering, Tribhuvan University
