// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const fetchBtn = document.getElementById('fetchBtn');
const maxCommentsSelect = document.getElementById('maxComments');
const sortBySelect = document.getElementById('sortBy');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorText = document.getElementById('errorText');
const commentsContainer = document.getElementById('commentsContainer');
const commentCount = document.getElementById('commentCount');
const exportBtn = document.getElementById('exportBtn');
const sentimentDashboard = document.getElementById('sentimentDashboard');
const overallSentiment = document.getElementById('overallSentiment');
const sentimentChart = document.getElementById('sentimentChart');
const sentimentMetrics = document.getElementById('sentimentMetrics');
const wordCloud = document.getElementById('wordCloud');
const insightsList = document.getElementById('insightsList');

// Global variables
let currentComments = [];
let currentSentimentAnalysis = null;

// API Configuration
const API_BASE_URL = '/api';

// Event Listeners
fetchBtn.addEventListener('click', handleFetchComments);
exportBtn.addEventListener('click', handleExportCSV);
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleFetchComments();
    }
});

// Add filter button listeners
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        const filter = e.target.dataset.filter;
        filterComments(filter);
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
    }
});

// Main function to fetch comments
async function handleFetchComments() {
    const videoUrl = videoUrlInput.value.trim();
    const maxComments = parseInt(maxCommentsSelect.value);
    const sortBy = sortBySelect.value;

    // Validate input
    if (!videoUrl) {
        showError('Please enter a YouTube video URL');
        return;
    }

    if (!isValidYouTubeUrl(videoUrl)) {
        showError('Please enter a valid YouTube video URL');
        return;
    }

    // Show loading state
    showLoading();
    hideError();
    hideResults();

    try {
        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            throw new Error('Could not extract video ID from URL');
        }

        const response = await fetchComments(videoUrl, maxComments, sortBy);
        console.log('API Response:', response); // Debug log
        
        currentComments = response.comments || [];
        currentSentimentAnalysis = response.sentiment_analysis || null;
        
        console.log('Current Comments:', currentComments.length); // Debug log
        console.log('Sentiment Analysis:', currentSentimentAnalysis); // Debug log
        
        displaySentimentDashboard();
        displayComments(currentComments);
        showResults();

    } catch (error) {
        console.error('Error fetching comments:', error);
        showError(error.message || 'Failed to fetch comments. Please try again.');
    }
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:v=|\/)([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// Validate YouTube URL
function isValidYouTubeUrl(url) {
    const youtubePatterns = [
        /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/,
        /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}/,
        /^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/,
        /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}\?.*$/,  // Allow query parameters
        /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}.*$/  // Allow query parameters for youtube.com
    ];

    // Also check if we can extract a video ID
    const videoId = extractVideoId(url);
    if (videoId) {
        return true;
    }

    return youtubePatterns.some(pattern => pattern.test(url));
}

// Fetch comments from our backend API
async function fetchComments(videoUrl, maxComments, sortBy) {
    const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            videoUrl: videoUrl,
            maxComments: maxComments,
            sortBy: sortBy
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
    }

    const data = await response.json();
    console.log('Raw API response:', data); // Debug log
    return data; // Return the full response, not just comments
}

