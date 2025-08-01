from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import re
import os
from datetime import datetime
from sentiment_analyzer import SentimentAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# YouTube API Configuration
API_KEY = 'AIzaSyCH-t6WUrBLiQ3XiKqDXMbqPlhtrkjtWow'
API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

# Initialize sentiment analyzer
sentiment_analyzer = SentimentAnalyzer()

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'(?:v=|\/)([a-zA-Z0-9_-]{11})',
        r'youtu\.be\/([a-zA-Z0-9_-]{11})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def is_valid_youtube_url(url):
    """Validate YouTube URL"""
    youtube_patterns = [
        r'^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}',
        r'^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}',
        r'^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}',
        r'^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}\?.*$',  # Allow query parameters
        r'^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}.*$'  # Allow query parameters for youtube.com
    ]
    
    # Also check if we can extract a video ID
    video_id = extract_video_id(url)
    if video_id:
        return True
    
    return any(re.match(pattern, url) for pattern in youtube_patterns)

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files (CSS, JS)"""
    return send_from_directory('.', filename)

@app.route('/api/comments', methods=['POST'])
def get_comments():
    """API endpoint to fetch YouTube comments"""
    try:
        data = request.get_json()
        video_url = data.get('videoUrl', '').strip()
        max_comments = int(data.get('maxComments', 50))
        sort_by = data.get('sortBy', 'relevance')
        
        print(f"Received URL: {video_url}")  # Debug log
        
        # Validate input
        if not video_url:
            return jsonify({'error': 'Please provide a YouTube video URL'}), 400
        
        is_valid = is_valid_youtube_url(video_url)
        print(f"URL validation result: {is_valid}")  # Debug log
        
        if not is_valid:
            return jsonify({'error': 'Please provide a valid YouTube video URL'}), 400
        
        # Extract video ID
        video_id = extract_video_id(video_url)
        if not video_id:
            return jsonify({'error': 'Could not extract video ID from URL'}), 400
        
        # First, check if video exists and get its details
        video_params = {
            'part': 'statistics,snippet',
            'id': video_id,
            'key': API_KEY
        }
        
        video_response = requests.get(f'{API_BASE_URL}/videos', params=video_params)
        print(f"Video check response: {video_response.status_code}")  # Debug log
        
        if video_response.status_code != 200:
            return jsonify({'error': 'Video not found or access denied'}), 400
        
        video_data = video_response.json()
        if not video_data.get('items'):
            return jsonify({'error': 'Video not found'}), 400
        
        video_info = video_data['items'][0]
        comment_count = int(video_info['statistics'].get('commentCount', 0))
        print(f"Video: {video_info['snippet']['title']}")  # Debug log
        print(f"Comment count: {comment_count}")  # Debug log
        
        # Check if comments are disabled
        if 'commentCount' not in video_info['statistics']:
            return jsonify({
                'comments': [],
                'totalCount': 0,
                'videoId': video_id,
                'sentiment_analysis': {
                    'summary': {
                        'total_comments': 0,
                        'sentiment_counts': {'positive': 0, 'negative': 0, 'neutral': 0},
                        'sentiment_percentages': {'positive': 0, 'negative': 0, 'neutral': 0},
                        'overall_sentiment': 'neutral',
                        'avg_polarity': 0,
                        'avg_subjectivity': 0,
                        'avg_compound': 0,
                        'most_common_words': []
                    },
                    'insights': [f'Comments are disabled for this video: {video_info["snippet"]["title"]}']
                }
            })
        
        if comment_count == 0:
            return jsonify({
                'comments': [],
                'totalCount': 0,
                'videoId': video_id,
                'sentiment_analysis': {
                    'summary': {
                        'total_comments': 0,
                        'sentiment_counts': {'positive': 0, 'negative': 0, 'neutral': 0},
                        'sentiment_percentages': {'positive': 0, 'negative': 0, 'neutral': 0},
                        'overall_sentiment': 'neutral',
                        'avg_polarity': 0,
                        'avg_subjectivity': 0,
                        'avg_compound': 0,
                        'most_common_words': []
                    },
                    'insights': [f'This video ({video_info["snippet"]["title"]}) has no comments yet or comments are disabled.']
                }
            })
        
        # Prepare API request parameters
        params = {
            'part': 'snippet',
            'videoId': video_id,
            'maxResults': min(max_comments, 100),
            'textFormat': 'plainText',
            'key': API_KEY,
            'order': 'relevance'  # Add default order
        }
        
        if sort_by == 'time':
            params['order'] = 'time'
        else:
            params['order'] = 'relevance'
        
        # Make request to YouTube API
        response = requests.get(f'{API_BASE_URL}/commentThreads', params=params)
        
        print(f"YouTube API Response Status: {response.status_code}")  # Debug log
        
        if response.status_code != 200:
            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', 'Failed to fetch comments')
            print(f"YouTube API Error: {error_message}")  # Debug log
            return jsonify({'error': error_message}), 400
        
        data = response.json()
        comments = data.get('items', [])
        print(f"Raw comments from API: {len(comments)}")  # Debug log
        
        # Process comments for frontend
        processed_comments = []
        for comment in comments:
            comment_data = comment['snippet']['topLevelComment']['snippet']
            processed_comment = {
                'author': comment_data.get('authorDisplayName', 'Anonymous'),
                'text': comment_data.get('textDisplay', comment_data.get('textOriginal', '')),
                'publishedAt': comment_data.get('publishedAt', ''),
                'likeCount': comment_data.get('likeCount', 0),
                'authorProfileImageUrl': comment_data.get('authorProfileImageUrl', ''),
                'authorChannelUrl': comment_data.get('authorChannelUrl', '')
            }
            processed_comments.append(processed_comment)
            print(f"Processed comment: {processed_comment['author']} - {processed_comment['text'][:50]}...")  # Debug log
        
        print(f"Total processed comments: {len(processed_comments)}")  # Debug log
        
        # Perform sentiment analysis
        analysis_result = sentiment_analyzer.analyze_comments_batch(processed_comments)
        insights = sentiment_analyzer.get_sentiment_insights(analysis_result)
        
        response_data = {
            'comments': analysis_result['analyzed_comments'],
            'totalCount': len(processed_comments),
            'videoId': video_id,
            'sentiment_analysis': {
                'summary': analysis_result['summary'],
                'insights': insights
            }
        }
        print(f"Sending response with {len(analysis_result['analyzed_comments'])} comments")  # Debug log
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    print("🚀 Starting YouTube Comment Scraper...")
    print("📱 Frontend available at: http://localhost:5000")
    print("🔧 API available at: http://localhost:5000/api")
    app.run(debug=True, host='0.0.0.0', port=5000) 