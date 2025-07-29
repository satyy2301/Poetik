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
}

serve(async (req: Request) => {
  try {
    const { poem }: RequestData = await req.json();
    
    if (!poem) {
      return new Response(
        JSON.stringify({ error: 'Poem text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call Hugging Face Inference API
    const HF_TOKEN = Deno.env.get('HF_TOKEN');
    if (!HF_TOKEN) {
      throw new Error('Hugging Face token not configured');
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Analyze this poem for structure, rhyme, and emotional impact. 
                  Provide specific feedback on how to improve it while keeping its essence.
                  Poem: ${poem}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Cache the response in Supabase
    const { error } = await supabase
      .from('poem_feedback')
      .insert([{ 
        poem_text: poem,
        feedback: result[0].generated_text,
        model: 'mistral-7b' 
      }]);

    if (error) throw error;

    return new Response(
      JSON.stringify({ feedback: result[0].generated_text }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});