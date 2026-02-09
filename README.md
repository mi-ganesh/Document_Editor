# Real-Time Collaborative Document Editor

A full-stack real-time collaborative document editor that allows multiple users to edit the same document simultaneously using WebSockets.

## 🚀 Features

- Real-time document collaboration
- Multiple users per room
- Unique Room ID system
- Live synchronization using Socket.IO
- Persistent document storage with MongoDB
- Download document as a text file
- Responsive and clean UI
- Secure environment configuration using `.env`

---

## 🛠️ Tech Stack

### Frontend
- React.js
- CodeMirror
- Socket.IO Client
- Bootstrap
- Axios

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB (Mongoose)
- dotenv

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/Document_Editor.git
cd Document_Editor

### 2️⃣ Backend setup
cd backend
npm install

Create a .env file:
PORT=5000
MONGO_URI=your_mongodb_connection_string

npm run dev

### 3️⃣ Frontend setup
cd frontend
npm install

Create a .env file:
REACT_APP_BACKEND_URL=http://localhost:5000


npm start

```
---

<p align="center">
  <img src="https://github.com/mi-ganesh/Document_Editor/blob/293004ffb510215c18cf9f98c89aae0e8f4540ad/Document_SS/Screenshot%202026-02-09%20094202.png" width="800"/>
  <br/>
  <em>Real-time collaborative document editor interface Login</em>
</p>

---

<p align="center">
  <img src="https://github.com/mi-ganesh/Document_Editor/blob/7f1fe26e2726b032cde4e402a59bea6530730d23/Document_SS/Screenshot%202026-02-09%20094238.png" width="800"/>
  <br/>
  <em>Real-time collaborative document editor interface</em>
</p>

---









