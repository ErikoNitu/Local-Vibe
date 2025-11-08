import puppeteer from 'puppeteer';
import * as fs from 'fs';

interface ScrapedEvent {
  title: string;
  date: string;
  price: string;
  description: string;
  url: string;
}

export async function scrapeEventim(): Promise<ScrapedEvent[]> {
  let browser;
  
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log('📍 Navigating to Eventim.ro...');
    await page.goto('https://www.eventim.ro/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for events to load
    console.log('⏳ Waiting for events to load...');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

    // Scroll to load more events
    console.log('📜 Scrolling to load more events...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    }

    // Save screenshot to see what we're scraping
    await page.screenshot({ path: 'eventim-screenshot.png' });
    console.log('📸 Screenshot saved to eventim-screenshot.png');

    // Extract event data from the page
    console.log('🔍 Extracting event data...');
    const events = await page.evaluate(() => {
      const results: ScrapedEvent[] = [];
      
      // Try different selectors for event containers
      const selectors = [
        '.event-card',
        'article',
        '.product-card',
        '[data-qa="search-result-item"]',
        '.event-item'
      ];

      let eventElements: any[] = [];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          eventElements = Array.from(elements);
          break;
        }
      }

      eventElements.forEach((element) => {
        try {
          // Extract title
          const titleEl = element.querySelector('h2, h3, .event-title, .product-name, .title');
          const title = titleEl?.textContent?.trim() || '';

          // Extract date
          const dateEl = element.querySelector('.event-date, time, .date, [data-qa="event-date"]');
          const date = dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || 'Date TBA';

          // Extract price
          const priceEl = element.querySelector('.price, .event-price, .product-price, [data-qa="price"]');
          const price = priceEl?.textContent?.trim() || 'Price not available';

          // Extract description/category
          const descEl = element.querySelector('.description, .subtitle, .event-description, .category, p');
          const description = descEl?.textContent?.trim() || 'Event';

          // Extract URL
          const linkEl = element.querySelector('a[href]');
          let url = linkEl?.getAttribute('href') || '';
          
          if (url && !url.startsWith('http')) {
            url = `https://www.eventim.ro${url}`;
          }

          // Only add if we have a title
          if (title && title.length > 3) {
            results.push({
              title,
              date,
              price,
              description: description.substring(0, 200),
              url
            });
          }
        } catch (err) {
          console.error('Error parsing event element:', err);
        }
      });

      return results;
    });

    console.log(`✅ Found ${events.length} events`);

    // Remove duplicates
    const uniqueEvents = Array.from(
      new Map(events.map(event => [event.title, event])).values()
    );

    return uniqueEvents.slice(0, 50); // Limit to 50 events

  } catch (error) {
    console.error('❌ Error during scraping:', error);
    throw new Error(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔌 Browser closed');
    }
  }
}

async function main() {
  try {
    console.log('Starting Eventim.ro scraper...');
    const events = await scrapeEventim();

    // Save to JSON file
    const filename = `eventim_events_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(events, null, 2));
    
    console.log(`\n✓ Successfully scraped ${events.length} events`);
    console.log(`✓ Data saved to ${filename}`);
    
    // Display sample
    console.log('\nSample events:');
    events.slice(0, 3).forEach((event, idx) => {
      console.log(`\n${idx + 1}. ${event.title}`);
      console.log(`   Date: ${event.date}`);
      console.log(`   Price: ${event.price}`);
      console.log(`   Type: ${event.description}`);
    });

  } catch (error) {
    console.error('Failed to scrape events:', error);
    process.exit(1);
  }
}

main();