export const styles =`* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
  }
  body {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
  }
  .container {
	background: white;
	border-radius: 16px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	padding: 60px 40px;
	text-align: center;
	max-width: 600px;
  }
  h1 {
	color: #333;
	font-size: 2.5rem;
	margin-bottom: 20px;
  }
  .subtitle {
	color: #667eea;
	font-size: 1.2rem;
	margin-bottom: 40px;
	font-weight: 600;
  }
  .status {
	display: inline-block;
	background: #10b981;
	color: white;
	padding: 12px 24px;
	border-radius: 8px;
	margin-bottom: 40px;
	font-weight: 600;
	font-size: 1rem;
  }
  .info {
	background: #f3f4f6;
	padding: 30px;
	border-radius: 12px;
	margin-bottom: 30px;
	text-align: left;
  }
  .info h2 {
	color: #333;
	font-size: 1.1rem;
	margin-bottom: 15px;
  }
  .info ul {
	list-style: none;
	color: #555;
  }
  .info li {
	padding: 8px 0;
	font-size: 0.95rem;
	border-bottom: 1px solid #e5e7eb;
  }
  .info li:last-child {
	border-bottom: none;
  }
  .endpoint {
	background: #1f2937;
	color: #10b981;
	padding: 12px;
	border-radius: 6px;
	margin: 10px 0;
	font-family: 'Courier New', monospace;
	font-size: 0.9rem;
  }
  .footer {
	color: #999;
	font-size: 0.9rem;
	margin-top: 40px;
  }
  .port {
	color: #667eea;
	font-weight: 600;
	font-size: 1.1rem;
  }`