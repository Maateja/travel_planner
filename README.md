BagsUp – AI Budget Travel Planner for Students
BagsUp is an AI-powered travel planning platform designed specifically for students. It helps users generate personalized, budget-friendly travel itineraries with smart cost distribution, interactive roadmap visualization, and real-time budget tracking.
The platform combines artificial intelligence with modern web technologies to simplify trip planning while ensuring financial awareness.
🚀 Features
🤖 AI-Based Travel Planning
Generates day-wise itineraries based on destination, budget, and preferences.
💰 Smart Budget Planner
Distributes total budget across stay, food, transport, and activities.
🗺 Interactive Roadmap View
Visual journey display with day-wise checkpoints.
🎯 Spin The Wheel
Randomly suggests destinations within a selected state.
📌 Saved Places
Save hotels, restaurants, and attractions with budget impact tracking.
🔐 Secure Authentication
Login, signup, JWT authentication, and email-based password reset.
💬 Restricted AI Chatbot
Responds only to travel-related queries within the platform.
📱 Responsive UI
Modern, animated, student-friendly interface.
🛠 Tech Stack
Frontend
React.js (Vite)
CSS / Tailwind (if used)
Framer Motion (for animations – if used)
Backend
Node.js
Express.js
Database
MongoDB (MongoDB Atlas)
AI Integration
Google Gemini API
Email Service
Nodemailer (SMTP – Gmail App Password)
Authentication
JWT (JSON Web Tokens)
Bcrypt (Password hashing)
📂 Project Structure
bagsup/
│
├── client/        # React frontend
├── server/        # Node + Express backend
├── models/        # MongoDB schemas
├── routes/        # API routes
├── controllers/   # Business logic
└── README.md
🔑 Environment Variables
Create a .env file inside the server folder:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_project_email@gmail.com
EMAIL_PASS=your_gmail_app_password
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
⚠️ Never upload your .env file to GitHub.
⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/yourusername/bagsup.git
cd bagsup
2️⃣ Install dependencies
Frontend:
cd client
npm install
npm run dev
Backend:
cd server
npm install
npm run dev
3️⃣ Configure Environment Variables
Add required keys in .env.
🔄 Application Flow
User signs up / logs in.
Enters trip details (destination, dates, budget).
AI generates day-wise itinerary.
Budget is calculated and distributed.
User can save places or regenerate plan.
Interactive roadmap displays journey.
Trips are stored in MongoDB.
🔐 Security Measures
Passwords hashed using bcrypt.
JWT-based authentication.
Reset password using secure token with expiry.
Sensitive keys stored in environment variables.
📈 Future Enhancements
Live hotel & transport price integration.
Group trip planning.
Expense tracking during travel.
Mobile application version.
Public itinerary sharing.
Advanced AI personalization.
🎯 Objective
To provide a smart, AI-driven, student-friendly travel planning platform that ensures affordable, structured, and stress-free trip management.
👨‍💻 Developed By
B MAA TEJA NAIK
