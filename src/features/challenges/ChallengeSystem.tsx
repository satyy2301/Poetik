// src/features/challenges/ChallengeSystem.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import AIFeedbackWidget from '../learning/AIFeedbackWidget';
import { FEATURES } from '../../config/features';
import ComingSoonBanner from '../../components/ComingSoonBanner';
import { palette } from '../../theme/tokens/colors';

const ChallengeSystem = ({ challenge, onComplete }: { challenge: any; onComplete: () => void }) => {
  const { user } = useUser();
  const [userSubmission, setUserSubmission] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitChallenge = async () => {
    if (!FEATURES.AI_ENABLED) {
      return;
    }

    setIsSubmitting(true);
    try {
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
        placeholderTextColor={palette.ghost}
        value={userSubmission}
        onChangeText={setUserSubmission}
      />
      
      {FEATURES.AI_ENABLED ? (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitChallenge}
          disabled={isSubmitting || !userSubmission.trim()}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit for AI Review'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={[styles.submitButton, styles.submitButtonDisabled]} disabled>
            <Text style={styles.submitButtonText}>Submit for AI Review</Text>
          </TouchableOpacity>
          <ComingSoonBanner
            compact
            message="AI challenge review will return in a future update."
          />
        </>
      )}

      {FEATURES.AI_ENABLED && feedback && (
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
    backgroundColor: palette.canvas,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: palette.parchment,
  },
  task: {
    fontSize: 18,
    marginBottom: 30,
    color: palette.onSurface,
    lineHeight: 26,
  },
  input: {
    flex: 1,
    backgroundColor: palette.spruce,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: palette.parchment,
    textAlignVertical: 'top',
    marginBottom: 20,
    shadowColor: palette.canvas,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: palette.emerald,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: palette.ghost,
    opacity: 0.8,
  },
  submitButtonText: {
    color: palette.ink,
    fontWeight: 'bold',
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: palette.emerald,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeButtonText: {
    color: palette.ink,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChallengeSystem;