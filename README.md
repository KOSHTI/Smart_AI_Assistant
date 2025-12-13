# Smart AI Assistant

This project is a dynamic and responsive chat application built with React, designed to interact with an AI model via the Google Gemini API. It provides a modern, single-page interface for conversational AI, with features focused on enhancing readability and user experience.

## Features

- **AI Conversation**: Engage in real-time, intelligent conversations powered by the Gemini model.
- **Chat History Persistence**: Maintains the complete conversation history during the session for context.
- **Message Editing**: Allows users to edit their previous questions, triggering a new, contextual response from the AI.
- **Content Formatting**: AI responses are processed to handle Markdown, supporting features like headers, lists, and basic text styling.
- **Code Display**: Code blocks within AI responses are clearly formatted.
- **Dark Mode**: A user-toggleable theme switch is available for preference, ensuring comfortable viewing in different light conditions.
- **Clipboard Functionality**: A button allows users to easily copy the AI's generated response text.
- **Responsive Design**: Optimized layout for seamless use across various screen sizes (mobile, tablet, desktop).
- **Scroll Management**: Includes auto-scrolling to the latest message and a manual "Scroll to Bottom" button for navigating long chats.

## Technologies Used

This application is built using a modern React stack with a focus on client-side logic and custom styling.

- **Frontend Framework**: React (with JSX)
- **Styling**: Custom CSS for a unique look and feel, including theme management.
- **API Client**: Axios for making asynchronous HTTP requests to the Gemini API.
- **Build Tool**: Vite for fast development and bundling.
- **API**: Google Gemini API for all natural language processing and generation tasks.

## Project Structure

The core logic is self-contained within the `src/App.jsx` component, which handles state management, API calls, rendering, and UI interactions.

- `src/App.jsx`: Main application component, including all chat UI and business logic.
- `src/index.css`: Global styles, responsible for the chat layout and the dark mode theme.
- `src/config.js`: Stores the Google Gemini API key.
- `src/main.jsx`: The React application entry point.

## Setup and Installation

To run this project locally, you will need Node.js and a Google Gemini API Key.

### Prerequisites

- **Node.js** (LTS version recommended)
- **Google Gemini API Key**

### Installation Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/KOSHTI/Smart_AI_Assistant.git
   cd smart-ai-assistant

2. **Install dependencies:**:

   ```bash
   npm install

3. **Configure the API Key:**:

- Open the `src/config.js`file.
- Replace the placeholder value with your actual API key:

   ```bash
   // src/config.js
    const API_KEY = "YOUR_ACTUAL_API_KEY_HERE";
    export default API_KEY;

2. **Start the development server:**:

   ```bash
   npm run dev
- The application will start in your browser, typically at `http://localhost:5173`.
---

## License  

This project is licensed under the **MIT License**.  


## Contact  

For any questions or collaborations:  
📧 Email: koshtishubham04@gmail.com  
