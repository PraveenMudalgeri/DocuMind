# DocuMind AI - Document Intelligence Platform

A modern AI-powered document analysis and chat platform built with React, FastAPI, and advanced RAG (Retrieval-Augmented Generation) technology.

## Features

- 🤖 **AI-Powered Chat**: Intelligent conversations with your documents
- 📄 **Multi-Format Support**: PDF, DOCX, Markdown, HTML, and TXT files
- 🔍 **Smart Search**: Advanced vector-based document retrieval
- 🗣️ **Text-to-Speech**: Convert responses to natural speech
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔐 **Secure Authentication**: User accounts and session management
- 💾 **Database Integration**: Direct database querying capabilities

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd documind
   ```

2. **Set up the backend**
   ```bash
   cd api
   pip install -r requirements.txt
   cp .env.example .env
   # Update .env with your API keys
   uvicorn main:app --reload
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Update .env with your API URL
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://0.0.0.0:8000

### Vercel Deployment

1. **Prepare for deployment**
   ```bash
   ./deploy.sh
   ```

2. **Deploy to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Configure environment variables** in Vercel dashboard

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Environment Variables

### Backend (.env)
```bash
MONGODB_URL=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
SARVAM_API_KEY=your_sarvam_api_key
SECRET_KEY=your_secret_key
```

### Frontend (.env)
```bash
VITE_API_URL=http://0.0.0.0:8000
```

## Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - Document database
- **Pinecone** - Vector database
- **Google Gemini** - AI language model
- **FastEmbed** - Text embeddings
- **Sarvam AI** - Text-to-speech

## Project Structure

```
documind/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── dist/               # Build output
├── api/                     # FastAPI backend
│   ├── controller/         # Request handlers
│   ├── service/            # Business logic
│   ├── routes/             # API routes
│   ├── schema/             # Data models
│   └── lib/                # Utilities
├── documentation/          # Project documentation
└── vercel.json            # Deployment configuration
```

## Key Features

### Document Processing
- Intelligent chunking with parent-child relationships
- Vector embeddings for semantic search
- Multi-format document parsing
- Automatic indexing and retrieval

### Chat Interface
- Real-time messaging
- Context-aware responses
- Source citations
- Chat history management
- Simple, predictable chat naming

### User Experience
- Clean, modern interface
- Mobile-responsive design
- Dark/light mode support
- Intuitive navigation
- Fast, responsive interactions

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Documents
- `POST /documents/upload` - Upload document
- `GET /documents` - List user documents
- `DELETE /documents/{id}` - Delete document

### Chat
- `POST /chat/sessions` - Create chat session
- `GET /chat/sessions` - List chat sessions
- `POST /chat/query` - Send chat message
- `DELETE /chat/sessions/{id}` - Delete chat session

### Database
- `POST /database/connect` - Connect to database
- `POST /database/query` - Query database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Review the documentation in the `/documentation` folder
- Open an issue on GitHub

## Changelog

### Recent Updates
- ✅ Simplified chat naming for better performance
- ✅ Optimized for Vercel deployment
- ✅ Improved mobile experience
- ✅ Enhanced logo visibility
- ✅ Fixed document upload issues
- ✅ Async chunking optimization