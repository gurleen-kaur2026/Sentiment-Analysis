import nltk
from textblob import TextBlob
import re
from collections import Counter
import json
from datetime import datetime

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

from nltk.sentiment.vader import SentimentIntensityAnalyzer

class SentimentAnalyzer:
    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        
    def clean_text(self, text):
        """Clean and preprocess text for analysis"""
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\!\?\,\;\:\-\(\)]', '', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def analyze_sentiment(self, text):
        """Analyze sentiment using multiple methods"""
        cleaned_text = self.clean_text(text)
        
        # TextBlob analysis
        blob = TextBlob(cleaned_text)
        textblob_polarity = blob.sentiment.polarity
        textblob_subjectivity = blob.sentiment.subjectivity
        
        # VADER analysis
        vader_scores = self.vader_analyzer.polarity_scores(cleaned_text)
        
        # Determine sentiment category
        sentiment_category = self.categorize_sentiment(vader_scores['compound'])
        
        return {
            'text': text,
            'cleaned_text': cleaned_text,
            'sentiment_category': sentiment_category,
            'textblob_polarity': textblob_polarity,
            'textblob_subjectivity': textblob_subjectivity,
            'vader_compound': vader_scores['compound'],
            'vader_positive': vader_scores['pos'],
            'vader_negative': vader_scores['neg'],
            'vader_neutral': vader_scores['neu']
        }
    
    def categorize_sentiment(self, compound_score):
        """Categorize sentiment based on compound score"""
        if compound_score >= 0.05:
            return 'positive'
        elif compound_score <= -0.05:
            return 'negative'
        else:
            return 'neutral'
    
    def analyze_comments_batch(self, comments):
        """Analyze a batch of comments and return comprehensive analytics"""
        analyzed_comments = []
        sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        total_polarity = 0
        total_subjectivity = 0
        total_compound = 0
        
        # Analyze each comment
        for comment in comments:
            analysis = self.analyze_sentiment(comment['text'])
            analyzed_comments.append({
                **comment,
                **analysis
            })
            
            # Update counters
            sentiment_counts[analysis['sentiment_category']] += 1
            total_polarity += analysis['textblob_polarity']
            total_subjectivity += analysis['textblob_subjectivity']
            total_compound += analysis['vader_compound']
        
        # Calculate averages
        total_comments = len(analyzed_comments)
        avg_polarity = total_polarity / total_comments if total_comments > 0 else 0
        avg_subjectivity = total_subjectivity / total_comments if total_comments > 0 else 0
        avg_compound = total_compound / total_comments if total_comments > 0 else 0
        
        # Calculate percentages
        total = sum(sentiment_counts.values())
        sentiment_percentages = {
            category: (count / total * 100) if total > 0 else 0
            for category, count in sentiment_counts.items()
        }
        
        # Find most common words
        all_words = []
        for comment in analyzed_comments:
            words = comment['cleaned_text'].lower().split()
            all_words.extend([word for word in words if len(word) > 2])
        
        word_freq = Counter(all_words).most_common(10)
        
        # Overall sentiment assessment
        overall_sentiment = self.categorize_sentiment(avg_compound)
        
        return {
            'analyzed_comments': analyzed_comments,
            'summary': {
                'total_comments': total_comments,
                'sentiment_counts': sentiment_counts,
                'sentiment_percentages': sentiment_percentages,
                'overall_sentiment': overall_sentiment,
                'avg_polarity': round(avg_polarity, 3),
                'avg_subjectivity': round(avg_subjectivity, 3),
                'avg_compound': round(avg_compound, 3),
                'most_common_words': word_freq
            }
        }
    
    def get_sentiment_insights(self, analysis_result):
        """Generate insights from sentiment analysis"""
        summary = analysis_result['summary']
        insights = []
        
        # Overall sentiment insight
        if summary['overall_sentiment'] == 'positive':
            insights.append("🎉 Overall, the comments are positive! Viewers seem to enjoy this content.")
        elif summary['overall_sentiment'] == 'negative':
            insights.append("😔 The comments show a negative sentiment. There might be room for improvement.")
        else:
            insights.append("😐 Comments are mostly neutral. The content is neither strongly liked nor disliked.")
        
        # Sentiment distribution insights
        positive_pct = summary['sentiment_percentages']['positive']
        negative_pct = summary['sentiment_percentages']['negative']
        neutral_pct = summary['sentiment_percentages']['neutral']
        
        if positive_pct > 60:
            insights.append(f"🌟 {positive_pct:.1f}% of comments are positive - excellent engagement!")
        elif negative_pct > 40:
            insights.append(f"⚠️ {negative_pct:.1f}% of comments are negative - consider addressing concerns.")
        
        if neutral_pct > 50:
            insights.append(f"📊 {neutral_pct:.1f}% of comments are neutral - mixed reactions to the content.")
        
        # Subjectivity insight
        if summary['avg_subjectivity'] > 0.6:
            insights.append("💭 Comments are highly subjective - strong personal opinions expressed.")
        elif summary['avg_subjectivity'] < 0.3:
            insights.append("📝 Comments are mostly factual - objective discussion.")
        
        return insights 