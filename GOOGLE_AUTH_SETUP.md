# Google Authentication Setup Guide

To enable Google Login in your new MERN stack application, you need to configure an OAuth 2.0 Client ID. Follow these exact steps:

### **Step 1: Google Cloud Console**

1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Select your project (or create a new one called "Travel Planner").
3.  In the left sidebar, go to **APIs & Services** > **OAuth consent screen**.
4.  Choose **External** and click **Create**.
5.  Fill in the required fields:
    - **App name**: Travel Planner
    - **User support email**: Your email
    - **Developer contact info**: Your email
6.  Click **Save and Continue** until you finish the setup.

### **Step 2: Create Credentials**

1.  Go to **APIs & Services** > **Credentials**.
2.  Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3.  **Application type**: Web application.
4.  **Name**: Travel Planner Frontend.
5.  **Authorized JavaScript origins**:
    - Add `http://localhost:5173`
    - Add `http://127.0.0.1:5173`
6.  Click **Create**.

### **Step 3: Update the Code**

1.  Copy your **Client ID** from the popup (it looks like `123456-abcdefg.apps.googleusercontent.com`).
2.  **Frontend**: Open `frontend/src/main.jsx` and replace the current ID on line 9 with your new one.
3.  **Backend**: Open `server/.env` and replace the `GOOGLE_CLIENT_ID` on line 5 with your new ID.

### **Step 4: Restart the App**

1.  Close your terminal.
2.  Double-click `start_app.bat` to restart everything.

Your Google Login will now work without "Authorization" errors!
