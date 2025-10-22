// Firebase Cloud Functions for auto-updating property news
// File: functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const Parser = require('rss-parser');

admin.initializeApp();
const db = admin.firestore();
const parser = new Parser();

// NEWS SOURCES - Multiple fallbacks for reliability
const NEWS_SOURCES = {
  newsapi: {
    url: 'https://newsapi.org/v2/everything',
    params: {
      q: 'UK mortgage rates OR property market OR house prices',
      language: 'en',
      sortBy: 'publishedAt',
      domains: 'bbc.co.uk,theguardian.com,telegraph.co.uk,rightmove.co.uk,zoopla.co.uk,ft.com',
      pageSize: 10
    }
  },
  rss: [
    'https://www.rightmove.co.uk/news/rss',
    'https://www.zoopla.co.uk/discover/property-news/feed/'
  ]
};

// Function 1: Fetch news from NewsAPI
async function fetchFromNewsAPI(apiKey) {
  try {
    const response = await axios.get(NEWS_SOURCES.newsapi.url, {
      params: {
        ...NEWS_SOURCES.newsapi.params,
        apiKey: apiKey
      }
    });

    return response.data.articles.map(article => ({
      title: article.title,
      source: article.source.name,
      time: getTimeAgo(new Date(article.publishedAt)),
      url: article.url,
      summary: article.description || '',
      publishedAt: article.publishedAt,
      impact: determineImpact(article.title + ' ' + (article.description || ''))
    }));
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return [];
  }
}

// Function 2: Fetch news from RSS feeds (fallback, always free)
async function fetchFromRSS() {
  const articles = [];
  
  for (const feedUrl of NEWS_SOURCES.rss) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      feed.items.slice(0, 5).forEach(item => {
        articles.push({
          title: item.title,
          source: feed.title || 'Property News',
          time: getTimeAgo(new Date(item.pubDate)),
          url: item.link,
          summary: item.contentSnippet || item.content || '',
          publishedAt: item.pubDate,
          impact: determineImpact(item.title + ' ' + (item.contentSnippet || ''))
        });
      });
    } catch (error) {
      console.error(`RSS fetch error for ${feedUrl}:`, error);
    }
  }
  
  return articles;
}

// Function 3: Determine if news is positive/negative/neutral
function determineImpact(text) {
  const lowerText = text.toLowerCase();
  
  const positiveKeywords = ['cut', 'drop', 'fall', 'lower', 'decrease', 'down', 'relief', 'good news', 'boost', 'improve'];
  const negativeKeywords = ['rise', 'increase', 'up', 'hike', 'surge', 'expensive', 'higher', 'worry', 'concern'];
  
  const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Function 4: Get human-readable time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'Just now';
}

// Function 5: Fetch current mortgage rates from reliable sources
async function fetchCurrentRates() {
  // In production, you'd scrape or use APIs for this
  // For now, we'll use web search or manual updates
  // You could integrate with Moneyfacts API or similar
  
  return {
    twoYearFixed: {
      average: 4.5,
      lowest: 3.75,
      change: -0.2
    },
    fiveYearFixed: {
      average: 4.6,
      lowest: 3.83,
      change: -0.15
    },
    baseRate: 4.00,
    lastUpdated: new Date().toISOString(),
    source: 'Bank of England'
  };
}

// MAIN CLOUD FUNCTION - Runs daily at 6am UK time
exports.updatePropertyNews = functions.pubsub
  .schedule('0 6 * * *')
  .timeZone('Europe/London')
  .onRun(async (context) => {
    console.log('Starting daily property news update...');
    
    try {
      // Get NewsAPI key from environment
      const newsApiKey = functions.config().newsapi?.key;
      
      let articles = [];
      
      // Try NewsAPI first if key is available
      if (newsApiKey) {
        console.log('Fetching from NewsAPI...');
        articles = await fetchFromNewsAPI(newsApiKey);
      }
      
      // Fallback to RSS feeds if NewsAPI failed or unavailable
      if (articles.length === 0) {
        console.log('Falling back to RSS feeds...');
        articles = await fetchFromRSS();
      }
      
      // Fetch current rates
      const currentRates = await fetchCurrentRates();
      
      // Sort by date and take top 6 most recent
      articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      const topArticles = articles.slice(0, 6);
      
      // Save to Firestore
      await db.collection('propertyNews').doc('latest').set({
        articles: topArticles,
        rates: currentRates,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        updateCount: admin.firestore.FieldValue.increment(1)
      });
      
      console.log(`Successfully updated ${topArticles.length} articles`);
      return null;
      
    } catch (error) {
      console.error('Error updating property news:', error);
      throw error;
    }
  });

// API ENDPOINT - For manual refresh or on-demand fetching
exports.getPropertyNews = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    // Get latest news from Firestore
    const newsDoc = await db.collection('propertyNews').doc('latest').get();
    
    if (!newsDoc.exists) {
      // If no data exists, fetch fresh data
      const newsApiKey = functions.config().newsapi?.key;
      let articles = [];
      
      if (newsApiKey) {
        articles = await fetchFromNewsAPI(newsApiKey);
      } else {
        articles = await fetchFromRSS();
      }
      
      const currentRates = await fetchCurrentRates();
      articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      
      const data = {
        articles: articles.slice(0, 6),
        rates: currentRates,
        lastUpdated: new Date().toISOString()
      };
      
      // Save for next time
      await db.collection('propertyNews').doc('latest').set({
        ...data,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.json(data);
    } else {
      // Return cached data
      const data = newsDoc.data();
      res.json({
        articles: data.articles || [],
        rates: data.rates || {},
        lastUpdated: data.lastUpdated?.toDate().toISOString() || new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error fetching property news:', error);
    res.status(500).json({ error: 'Failed to fetch property news' });
  }
});

// MANUAL TRIGGER - For testing or manual updates
exports.manualUpdatePropertyNews = functions.https.onRequest(async (req, res) => {
  // Add authentication here in production
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const newsApiKey = functions.config().newsapi?.key;
    let articles = [];
    
    if (newsApiKey) {
      articles = await fetchFromNewsAPI(newsApiKey);
    }
    
    if (articles.length === 0) {
      articles = await fetchFromRSS();
    }
    
    const currentRates = await fetchCurrentRates();
    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    await db.collection('propertyNews').doc('latest').set({
      articles: articles.slice(0, 6),
      rates: currentRates,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ 
      success: true, 
      articlesUpdated: articles.slice(0, 6).length,
      message: 'Property news updated successfully'
    });
    
  } catch (error) {
    console.error('Manual update error:', error);
    res.status(500).json({ error: error.message });
  }
});