// Display comments in the UI
function displayComments(comments) {
    console.log('Displaying comments:', comments.length); // Debug log
    commentsContainer.innerHTML = '';
    commentCount.textContent = comments.length;

    if (comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="comment-item">
                <div class="comment-text">
                    No comments found for this video.
                </div>
            </div>
        `;
        return;
    }

    comments.forEach((comment, index) => {
        console.log('Processing comment:', comment); // Debug log
        const commentElement = createCommentElement(comment, index + 1);
        commentsContainer.appendChild(commentElement);
    });
}

// Filter comments by sentiment
function filterComments(filter) {
    if (filter === 'all') {
        displayComments(currentComments);
    } else {
        const filteredComments = currentComments.filter(comment => 
            comment.sentiment_category === filter
        );
        displayComments(filteredComments);
    }
}

// Create individual comment element
function createCommentElement(comment, index) {
    const commentDiv = document.createElement('div');
    commentDiv.className = `comment-item ${comment.sentiment_category || 'neutral'}`;
    
    const authorName = comment.author || 'Anonymous';
    const commentText = comment.text || 'No text available';
    const publishedAt = new Date(comment.publishedAt).toLocaleDateString();
    const likeCount = comment.likeCount || 0;
    const sentimentCategory = comment.sentiment_category || 'neutral';

    // Sentiment scores
    const polarity = comment.textblob_polarity || 0;
    const subjectivity = comment.textblob_subjectivity || 0;
    const compound = comment.vader_compound || 0;

    commentDiv.innerHTML = `
        <div class="sentiment-badge ${sentimentCategory}">${sentimentCategory.toUpperCase()}</div>
        <div class="comment-header">
            <div class="comment-author">${escapeHtml(authorName)}</div>
            <div class="comment-date">${publishedAt}</div>
        </div>
        <div class="comment-text">${escapeHtml(commentText)}</div>
        ${likeCount > 0 ? `<div class="comment-likes">👍 ${likeCount}</div>` : ''}
        <div class="sentiment-scores">
            <div class="score-item">
                <span class="score-label">Polarity:</span>
                <span class="score-value">${polarity.toFixed(3)}</span>
            </div>
            <div class="score-item">
                <span class="score-label">Subjectivity:</span>
                <span class="score-value">${subjectivity.toFixed(3)}</span>
            </div>
            <div class="score-item">
                <span class="score-label">Compound:</span>
                <span class="score-value">${compound.toFixed(3)}</span>
            </div>
        </div>
    `;

    return commentDiv;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export comments to CSV
function handleExportCSV() {
    if (currentComments.length === 0) {
        showError('No comments to export');
        return;
    }

    const csvContent = generateSentimentCSV(currentComments, currentSentimentAnalysis);
    downloadCSV(csvContent, `youtube_sentiment_analysis_${new Date().toISOString().split('T')[0]}.csv`);
}

// Generate CSV content with sentiment analysis
function generateSentimentCSV(comments, sentimentAnalysis) {
    const headers = [
        'Author', 'Date', 'Comment', 'Likes', 'Sentiment', 
        'Polarity', 'Subjectivity', 'Compound Score'
    ];
    
    const rows = comments.map(comment => [
        `"${comment.author || ''}"`,
        `"${comment.publishedAt || ''}"`,
        `"${(comment.text || '').replace(/"/g, '""')}"`,
        `"${comment.likeCount || 0}"`,
        `"${comment.sentiment_category || 'neutral'}"`,
        `"${comment.textblob_polarity || 0}"`,
        `"${comment.textblob_subjectivity || 0}"`,
        `"${comment.vader_compound || 0}"`
    ]);

    // Add summary section
    const summary = sentimentAnalysis?.summary;
    if (summary) {
        rows.push([]); // Empty row
        rows.push(['SENTIMENT ANALYSIS SUMMARY']);
        rows.push(['Total Comments', summary.total_comments]);
        rows.push(['Positive Comments', summary.sentiment_counts.positive]);
        rows.push(['Negative Comments', summary.sentiment_counts.negative]);
        rows.push(['Neutral Comments', summary.sentiment_counts.neutral]);
        rows.push(['Average Polarity', summary.avg_polarity]);
        rows.push(['Average Subjectivity', summary.avg_subjectivity]);
        rows.push(['Average Compound Score', summary.avg_compound]);
        rows.push(['Overall Sentiment', summary.overall_sentiment]);
    }

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Download CSV file
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// UI State Management Functions
function showLoading() {
    loadingSection.style.display = 'block';
    fetchBtn.disabled = true;
    fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
}

function hideLoading() {
    loadingSection.style.display = 'none';
    fetchBtn.disabled = false;
    fetchBtn.innerHTML = '<i class="fas fa-search"></i> Fetch Comments';
}

function showResults() {
    resultsSection.style.display = 'block';
    hideLoading();
}

function hideResults() {
    resultsSection.style.display = 'none';
    sentimentDashboard.style.display = 'none';
}

