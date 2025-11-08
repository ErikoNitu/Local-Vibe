export function getIndexPage(styles: string, nodeEnv: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Local Vibe Backend</title>
      <style>${styles}</style>
      <script>
        let isScraperRunning = false;

        async function runScraper() {
          if (isScraperRunning) {
            alert('Scraper is already running!');
            return;
          }

          const btn = document.getElementById('scraperBtn');
          const status = document.getElementById('scraperStatus');
          
          isScraperRunning = true;
          btn.disabled = true;
          btn.textContent = '⏳ Scraping...';
          status.textContent = 'Scraping in progress...';
          status.style.color = '#f59e0b';

          try {
            const response = await fetch('/api/scrape-eventim');
            const data = await response.json();
            
            if (response.ok) {
              status.textContent = \`✅ Found \${data.count} events!\`;
              status.style.color = '#10b981';
              console.log('Events:', data.events);
            } else {
              status.textContent = \`❌ Error: \${data.error}\`;
              status.style.color = '#ef4444';
            }
          } catch (error) {
            status.textContent = '❌ Scraper failed!';
            status.style.color = '#ef4444';
            console.error('Error:', error);
          } finally {
            isScraperRunning = false;
            btn.disabled = false;
            btn.textContent = '🔄 Run Scraper';
          }
        }
      </script>
    </head>
    <body>
      <div class="container">
        <h1>🎉 Local Vibe Backend</h1>
        <div class="subtitle">Backend Server is Running</div>
        <div class="status">✓ Server Online</div>
        
        <div class="info">
          <h2>Server Information</h2>
          <ul>
            <li>🌐 Port: <span class="port">5000</span></li>
            <li>📡 Environment: <span class="port">${nodeEnv || 'development'}</span></li>
            <li>⚙️ Status: <span class="port">Ready</span></li>
          </ul>
        </div>

        <div class="info">
          <h2>Available Endpoints</h2>
          <div class="endpoint">GET /health</div>
          <p style="color: #666; margin-top: 10px; font-size: 0.9rem;">Check if backend is running</p>
          <div class="endpoint" style="margin-top: 15px;">GET /api/scrape-eventim</div>
          <p style="color: #666; margin-top: 10px; font-size: 0.9rem;">Scrape events from Eventim.ro</p>
        </div>

        <div class="info">
          <h2>🕷️ Web Scraper</h2>
          <button id="scraperBtn" onclick="runScraper()" style="
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
          " onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#667eea'">
            🔄 Run Scraper
          </button>
          <p id="scraperStatus" style="color: #999; margin-top: 15px; font-size: 0.9rem;">
            Ready to scrape Eventim.ro
          </p>
        </div>

        <div class="footer">
          <p>Frontend will connect to this server at <strong>http://localhost:5000</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}