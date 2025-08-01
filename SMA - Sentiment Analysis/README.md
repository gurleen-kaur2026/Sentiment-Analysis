# YouTube Comment Scraper

A modern web application to extract and analyze comments from YouTube videos. Built with Flask backend and a beautiful, responsive frontend.

## 🚀 Features

- **Modern UI**: Clean, responsive design with smooth animations
- **Real-time Comments**: Fetch comments from any YouTube video
- **Advanced Sentiment Analysis**: AI-powered sentiment analysis using TextBlob and VADER
- **Interactive Dashboard**: Beautiful charts and metrics for sentiment insights
- **Sentiment Filtering**: Filter comments by positive, negative, or neutral sentiment
- **Word Cloud**: Visual representation of most common words
- **Smart Insights**: AI-generated insights about comment sentiment patterns
- **Export Functionality**: Download comprehensive sentiment analysis as CSV
- **Sorting Options**: Sort by relevance or time
- **Configurable Limits**: Choose how many comments to fetch (10-100)
- **Error Handling**: Comprehensive error messages and validation
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Setup Instructions

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Open your browser** and go to:
   ```
   http://localhost:5000
   ```

## 📱 How to Use

1. **Enter a YouTube URL**: Paste any YouTube video URL in the input field
2. **Configure Options**: 
   - Choose how many comments to fetch (10-100)
   - Select sorting method (relevance or time)
3. **Fetch Comments**: Click the "Fetch Comments" button
4. **View Sentiment Analysis**: 
   - Interactive dashboard with sentiment distribution
   - Sentiment metrics and insights
   - Word cloud of most common words
   - AI-generated insights about comment patterns
5. **Filter Comments**: Use the filter buttons to view positive, negative, or neutral comments
6. **Export Analysis**: Click "Export Analysis to CSV" to download comprehensive sentiment data

## 🔧 API Endpoints

### GET `/`
- Serves the main application page

### POST `/api/comments`
- Fetches comments from YouTube videos
- **Request Body**:
  ```json
  {
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
    "maxComments": 50,
    "sortBy": "relevance"
  }
  ```
- **Response**:
  ```json
  {
    "comments": [
      {
        "author": "User Name",
        "text": "Comment text",
        "publishedAt": "2023-01-01T00:00:00Z",
        "likeCount": 5
      }
    ],
    "totalCount": 50,
    "videoId": "VIDEO_ID"
  }
  ```

### GET `/api/health`
- Health check endpoint
- Returns application status

## 🎨 Frontend Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Beautiful loading animations
- **Error Handling**: Clear error messages
- **Keyboard Shortcuts**: Ctrl+Enter to fetch comments
- **Export Functionality**: Download comments as CSV
- **Modern Styling**: Gradient backgrounds and smooth transitions

## 🔒 Security Notes

- The YouTube API key is stored server-side for security
- Input validation prevents malicious URLs
- CORS is enabled for local development
- HTML escaping prevents XSS attacks

## 📊 Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch comments"**
   - Check your internet connection
   - Verify the YouTube URL is valid
   - Ensure the video has comments enabled

2. **"Could not extract video ID"**
   - Make sure you're using a valid YouTube URL
   - Try copying the URL directly from YouTube

3. **API Key Issues**
   - The API key is included in the code
   - For production, move it to environment variables

### Getting a YouTube API Key

If you need your own API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Replace the API key in `app.py`

## 📁 Project Structure

```
YouTubeCommentScraper/
├── app.py              # Flask backend server
├── index.html          # Main HTML page
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── .venv/scratch.py   # Original Python script
```

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
For production deployment, consider:
- Using environment variables for API keys
- Setting up a proper WSGI server (Gunicorn)
- Adding HTTPS
- Implementing rate limiting
- Using a reverse proxy (Nginx)

## 📝 License

This project is for educational purposes. Please respect YouTube's Terms of Service and API usage limits.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## ⚠️ Disclaimer

This tool is for educational and research purposes. Please respect YouTube's Terms of Service and API usage limits. The developers are not responsible for any misuse of this application. 