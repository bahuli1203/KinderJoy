

# 🎉 KinderJoy – Emotion-Aware AI App for Kids

KinderJoy is an interactive web application designed for children aged **6–14** that detects emotions and responds with **positive, supportive messages and fun activities**.
It combines a **Flask backend** with a simple **HTML/CSS/JavaScript frontend** to create an engaging and child-friendly experience.

---

## 🚀 Features

* 😊 Emotion-based responses (Happy, Sad, Angry, etc.)
* 💬 AI-powered or fallback supportive messages
* 🎯 Fun activity suggestions for kids
* 🌐 Simple and responsive frontend
* 🔗 Flask API backend with CORS support

---

## 🛠️ Tech Stack

**Frontend:**

* HTML
* CSS
* JavaScript

**Backend:**

* Python
* Flask
* Flask-CORS

**Optional AI Integration:**

* Google Generative AI (if API key is provided)

---

## 📁 Project Structure

```
KinderJoy/
│── app.py              # Flask backend server
│── index.html          # Main frontend UI
│── style.css           # Styling file
│── script.js           # Frontend logic
│── requirements.txt    # Python dependencies
```

---

## ⚙️ Installation & Setup

### 1. Clone or Extract the Project

```bash
cd KinderJoy
```

---

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 3. (Optional) Set AI API Key

If using Google Generative AI:

```bash
export GOOGLE_API_KEY=your_api_key_here
```

*(Skip this step to use fallback responses)*

---

### 4. Run the Backend Server

```bash
python app.py
```

Server will start at:

```
http://127.0.0.1:5000
```

---

### 5. Open the Frontend

Simply open `index.html` in your browser.

---

## 🔌 API Endpoint

### POST `/analyze`

**Request:**

```json
{
  "emotion": "happy"
}
```

**Response:**

```json
{
  "emotion": "Happy",
  "message": "You are absolutely glowing today!",
  "activity": "Let us do a dance challenge!"
}
```

---

## 🎯 How It Works

1. User selects or inputs an emotion
2. Frontend sends request to Flask backend
3. Backend:

   * Uses AI (if API key available) OR
   * Uses predefined fallback responses
4. Returns:

   * Emotion label
   * Motivational message
   * Fun activity

---

## 💡 Future Improvements

* 🎤 Voice emotion detection
* 📷 Facial emotion recognition
* 🎮 Mini games integration
* 📊 Emotion tracking dashboard

---

## 🤝 Contributing

Feel free to fork this project and improve it!

Steps:

1. Fork the repo
2. Create a new branch
3. Make changes
4. Submit a pull request

---

## 📜 License

This project is open-source and free to use for educational purposes.

---

## ❤️ Purpose

KinderJoy aims to promote **mental well-being, positivity, and emotional awareness** among children through technology.

---


