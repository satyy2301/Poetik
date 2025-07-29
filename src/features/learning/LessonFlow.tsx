// src/features/learning/LessonFlow.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Lesson, LessonStep } from './lessonTypes';
import AIFeedbackWidget from './AIFeedbackWidget';
import ProgressDots from './ProgressDots';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

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
              value={userResponse}
              onChangeText={setUserResponse}
            />
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={getAIFeedback}
              disabled={isLoading || !userResponse.trim()}
            >
              <Text style={styles.feedbackButtonText}>
                {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'quiz':
        return (
          <View>
            <Text style={styles.stepContent}>{currentStep.content}</Text>
            {/* Quiz implementation would go here */}
          </View>
        );
      
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
          disabled={currentStep.type === 'interactive' && !feedback}
        >
          <Text style={styles.navButtonText}>
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
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    marginBottom: 15,
  },
  exampleContainer: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
    padding: 15,
    marginVertical: 10,
  },
  exampleText: {
    fontStyle: 'italic',
    color: '#7f8c8d',
  },
  responseInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  feedbackButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  nextButton: {
    backgroundColor: '#2ecc71',
    marginLeft: 'auto',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LessonFlow;