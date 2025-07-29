// supabase/functions/poem-suggestions/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { title, content, userId } = await req.json();
  
  try {
    // Call Hugging Face API
    const HF_TOKEN = Deno.env.get('HF_TOKEN');
    const prompt = `Improve this poem while maintaining its essence:\n\nTitle: ${title}\n\n${content}\n\nProvide 3 types of suggestions:
    1. Improved version (same style)
    2. Different style (e.g. more modern)
    3. Experimental version`;
    
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
    
    if (!response.ok) throw new Error('AI suggestion failed');
    
    const result = await response.json();
    const rawText = result[0].generated_text;
    
    // Parse the AI response into individual suggestions
    const suggestions = parseSuggestions(rawText);
    
    // Store the interaction for improvement
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await supabase
      .from('ai_suggestions')
      .insert({
        user_id: userId,
        original_content: content,
        suggestions,
        chosen_suggestion: index,
        model: 'mistral-7b'
      });
    
    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 },
    );
  }
});

// Helper to parse AI response into clean suggestions
function parseSuggestions(text: string): string[] {
  // This would be more sophisticated in production
  return text.split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, 3) // Get top 3 suggestions
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
}