// Display sentiment analysis dashboard
function displaySentimentDashboard() {
    if (!currentSentimentAnalysis) {
        sentimentDashboard.style.display = 'none';
        return;
    }

    sentimentDashboard.style.display = 'block';
    const summary = currentSentimentAnalysis.summary;
    const insights = currentSentimentAnalysis.insights || [];

    // Calculate overall sentiment with enhanced display
    const totalComments = summary.total_comments;
    const positiveCount = summary.sentiment_counts.positive;
    const negativeCount = summary.sentiment_counts.negative;
    const neutralCount = summary.sentiment_counts.neutral;
    
    const overallScore = ((positiveCount - negativeCount) / totalComments * 100).toFixed(1);
    const sentimentLabel = summary.overall_sentiment.toUpperCase();
    const sentimentEmoji = {
        'positive': '😊',
        'negative': '😔',
        'neutral': '😐'
    };

    overallSentiment.innerHTML = `
        <div class="overall-score">
            <span class="score-value">${overallScore}%</span>
            <span class="score-label">${sentimentEmoji[summary.overall_sentiment]} ${sentimentLabel}</span>
        </div>
    `;

    // Display enhanced sentiment chart
    displayEnhancedSentimentChart(summary);

    // Display enhanced metrics
    displayEnhancedSentimentMetrics(summary);

    // Display enhanced word cloud
    displayEnhancedWordCloud(summary.most_common_words || []);

    // Display enhanced insights
    displayEnhancedInsights(insights);

    // Display sentiment timeline
    displaySentimentTimeline();

    // Display emotion wheel
    displayEmotionWheel(summary);

    // Setup interactive features
    setupInteractiveFeatures();
}

// Display sentiment distribution chart
function displaySentimentChart(summary) {
    const { sentiment_counts, sentiment_percentages } = summary;
    
    const chartHTML = `
        <div class="chart-container">
            <div class="chart-bars">
                <div class="chart-bar positive" style="height: ${sentiment_percentages.positive}%" 
                     onclick="showChartDetails('Positive', ${sentiment_counts.positive}, ${summary.total_comments})">
                    <span class="bar-label">Positive</span>
                    <span class="bar-value">${sentiment_counts.positive}</span>
                </div>
                <div class="chart-bar neutral" style="height: ${sentiment_percentages.neutral}%"
                     onclick="showChartDetails('Neutral', ${sentiment_counts.neutral}, ${summary.total_comments})">
                    <span class="bar-label">Neutral</span>
                    <span class="bar-value">${sentiment_counts.neutral}</span>
                </div>
                <div class="chart-bar negative" style="height: ${sentiment_percentages.negative}%"
                     onclick="showChartDetails('Negative', ${sentiment_counts.negative}, ${summary.total_comments})">
                    <span class="bar-label">Negative</span>
                    <span class="bar-value">${sentiment_counts.negative}</span>
                </div>
                        </div>
            <div class="chart-legend">
                <div class="chart-legend-item">
                    <div class="chart-legend-color positive"></div>
                    <span>Positive</span>
                </div>
                <div class="chart-legend-item">
                    <div class="chart-legend-color neutral"></div>
                    <span>Neutral</span>
                </div>
                <div class="chart-legend-item">
                    <div class="chart-legend-color negative"></div>
                    <span>Negative</span>
                </div>
            </div>
        </div>
    `;
    
    sentimentChart.innerHTML = chartHTML;
}

// Display sentiment metrics
function displaySentimentMetrics(summary) {
    const metricsHTML = `
        <div class="metric-item">
            <div class="metric-value">${summary.avg_polarity}</div>
            <div class="metric-label">Avg Polarity</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${summary.avg_subjectivity}</div>
            <div class="metric-label">Avg Subjectivity</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${summary.avg_compound}</div>
            <div class="metric-label">Avg Compound</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${summary.total_comments}</div>
            <div class="metric-label">Total Comments</div>
        </div>
    `;
    
    sentimentMetrics.innerHTML = metricsHTML;
}

// Display word cloud
function displayWordCloud(words) {
    const wordCloudHTML = words.map(([word, count]) => 
        `<span class="word-tag" style="font-size: ${Math.max(0.8, Math.min(1.5, count / 2))}em">${word} (${count})</span>`
    ).join('');
    
    wordCloud.innerHTML = wordCloudHTML;
}

// Display insights
function displayInsights(insights) {
    const insightsHTML = insights.map(insight => 
        `<div class="insight-item">${insight}</div>`
    ).join('');
    
    insightsList.innerHTML = insightsHTML;
}

function showError(message) {
    errorText.textContent = message;
    errorSection.style.display = 'block';
    hideLoading();
}

