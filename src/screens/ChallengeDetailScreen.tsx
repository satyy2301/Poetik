import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useProgress } from '../context/ProgressContext';
import { submitChallenge, DailyChallenge } from '../services/challengeService';
import XPGainToast from '../components/XPGainToast';

const ChallengeDetailScreen = ({ route, navigation }: any) => {
  const { challenge } = route.params as { challenge: DailyChallenge };
  const { user } = useUser();
  const { refresh, lastXpGain, clearXpToast, addXp } = useProgress();
  const [submission, setSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please log in to submit.');
      return;
    }

    if (!submission.trim()) {
      Alert.alert('Empty submission', 'Write your poem first.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitChallenge(user.id, challenge, submission.trim());
      await addXp(result.xpEarned);
      await refresh();
      Alert.alert(
        'Challenge complete!',
        `+${result.xpEarned} XP · ${result.streak} day streak`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not submit challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
      <Text style={styles.badge}>Daily Challenge</Text>
      <Text style={styles.title}>{challenge?.task}</Text>
      <Text style={styles.xp}>+{challenge?.xp_reward || 50} XP</Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="Write your poem here..."
        value={submission}
        onChangeText={setSubmission}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.submit, submitting && styles.disabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitText}>Submit Challenge</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    color: '#0984e3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '700',
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#2c3e50', marginBottom: 8 },
  xp: { color: '#f39c12', fontWeight: '600', marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    marginBottom: 16,
  },
  submit: {
    backgroundColor: '#0984e3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabled: { opacity: 0.7 },
  submitText: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default ChallengeDetailScreen;
