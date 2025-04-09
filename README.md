#  ChatConnect - Real-time Chat Application

A real-time chat application built with React, TypeScript, and Socket.io, providing seamless real-time communication between users.

## Features

- Real-time messaging with Socket.io
- Public lobby for all users
- Private rooms with custom URLs
- Responsive design for desktop and mobile
- User presence indicators
- Message history for rooms
- Customizable user names

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Production Deployment

For production deployment:

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

The application will be available at the configured port (default: 3000).

## How It Works

- The server maintains rooms and user connections using Socket.io
- When users join a room, they receive the room's message history
- Messages are broadcast in real-time to all users in the same room
- User counts and user lists are updated as people join and leave

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
 