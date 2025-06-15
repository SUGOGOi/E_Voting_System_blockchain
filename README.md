# Blockchain Based Voting System

A secure, transparent, and decentralized voting system built with modern web technologies and blockchain infrastructure. This system combines MERN stack for the web application, Flask for biometric authentication, and Solana blockchain for secure, low-cost transactions with voter privacy protection.

## 🚀 Features

- **Secure Blockchain Voting**: Utilizes Solana blockchain for immutable and transparent vote recording
- **Biometric Authentication**: Face recognition system for voter verification
- **Privacy Protection**: Voter identity protection through cryptographic hashing
- **Real-time Updates**: WebSocket integration for live voting time broadcasts
- **Low Transaction Fees**: Solana blockchain ensures minimal transaction costs
- **Decentralized Architecture**: Eliminates single points of failure
- **User-friendly Interface**: Modern React-based frontend for easy interaction

## 🛠️ Technology Stack

### Frontend & Backend
- **Frontend**: React.js, HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: WebSocket

### Blockchain & Smart Contracts
- **Blockchain**: Solana
- **Smart Contract Language**: Rust
- **Development Environment**: Solana Playground
- **Transaction Explorer**: Solana Explorer

### Biometric Authentication
- **Framework**: Flask (Python)
- **Face Recognition**: Computer Vision libraries
- **Environment**: Python virtual environment

## 📁 Project Structure
### E_Voting_System_blockchain
- **client**: React frontend application
- **server**: Node.js backend server
- **face_server**: Flask face recognition server
- **README.md**


## 🔧 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB
- Solana CLI
- Git

### 1. Clone the Repository
- git clone https://github.com/yourusername/E_Voting_System_blockchain.git
- cd E_Voting_System_blockchain

  
### 2. Frontend Setup
- cd client
- npm install
- npm run dev
- The frontend will be available at `http://localhost:5173/`

### 3. Backend Setup
- cd server
- npm install
- npm run dev
- setup .env from .env.example
- The backend server will run on `http://localhost:4000`

### 4. Face Recognition Server Setup(Windows)
- cd face_server
- setup .env from .env.example
- .venv\Scripts\activate
- pip install -r requirements.txt
- flask run
- The face recognition server will run on`http://127.0.0.1:5000`



