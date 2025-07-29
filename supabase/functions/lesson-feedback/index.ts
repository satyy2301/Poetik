// supabase/functions/lesson-feedback/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { lessonId, step, userResponse } = await req.json();
  
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  try {
    // Get lesson details
    const { data: lesson } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
    
    // Call Hugging Face API
    const HF_TOKEN = Deno.env.get('HF_TOKEN');
    const prompt = buildFeedbackPrompt(lesson, step, userResponse);
    
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
    
    if (!response.ok) throw new Error('AI feedback failed');
    
    const result = await response.json();
    const feedback = result[0].generated_text;
    
    // Store feedback in database
    await supabase
      .from('lesson_feedback')
      .insert({
        lesson_id: lessonId,
        step_id: step.id,
        user_response: userResponse,
        feedback,
      });
    
    return new Response(
      JSON.stringify({ feedback }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 },
    );
  }
});

function buildFeedbackPrompt(lesson: any, step: any, response: string): string {
  // Custom prompt engineering based on lesson type
  switch (lesson.category) {
    case 'form':
      return `Analyze this poem submission for ${lesson.title}:
              \n\nSubmission: ${response}
              \n\nFocus on: ${step.content}
              \n\nProvide specific feedback on structure, syllable count, and form adherence.
              Give a score from 1-5 for form compliance.`;
    
    case 'technique':
      return `Analyze this poem for ${lesson.title} techniques:
              \n\nPoem: ${response}
              \n\nFocus on: ${step.content}
              \n\nIdentify strengths and weaknesses in technique usage.
              Suggest improvements with examples.`;
    
    default:
      return `Provide constructive feedback on this poem:
              \n\n${response}
              \n\nConsider ${step.content}`;
  }
}