// src/screens/LessonDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import LessonStep from '../components/LessonStep';
import AIFeedback from '../components/AIFeedback';

const LessonDetailScreen = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const { user } = useUser();
  const [lesson, setLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
      
    setLesson(data);
  };

  const handleNextStep = () => {
    if (currentStep < lesson.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserResponse('');
      setFeedback('');
    } else {
      completeLesson();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setUserResponse('');
      setFeedback('');
    }
  };

  const completeLesson = async () => {
    // Mark lesson as completed for user
    await supabase
      .from('user_lessons')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
      });
      
    navigation.goBack();
  };

  const getAIFeedback = async () => {
    // Call Supabase Edge Function to get AI feedback
    const { data } = await supabase.functions.invoke('lesson-feedback', {
      body: {
        lessonType: lesson.type,
        step: lesson.steps[currentStep],
        userResponse,
      },
    });
    
    setFeedback(data.feedback);
  };

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading lesson...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDescription}>{lesson.description}</Text>
        
        <LessonStep 
          step={lesson.steps[currentStep]} 
          stepNumber={currentStep + 1}
          totalSteps={lesson.steps.length}
        />
        
        {lesson.steps[currentStep].requiresResponse && (
          <>
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
            >
              <Text style={styles.feedbackButtonText}>Get AI Feedback</Text>
            </TouchableOpacity>
            
            {feedback && <AIFeedback feedback={feedback} />}
          </>
        )}
      </ScrollView>
      
      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handlePreviousStep}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNextStep}
        >
          <Text style={styles.navButtonText}>
            {currentStep === lesson.steps.length - 1 ? 'Complete' : 'Next'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  lessonDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  responseInput: {
    backgroundColor: 'white',
    minHeight: 100,
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
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
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: '#bdc3c7',
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

export default LessonDetailScreen;