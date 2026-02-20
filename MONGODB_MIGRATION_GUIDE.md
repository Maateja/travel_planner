# MongoDB & Node.js Migration Guide

I have successfully replaced the **Django/SQLite** backend with a high-performance **Node.js/TypeScript/MongoDB** backend. This should resolve all authentication and database-related instabilities you were facing.

## 1. Key Features of Your New Stack

- **Node.js (Express)**: Fast, modern, and perfectly suited for your React frontend.
- **TypeScript**: Ensures code reliability and prevents bugs during development.
- **MongoDB (NoSQL)**: High flexibility for travel itineraries and user profiles.
- **JWT Authentication**: Robust token-based auth that works seamlessly across sessions.
- **ESM Modules**: Using the latest Node.js "type: module" for modern standard development.

## 2. Setting Up Your Database (Action Required)

Since I cannot create a MongoDB database for you, you need to provide a connection string:

1.  **Register/Login** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2.  **Create a Free Cluster** (Shared Tier).
3.  Click **"Connect"** -> **"Drivers"** -> **"Node.js"**.
4.  Copy the connection string (it looks like `mongodb+srv://admin:<password>@cluster0.abc.mongodb.net/?retryWrites=true&w=majority`).
5.  Open your `server/.env` file and replace the `MONGODB_URI` value with your string.
6.  _Note: Make sure to replace `<password>` with your actual database user password._

## 3. How to Start the New App

I have updated the **`start_app.bat`** file for you. Now, just double-click it in your project root!

It will:

1.  Launch the **Node.js Server** on port **5000**.
2.  Launch the **Vite Frontend** on port **5173**.
3.  Vite is automatically configured to proxy `/api` requests to the new server.

## 4. File Structure

- `server/src/index.ts`: Main entry point.
- `server/src/models/`: MongoDB schemas (User, Trip, Itinerary).
- `server/src/routes/`: API endpoint definitions.
- `server/src/controllers/`: Business logic (Auth, AI generation, etc.).

Your project is now much cleaner, faster, and follows industry standards for modern web applications!
