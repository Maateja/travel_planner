# 🎒 BagsUp – AI Budget Travel Planner for Students

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)

**BagsUp** is an AI-powered travel planning platform designed specifically for students. It helps users generate personalized, budget-friendly travel itineraries with smart cost distribution, interactive roadmap visualization, and real-time budget tracking. 

The platform combines the power of artificial intelligence (Google Gemini) with modern web technologies to simplify trip planning while ensuring financial awareness.

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Application Flow](#-application-flow)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Security Measures](#-security-measures)
- [Future Enhancements](#-future-enhancements)

---

## 🚀 Features

* **🤖 AI-Based Travel Planning:** Generates comprehensive, day-wise itineraries based on destination, budget constraints, and user preferences.
* **💰 Smart Budget Planner:** Automatically distributes the total budget across stay, food, transport, and activities to prevent overspending.
* **🗺️ Interactive Roadmap View:** Visualizes the journey with day-wise checkpoints and interactive map elements.
* **🎯 Spin The Wheel:** A fun, gamified feature that randomly suggests exciting destinations within a selected state.
* **📌 Saved Places:** Bookmark hotels, restaurants, and local attractions while keeping track of the budget.
* **💬 Restricted AI Chatbot:** A dedicated travel assistant that strictly responds only to travel-related queries to maintain platform focus.
* **🔐 Secure Authentication:** Robust login/signup flow featuring JWT authentication and email-based password resets.
* **📱 Responsive UI:** Clean, animated (via Framer Motion), and student-friendly interface optimized for all devices.

---

## 🛠 Tech Stack

### Frontend
* **Framework:** React.js (Vite)
* **Styling:** CSS / TailwindCSS
* **Animations:** Framer Motion

### Backend
* **Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas

### Third-Party Services
* **AI Engine:** Google Gemini API
* **Mailing Service:** Nodemailer (SMTP – Gmail App Password)
* **Security:** JSON Web Tokens (JWT), Bcrypt

---

## 🔄 Application Flow

1.  **Authentication:** User securely signs up or logs into their account.
2.  **Input Data:** User enters desired trip details (destination, travel dates, overall budget).
3.  **AI Generation:** The Gemini API processes the data and generates a customized, day-wise itinerary.
4.  **Budgeting:** The system calculates and distributes the budget realistically across various categories.
5.  **Customization:** User reviews the plan, saves preferred places, or regenerates the itinerary if needed.
6.  **Visualization:** The trip is rendered onto an interactive roadmap.
7.  **Storage:** All planned trips and saved places are securely stored in the MongoDB database for future access.

---

## 📂 Project Structure

```text
bagsup/
├── client/        # React frontend application
├── server/        # Node.js + Express backend logic
│   ├── models/    # MongoDB Mongoose schemas
│   ├── routes/    # API endpoint definitions
│   ├── controllers/# Business logic and API handlers
│   └── ...
└── README.md      # Project documentation
```
⚙️ Getting Started
Follow these steps to set up the project locally on your machine.

1️⃣ Clone the repository
Bash
git clone [https://github.com/yourusername/bagsup.git](https://github.com/yourusername/bagsup.git)
cd bagsup
2️⃣ Backend Setup
Navigate to the server directory, install dependencies, and start the development server.

Bash
cd server
npm install
npm run dev
3️⃣ Frontend Setup
Open a new terminal, navigate to the client directory, install dependencies, and start the React app.

Bash
cd client
npm install
npm run dev
🔑 Environment Variables
To run this project, you will need to add the following environment variables. Create a .env file inside the server folder and add the following:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_project_email@gmail.com
EMAIL_PASS=your_gmail_app_password
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
⚠️ Security Warning: Never commit your .env file to GitHub. Ensure it is included in your .gitignore file.

🔐 Security Measures
Password Hashing: User passwords are encrypted using bcrypt before database storage.

Stateless Auth: Secure session management using JWT.

Secure Password Reset: Token-based password recovery with strict expiration times.

Env Protection: Sensitive API keys and database URIs are isolated in environment variables.

📈 Future Enhancements
[ ] Live hotel and transport price integration (via third-party travel APIs).

[ ] Collaborative group trip planning.

[ ] On-the-go expense tracking during travel.

[ ] Cross-platform mobile application version (React Native).

[ ] Public itinerary sharing and community features.

[ ] Advanced AI personalization based on past travel history.

👨‍💻 Developed By
B MAA TEJA NAIK 
https://www.linkedin.com/in/tejanaikb/
