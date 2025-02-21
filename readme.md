# WikaTalk

WikaTalk is a local speech interpreter app designed for the Philippines. It helps users translate and understand local languages efficiently.

## Tech Stack

- **Frontend:** React Native
- **Backend:** Express.js
- **Database:** MongoDB
- **Server:** Node.js

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Adrian9502/wikatalk-thesis-speech-interpreter
   ```

### Frontend Setup

2. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the Expo development server:
   ```sh
   npx expo start
   ```

### Backend Setup

2. Navigate to the backend directory:
   ```sh
   cd backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the backend server:
   ```sh
   node server.js
   ```

## Environment Variables

### Frontend `.env`

```env
EXPO_PUBLIC_TRANSLATE_API_KEY=your_api_key
EXPO_PUBLIC_BACKEND_URL=http://your_ipv4_address:5000
```

> **Note:** Replace `your_ipv4_address` with your actual IPv4 address. You can find it by running `ipconfig` in the command prompt. Ensure your PC and mobile are connected to the same Wi-Fi.

Example setup:

```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.69.69:5000
```

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodbconnectionstring
JWT_SECRET=your_jwt_secret
```

## Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.
