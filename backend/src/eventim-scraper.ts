import * as fs from 'fs';
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface Event {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  genre: string;
  isFree: boolean;
  url?: string;
}

async function callModel(model: GenerativeModel, prompt: string, attempt = 1): Promise<string> {
	try {
	  const result = await model.generateContent(prompt);
	  return result.response.text();
	} catch (e: any) {
	  if (attempt < 3) {
		const wait = 1000 * attempt;
		console.warn(`model overloaded, retry #${attempt} in ${wait}ms`);
		await new Promise(res => setTimeout(res, wait));
		return callModel(model, prompt, attempt + 1);
	  }
	  throw e;
	}
  }
  

export async function scrapeEventim(): Promise<Event[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    console.log('🤖 Initializing Gemini AI...');
	
	const genai = new GoogleGenerativeAI(apiKey);
	const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });
	
	
    const prompt = `You are an event discovery assistant. Search for and compile a list of 100 upcoming events happening in Bucharest in the next month. 
	
For each event, provide the following information in JSON format:
{
  "title": "Event Name",
  "description": "Brief description of the event",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "Exact address",
  "organizer": "Organization name",
  "genre": "Category (e.g., Music, Sports, Art, Conference, Theatre, etc.)",
  "isFree": true/false,
  "url": "Website or link if available"
}

Return a JSON array with exactly 50 events. Make sure to include:
- A mix of different genres and types of events
- Events from different locations from Bucharest
- Both free and paid events
- Realistic and current events
- Dates within the next month from today, evenly distributed

Return ONLY valid JSON, no other text.`;


    console.log('📡 Sending request to Gemini API...');
	const text = await callModel(model, prompt);


    console.log('✅ Received response from Gemini');

    // Parse the JSON response
    let events: Event[] = [];
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      
      events = JSON.parse(jsonMatch[0]);

      // Validate events
      if (!Array.isArray(events)) {
        throw new Error("Response is not an array");
      }

      console.log(`✅ Successfully parsed ${events.length} events from Gemini`);
      return events;

    } catch (parseError) {
      console.error("❌ Error parsing Gemini response:", parseError);
      console.error("Raw response:", text.substring(0, 500));
      throw new Error(`Failed to parse event data: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
    }

  } catch (error) {
    console.error('❌ Error fetching events from Gemini:', error);
    throw new Error(`Event fetching failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.log(`   Time: ${event.time}`);
      console.log(`   Location: ${event.location}`);
      console.log(`   Organizer: ${event.organizer}`);
      console.log(`   Genre: ${event.genre}`);
      console.log(`   Free: ${event.isFree}`);
    });

  } catch (error) {
    console.error('Failed to scrape events:', error);
    process.exit(1);
  }
}

// main();