function hideError() {
    errorSection.style.display = 'none';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Add some nice animations
    const main = document.querySelector('.main');
    main.style.opacity = '0';
    main.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        main.style.transition = 'all 0.6s ease';
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
    }, 100);

    // Add typing animation to subtitle
    const subtitle = document.querySelector('.subtitle');
    const originalText = subtitle.textContent;
    subtitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            subtitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    setTimeout(typeWriter, 1000);

    // Add floating animation to logo
    const logo = document.querySelector('.logo');
    logo.style.animation = 'float 3s ease-in-out infinite';

    // Add success animation when results are shown
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const resultsSection = document.getElementById('resultsSection');
                if (resultsSection.style.display === 'block') {
                    resultsSection.classList.add('success-bounce');
                    setTimeout(() => {
                        resultsSection.classList.remove('success-bounce');
                    }, 600);
                }
            }
        });
    });

    observer.observe(document.getElementById('resultsSection'), {
        attributes: true
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        handleFetchComments();
    }
});

// Enhanced visualization functions
function displayEnhancedSentimentChart(summary) {
    const { sentiment_counts, sentiment_percentages } = summary;
    
    const chartData = [
        { label: 'Positive', value: sentiment_counts.positive, percentage: sentiment_percentages.positive, color: '#ff0000', emoji: '😊' },
        { label: 'Neutral', value: sentiment_counts.neutral, percentage: sentiment_percentages.neutral, color: '#6b7280', emoji: '😐' },
        { label: 'Negative', value: sentiment_counts.negative, percentage: sentiment_percentages.negative, color: '#ff4757', emoji: '😔' }
    ];

    const chartHTML = `
        <div class="chart-container">
            <div class="chart-bars">
                ${chartData.map(item => `
                    <div class="chart-bar-wrapper">
                        <div class="bar-value-outside">${item.value}</div>
                        <div class="chart-bar ${item.label.toLowerCase()}${item.percentage >= 25 ? ' filled' : ''}" style="height: ${item.percentage}%" 
                             onclick="showChartDetails('${item.label}', ${item.value}, ${summary.total_comments})">
                            <span class="bar-label">${item.emoji} ${item.label}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="chart-legend">
                ${chartData.map(item => `
                    <div class="chart-legend-item">
                        <div class="chart-legend-color ${item.label.toLowerCase()}" style="background: ${item.color}"></div>
                        <span>${item.label}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    sentimentChart.innerHTML = chartHTML;
}

function displayEnhancedSentimentMetrics(summary) {
    const metricsHTML = `
        <div class="metric-item" onclick="showMetricDetails('Total Comments', ${summary.total_comments})">
            <div class="metric-label">📊 Total Comments</div>
            <div class="metric-value">${summary.total_comments}</div>
        </div>
        <div class="metric-item" onclick="showMetricDetails('Positive', ${summary.sentiment_counts.positive}, ${summary.sentiment_percentages.positive.toFixed(1)})">
            <div class="metric-label">😊 Positive</div>
            <div class="metric-value positive">${summary.sentiment_counts.positive} (${summary.sentiment_percentages.positive.toFixed(1)}%)</div>
        </div>
        <div class="metric-item" onclick="showMetricDetails('Neutral', ${summary.sentiment_counts.neutral}, ${summary.sentiment_percentages.neutral.toFixed(1)})">
            <div class="metric-label">😐 Neutral</div>
            <div class="metric-value neutral">${summary.sentiment_counts.neutral} (${summary.sentiment_percentages.neutral.toFixed(1)}%)</div>
        </div>
        <div class="metric-item" onclick="showMetricDetails('Negative', ${summary.sentiment_counts.negative}, ${summary.sentiment_percentages.negative.toFixed(1)})">
            <div class="metric-label">😔 Negative</div>
            <div class="metric-value negative">${summary.sentiment_counts.negative} (${summary.sentiment_percentages.negative.toFixed(1)}%)</div>
        </div>
        <div class="metric-item" onclick="showMetricDetails('Avg Polarity', ${summary.avg_polarity})">
            <div class="metric-label">📈 Avg Polarity</div>
            <div class="metric-value">${summary.avg_polarity}</div>
        </div>
        <div class="metric-item" onclick="showMetricDetails('Avg Subjectivity', ${summary.avg_subjectivity})">
            <div class="metric-label">🎯 Avg Subjectivity</div>
            <div class="metric-value">${summary.avg_subjectivity}</div>
        </div>
    `;
    
    sentimentMetrics.innerHTML = metricsHTML;
}

function displayEnhancedWordCloud(words) {
    if (!words || words.length === 0) {
        wordCloud.innerHTML = '<p style="text-align: center; opacity: 0.7;">No word frequency data available</p>';
        return;
    }

    const wordCloudHTML = words.map(([word, count]) => `
        <span class="word-tag" 
              style="font-size: ${Math.max(0.8, Math.min(1.5, count / words[0][1] * 1.5))}rem"
              onclick="showWordDetails('${word}', ${count})"
              title="Click for details">
            ${word} (${count})
        </span>
    `).join('');
    
    wordCloud.innerHTML = wordCloudHTML;
}

function displayEnhancedInsights(insights) {
    if (!insights || insights.length === 0) {
        insightsList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No insights available</p>';
        return;
    }

    const insightsHTML = insights.map(insight => `
        <div class="insight-item" onclick="showInsightDetails(this)">
            ${insight}
        </div>
    `).join('');
    
    insightsList.innerHTML = insightsHTML;
}

function displaySentimentTimeline() {
    const timelineContainer = document.getElementById('sentimentTimeline');
    if (!timelineContainer) return;

    const timelineData = currentComments.slice(0, 10).map((comment, index) => {
        const sentiment = comment.sentiment_category || 'neutral';
        const time = new Date().getTime() - (index * 60000); // Simulate timeline
        return {
            text: comment.text.substring(0, 50) + '...',
            sentiment: sentiment,
            time: new Date(time).toLocaleTimeString()
        };
    });

    const timelineHTML = timelineData.map(item => `
        <div class="timeline-item ${item.sentiment}">
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-sentiment ${item.sentiment}">${item.sentiment}</div>
            <div class="timeline-text">${item.text}</div>
        </div>
    `).join('');

    timelineContainer.innerHTML = timelineHTML;
}

function displayEmotionWheel(summary) {
    const emotionChart = document.getElementById('emotionChart');
    if (!emotionChart) return;

    const emotionData = {
        positive: summary.sentiment_counts.positive,
        neutral: summary.sentiment_counts.neutral,
        negative: summary.sentiment_counts.negative
    };

    const dominantEmotion = Object.entries(emotionData).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const emotionEmoji = {
        positive: '😊',
        neutral: '😐',
        negative: '😔'
    };

    emotionChart.innerHTML = `
        <div class="emotion-wheel" onclick="showEmotionDetails('${dominantEmotion}', ${emotionData[dominantEmotion]}, ${summary.total_comments})">
            <div class="emotion-center">
                <div style="font-size: 2rem;">${emotionEmoji[dominantEmotion]}</div>
                <div style="font-size: 0.9rem;">${dominantEmotion}</div>
            </div>
        </div>
        <div class="emotion-legend">
            <div class="legend-item">
                <div class="legend-color positive"></div>
                <span>Positive</span>
            </div>
            <div class="legend-item">
                <div class="legend-color neutral"></div>
                <span>Neutral</span>
            </div>
            <div class="legend-item">
                <div class="legend-color negative"></div>
                <span>Negative</span>
            </div>
        </div>
    `;
}

function setupInteractiveFeatures() {
    // Setup word cloud size controls
    setupWordCloudControls();
    
    // Add hover effects for charts
    addChartHoverEffects();
    
    // Setup metric interactions
    setupMetricInteractions();
    
    // Setup dashboard card interactions
    setupDashboardCardInteractions();
}

function setupWordCloudControls() {
    const controls = document.querySelector('.word-cloud-controls');
    if (!controls) return;

    controls.addEventListener('click', (e) => {
        if (e.target.classList.contains('cloud-btn')) {
            // Update active button
            controls.querySelectorAll('.cloud-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Adjust word cloud size
            const size = e.target.dataset.size;
            adjustWordCloudSize(size);
        }
    });
}

function adjustWordCloudSize(size) {
    const wordTags = document.querySelectorAll('.word-tag');
    const sizeMultiplier = {
        small: 0.7,
        medium: 1.0,
        large: 1.3
    };

    wordTags.forEach(tag => {
        const currentSize = parseFloat(tag.style.fontSize);
        const newSize = currentSize * sizeMultiplier[size];
        tag.style.fontSize = `${newSize}rem`;
    });
}

function addChartHoverEffects() {
    const chartItems = document.querySelectorAll('.chart-item');
    chartItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
}

function setupMetricInteractions() {
    const metricItems = document.querySelectorAll('.metric-item');
    metricItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
}

function setupDashboardCardInteractions() {
    const dashboardCards = document.querySelectorAll('.chart-card, .metrics-card, .word-cloud-card, .insights-card, .timeline-card, .emotion-card');
    
    dashboardCards.forEach(card => {
        card.addEventListener('click', () => {
            const cardType = card.className.split(' ')[0];
            const cardTitle = card.querySelector('h4')?.textContent || 'Dashboard Card';
            
            let details = [];
            
            switch(cardType) {
                case 'chart-card':
                    details = [
                        { label: 'Chart Type', value: 'Sentiment Distribution' },
                        { label: 'Interactive', value: 'Click bars for details' },
                        { label: 'Legend', value: 'Color-coded sentiment categories' }
                    ];
                    break;
                case 'metrics-card':
                    details = [
                        { label: 'Metrics Type', value: 'Sentiment Statistics' },
                        { label: 'Interactive', value: 'Click metrics for details' },
                        { label: 'Data', value: 'Real-time sentiment analysis' }
                    ];
                    break;
                case 'word-cloud-card':
                    details = [
                        { label: 'Word Cloud', value: 'Most frequent words' },
                        { label: 'Interactive', value: 'Click words for details' },
                        { label: 'Size', value: 'Font size indicates frequency' }
                    ];
                    break;
                case 'insights-card':
                    details = [
                        { label: 'AI Insights', value: 'Generated analysis' },
                        { label: 'Interactive', value: 'Click insights for details' },
                        { label: 'Source', value: 'AI-powered sentiment analysis' }
                    ];
                    break;
                case 'timeline-card':
                    details = [
                        { label: 'Timeline', value: 'Comment sentiment over time' },
                        { label: 'Interactive', value: 'Real-time sentiment tracking' },
                        { label: 'Data', value: 'Chronological sentiment analysis' }
                    ];
                    break;
                case 'emotion-card':
                    details = [
                        { label: 'Emotion Wheel', value: 'Dominant sentiment visualization' },
                        { label: 'Interactive', value: 'Click wheel for details' },
                        { label: 'Legend', value: 'Color-coded emotion categories' }
                    ];
                    break;
            }
            
            showModal(`${cardTitle} Details`, details);
        });
    });
}

// Interactive detail functions
function showChartDetails(label, value, total) {
    const percentage = ((value / total) * 100).toFixed(1);
    showModal(`${label} Details`, [
        { label: 'Comments Count', value: value },
        { label: 'Percentage', value: `${percentage}%` },
        { label: 'Total Comments', value: total }
    ]);
}

function showMetricDetails(label, value, percentage) {
    const details = [
        { label: 'Value', value: value }
    ];
    
    if (percentage) {
        details.push({ label: 'Percentage', value: `${percentage}%` });
    }
    
    showModal(`${label} Details`, details);
}

function showWordDetails(word, count) {
    showModal('Word Analysis', [
        { label: 'Word', value: word },
        { label: 'Frequency', value: `${count} times` },
        { label: 'Analysis', value: count > 5 ? 'High frequency word' : count > 2 ? 'Medium frequency word' : 'Low frequency word' }
    ]);
}

function showInsightDetails(element) {
    const insight = element.textContent;
    showModal('AI Insight', [
        { label: 'Insight', value: insight },
        { label: 'Type', value: 'AI Generated Analysis' }
    ]);
}

function showEmotionDetails(emotion, count, total) {
    const percentage = ((count / total) * 100).toFixed(1);
    showModal('Emotion Analysis', [
        { label: 'Dominant Emotion', value: emotion.toUpperCase() },
        { label: 'Count', value: `${count} comments` },
        { label: 'Percentage', value: `${percentage}%` },
        { label: 'Total Comments', value: total }
    ]);
}

// Modal functions
function showModal(title, details) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    
    const detailsHTML = details.map(detail => `
        <div class="modal-detail-item">
            <span class="modal-detail-label">${detail.label}:</span>
            <span class="modal-detail-value">${detail.value}</span>
        </div>
    `).join('');
    
    modalContent.innerHTML = `
        <div class="modal-title">${title}</div>
        <div class="modal-details">
            ${detailsHTML}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal when clicking on X or outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('detailModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}); 