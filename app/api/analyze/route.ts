import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    let { url, title, description } = await req.json();

    // Clean URL (remove trailing text from mobile sharing)
    url = url.trim();
    const urlMatch = url.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      url = urlMatch[0];
    }

    // Clean title (remove extra characters)
    title = title?.trim() || '';
    description = description?.trim() || '';

    console.log('🤖 AI Analysis Input:', { 
      url: url.substring(0, 80), 
      title: title.substring(0, 50),
      description: description.substring(0, 50)
    });

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found');
      return handleFallBack(url, title, description);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a bookmark classifier. Classify into ONE category:
- Learning/Tech
- Tools/Resources
- Health/Fitness
- Entertainment/Leisure
- Food/Travel
- Other

Generate 2-4 relevant tags.

Return ONLY JSON:
{"category": "Learning/Tech", "tags": ["tutorial", "coding"]}`
        },
        {
          role: "user",
          content: `URL: ${url}\nTitle: ${title || 'N/A'}\nDescription: ${description || 'N/A'}`
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    console.log('✅ AI Response:', result);

    return NextResponse.json({
      category: result.category || 'Other',
      tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : []
    });

  } catch (error) {
    console.error('❌ AI Error:', error);
    
    const { url, title, description } = await req.json();
    return handleFallBack(url, title, description);
  }
}

function handleFallBack(url: string, title: string, description: string) {
  console.log('⚠️ Using fallback classification');
  
  const content = `${url} ${title} ${description}`.toLowerCase();
  
  let category = 'Other';
  const tags: string[] = [];

  if (content.match(/youtube|youtu\.be|video|tutorial|learn|course|coding|programming|tech/i)) {
    category = 'Learning/Tech';
    tags.push('video', 'tutorial', 'learning');
  } else if (content.match(/tool|ai|software|app|resource/i)) {
    category = 'Tools/Resources';
    tags.push('tool', 'productivity');
  } else if (content.match(/health|fitness|workout|exercise/i)) {
    category = 'Health/Fitness';
    tags.push('health', 'fitness');
  } else if (content.match(/food|recipe|restaurant|travel|vacation/i)) {
    category = 'Food/Travel';
    tags.push('food', 'travel');
  } else if (content.match(/tiktok|douyin|entertainment|music|game|xiaohongshu|instagram|facebook/i)) {
    category = 'Entertainment/Leisure';
    tags.push('social media', 'entertainment');
  }

  return NextResponse.json({ category, tags });
}
