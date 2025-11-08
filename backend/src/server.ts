import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { styles } from './style';
import { getIndexPage } from './pages/index.html';
import { scrapeEventim } from './eventim-scraper';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Frontend interface route
app.get('/', (req: Request, res: Response) => {
  res.send(getIndexPage(styles, process.env.NODE_ENV || 'development'));
});

// API endpoint for scraping Eventim
app.get('/api/scrape-eventim', async (req: Request, res: Response) => {
  try {
    console.log('\n🕷️ Starting Eventim scraper...');
    const events = await scrapeEventim();
    
    console.log(`✅ Scraper completed. Found ${events.length} events\n`);
    
    res.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('❌ Scraper error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Local Vibe Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for frontend requests\n`);
});