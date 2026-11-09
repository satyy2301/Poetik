// src/features/learning/LessonFlow.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Lesson, LessonStep } from './lessonTypes';
import AIFeedbackWidget from './AIFeedbackWidget';
import ProgressDots from './ProgressDots';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { FEATURES } from '../../config/features';
import QuizStep from '../../components/lesson-steps/QuizStep';
import { palette } from '../../theme/tokens/colors';

const LessonFlow = ({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) => {
  const { user } = useUser();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = lesson.steps[currentStepIndex];

  const handleNext = async () => {
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setUserResponse('');
      setFeedback('');
    } else {
      await completeLesson();
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setUserResponse('');
      setFeedback('');
    }
  };

  const completeLesson = async () => {
    await supabase
      .from('user_lessons')
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    
    await supabase.rpc('increment_xp', { user_id: user.id, xp: lesson.xpReward });
  };

  const getAIFeedback = async () => {
    if (!FEATURES.AI_ENABLED) {
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('lesson-feedback', {
        body: {
          lessonId: lesson.id,
          step: currentStep,
          userResponse,
        },
      });
      setFeedback(data.feedback);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'theory':
        return <Text style={styles.stepContent}>{currentStep.content}</Text>;
      
      case 'example':
        return (
          <View>
            <Text style={styles.stepContent}>{currentStep.content}</Text>
            {currentStep.metadata?.examples?.map((example, i) => (
              <View key={i} style={styles.exampleContainer}>
                <Text style={styles.exampleText}>{example}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'interactive':
        return (
          <View>
            <Text style={styles.stepContent}>{currentStep.content}</Text>
            <TextInput
              style={styles.responseInput}
              multiline
              placeholder="Write your response here..."
              placeholderTextColor={palette.ghost}
              value={userResponse}
              onChangeText={setUserResponse}
            />
            {FEATURES.AI_ENABLED ? (
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={getAIFeedback}
                disabled={isLoading || !userResponse.trim()}
              >
                <Text style={styles.feedbackButtonText}>
                  {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      
      case 'quiz': {
        const correct = currentStep.metadata?.correctAnswers || [];
        const options = correct.length ? [...correct, 'None of these'] : [];
        return (
          <QuizStep
            step={{
              type: 'quiz',
              content: currentStep.content,
              question: currentStep.content,
              options,
              answerIndex: 0,
            }}
          />
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        
        <ProgressDots 
          totalSteps={lesson.steps.length} 
          currentStep={currentStepIndex + 1} 
        />
        
        <View style={styles.stepContainer}>
          {renderStepContent()}
        </View>
        
        {feedback && <AIFeedbackWidget feedback={feedback} />}
      </ScrollView>
      
      <View style={styles.navigation}>
        {currentStepIndex > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
          disabled={FEATURES.AI_ENABLED && currentStep.type === 'interactive' && !feedback}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText]}>
            {currentStepIndex === lesson.steps.length - 1 ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: palette.parchment,
  },
  stepContainer: {
    backgroundColor: palette.spruce,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.onSurface,
    marginBottom: 15,
  },
  exampleContainer: {
    backgroundColor: palette.canvas,
    borderLeftWidth: 3,
    borderLeftColor: palette.emerald,
    padding: 15,
    marginVertical: 10,
  },
  exampleText: {
    fontStyle: 'italic',
    color: palette.glacial,
  },
  responseInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    fontSize: 16,
    color: palette.parchment,
    textAlignVertical: 'top',
  },
  feedbackButton: {
    backgroundColor: palette.emerald,
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  feedbackButtonDisabled: {
    backgroundColor: palette.ghost,
    opacity: 0.8,
  },
  feedbackButtonText: {
    color: palette.ink,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: palette.spruce,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  nextButton: {
    backgroundColor: palette.emerald,
    marginLeft: 'auto',
  },
  navButtonText: {
    color: palette.parchment,
    fontWeight: 'bold',
  },
  nextButtonText: {
    color: palette.ink,
  },
});

export default LessonFlow;