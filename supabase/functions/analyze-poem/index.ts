// supabase/functions/analyze-poem/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface RequestData {
  poem: string;
  userId?: string;
  analysisType?: 'quick' | 'detailed'; // New: Analysis type selector
}

serve(async (req: Request) => {
  try {
    const { poem, userId, analysisType = 'quick' }: RequestData = await req.json();
    
    if (!poem) {
      return new Response(
        JSON.stringify({ error: 'Poem text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // First check cache
    const { data: cached } = await supabase
      .from('poem_feedback')
      .select('feedback')
      .eq('poem_text', poem)
      .limit(1)
      .single();

    if (cached?.feedback) {
      return new Response(
        JSON.stringify({ 
          feedback: cached.feedback,
          source: 'cache'
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Choose analysis path based on type
    let analysisResult;
    if (analysisType === 'quick') {
      // Use Perplexity for quick analysis
      analysisResult = await analyzeWithPerplexity(poem);
    } else {
      // Use Hugging Face for detailed analysis
      analysisResult = await analyzeWithHuggingFace(poem);
    }

    // Store in database (async without awaiting)
    supabase
      .from('poem_feedback')
      .insert([{ 
        poem_text: poem,
        feedback: analysisResult.feedback,
        model: analysisResult.model,
        user_id: userId,
        analysis_type: analysisType
      }])
      .then(({ error }) => {
        if (error) console.error('Cache save error:', error);
      });

    return new Response(
      JSON.stringify({ 
        feedback: analysisResult.feedback,
        source: analysisResult.model
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Perplexity Pro Analysis (Fast)
async function analyzeWithPerplexity(poem: string) {
  const PERPLEXITY_KEY = Deno.env.get('PERPLEXITY_KEY');
  if (!PERPLEXITY_KEY) throw new Error('Perplexity key not configured');

  const response = await fetch('https://api.perplexity.ai/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: poem,
      analysis: ['structure', 'sentiment', 'themes'],
      response_format: 'concise'
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const result = await response.json();
  
  return {
    feedback: result.analysis_summary,
    model: 'perplexity-pro'
  };
}

// Hugging Face Analysis (Detailed)
async function analyzeWithHuggingFace(poem: string) {
  const HF_TOKEN = Deno.env.get('HF_TOKEN');
  if (!HF_TOKEN) throw new Error('Hugging Face token not configured');

  const prompt = `Provide detailed analysis of this poem with:\n
  1. Structural evaluation (meter, rhyme)\n
  2. Emotional tone assessment\n
  3. Thematic analysis\n
  4. Three specific improvement suggestions\n\n
  Poem: ${poem}`;

  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    throw new Error(`HF API error: ${response.statusText}`);
  }

  const result = await response.json();
  
  return {
    feedback: result[0].generated_text,
    model: 'mistral-7b'
  };
}