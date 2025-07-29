// src/features/challenges/ChallengeSystem.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import AIFeedbackWidget from '../learning/AIFeedbackWidget';

const ChallengeSystem = ({ challenge, onComplete }: { challenge: any; onComplete: () => void }) => {
  const { user } = useUser();
  const [userSubmission, setUserSubmission] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitChallenge = async () => {
    setIsSubmitting(true);
    try {
      // Get AI feedback
      const { data } = await supabase.functions.invoke('challenge-feedback', {
        body: {
          challengeId: challenge.id,
          userSubmission,
        },
      });
      
      setFeedback(data.feedback);
      
      // Mark as completed if feedback is positive enough
      if (data.score >= 0.7) {
        await supabase
          .from('user_challenges')
          .upsert({
            user_id: user.id,
            challenge_id: challenge.id,
            completed: true,
            xp_earned: challenge.xp_reward,
          });
        
        await supabase.rpc('increment_xp', { user_id: user.id, xp: challenge.xp_reward });
        onComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Challenge</Text>
      <Text style={styles.task}>{challenge.task}</Text>
      
      <TextInput
        style={styles.input}
        multiline
        placeholder="Write your poem here..."
        value={userSubmission}
        onChangeText={setUserSubmission}
      />
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitChallenge}
        disabled={isSubmitting || !userSubmission.trim()}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit for AI Review'}
        </Text>
      </TouchableOpacity>
      
      {feedback && (
        <>
          <AIFeedbackWidget feedback={feedback} />
          <TouchableOpacity
            style={styles.completeButton}
            onPress={onComplete}
          >
            <Text style={styles.completeButtonText}>Continue</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  task: {
    fontSize: 18,
    marginBottom: 30,
    color: '#34495e',
    lineHeight: 26,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChallengeSystem;