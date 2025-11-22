# 🌍 Local Vibe — Event Discovery App

Local Vibe is a web application built during a hackathon that helps people discover events happening around them.  
Users can explore an interactive map, get personalized event recommendations through an AI chatbot and even publish their own events directly in the app.

🔗 **Live Demo:** https://localvibe-81585.web.app/

---

##  Features

###  Event Discovery
- Browse events on an interactive **Google Maps** interface  
- View details like location, date, category, and description

###  AI Chatbot (Gemini)
- Personalized event recommendations based on:
  - Mood
  - Preferences
  - Location

###  User-Generated Events
- Users can create and publish their own events  
- Events are saved in Firebase and instantly appear on the map

###  Authentication
- Firebase Authentication with email/password  
- Logged-in users can publish, update, or manage their events

###  Deployment
- Fully deployed using **Firebase Hosting**

---

##  Tech Stack

### **Frontend**
- React + Vite
- TypeScript
- Google Maps API

### **Backend**
- TypeScript
- Firebase Cloud Firestore (database)
- Firebase Authentication
- Gemini API (Google AI Studio) for recommendations

### **Deployment**
- Firebase Hosting
- Firebase CLI

## 🧩 Run Locally

To run the project locally, follow these quick steps:

1. **Install dependencies**

    ```bash
    npm install

2. **Create a .env.local file and add your API keys:**

    ```bash
    VITE_GEMINI_API_KEY=your_gemini_key
    VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

3. **Start the development server**

    ```bash
    npm run dev

Once started, the app will be available at the local development URL displayed in the terminal.

##  Contributors
- **Eriko Nitu**
- **Stanescu Octavian**
- **Petriia Raluca**


#### Built during **OpenHack 2025**