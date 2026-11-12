import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { signInWithGoogle } from '../lib/auth';

const traditions = [
  { id: 'Formal', title: 'Formal', detail: 'Rhymed lines' },
  { id: 'Lyric', title: 'Free verse', detail: 'Open lines' },
  { id: 'Voice', title: 'Spoken', detail: 'Read aloud' },
] as const;

const checks = [
  { id: 'length', label: '10+ characters', test: (value: string) => value.length >= 10 },
  { id: 'case', label: 'Upper & lower case', test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: 'number', label: 'A number', test: (value: string) => /\d/.test(value) },
  { id: 'seal', label: 'A symbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

const SignupScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tradition, setTradition] = useState<(typeof traditions)[number]['id']>('Formal');
  const [pledged, setPledged] = useState(false);
  const [secure, setSecure] = useState(true);
  const [focused, setFocused] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passed = checks.filter((check) => check.test(password)).length;

  const handleSignup = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (!pledged) {
      Alert.alert('One more step', 'Please agree before you create your account.');
      return;
    }
    setIsLoading(true);
    try {
      await register(email.trim(), password, username.trim());
      navigation.replace('App');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Google sign-in failed', error.message);
    }
  };

  const fieldStyle = (name: string) => [
    styles.field,
    {
      backgroundColor: colors.bgCanvas,
      borderColor: focused === name ? colors.focus : colors.borderMuted,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgCanvas }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.meta, { color: colors.brandSecondary }]}>CREATE ACCOUNT</Text>
          <Text style={[styles.copy, { color: colors.textPrimary }]}>Join the reading room</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.hero, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
        <Text style={[styles.meta, { color: colors.brandSecondary }]}>YOUR PEN NAME</Text>
        <Text style={[theme.typography.displaySm, { color: colors.textPrimary, marginTop: 6 }]}>
          Start your <Text style={{ fontStyle: 'italic', color: colors.brandSecondary }}>folio</Text>
        </Text>
        <Text style={[styles.copy, { color: colors.textPrimary, marginTop: 6 }]}>
          A quiet place to read, write, and learn poetry.
        </Text>
      </View>

      <Text style={[styles.fieldLabel, styles.label, { color: colors.textPrimary }]}>What do you like to write?</Text>
      <View style={styles.traditions}>
        {traditions.map((item) => {
          const active = tradition === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setTradition(item.id)}
              style={[
                styles.tradition,
                {
                  backgroundColor: active ? colors.bgElevated : colors.bgSurface,
                  borderColor: active ? colors.brandPrimary : colors.borderMuted,
                },
              ]}
            >
              <Text style={[styles.copy, { color: active ? colors.brandSecondary : colors.textPrimary, fontWeight: '700' }]}>
                {item.title}
              </Text>
              <Text style={[styles.copy, { color: colors.textPrimary, marginTop: 4, textAlign: 'center', fontSize: 14 }]}>
                {item.detail}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.fieldLabel, styles.label, { color: colors.textPrimary }]}>Pen name</Text>
      <View style={fieldStyle('name')}>
        <Text style={[styles.copy, { color: colors.textPrimary }]}>@</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="your.name"
          placeholderTextColor={colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
        />
      </View>

      <Text style={[styles.fieldLabel, styles.label, { color: colors.textPrimary }]}>Email</Text>
      <View style={fieldStyle('email')}>
        <Ionicons name="mail-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="you@email.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
        />
      </View>

      <View style={styles.cipherLabel}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Password</Text>
        <Text style={[styles.copy, { color: colors.textPrimary, fontSize: 14 }]}>
          {passed >= 3 ? 'Strong enough' : 'Keep going'}
        </Text>
      </View>
      <View style={fieldStyle('password')}>
        <Ionicons name="key-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.brandSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.meterTrack, { backgroundColor: colors.borderMuted }]}>
        <View style={[styles.meterFill, { width: `${(passed / checks.length) * 100}%`, backgroundColor: colors.brandPrimary }]} />
      </View>
      <View style={styles.checks}>
        {checks.map((check) => {
          const ok = check.test(password);
          return (
            <Text key={check.id} style={[styles.copy, { color: ok ? colors.brandSecondary : colors.textPrimary }]}>
              {ok ? '✓' : '·'} {check.label}
            </Text>
          );
        })}
      </View>

      <TouchableOpacity style={styles.pledge} onPress={() => setPledged(!pledged)}>
        <Ionicons
          name={pledged ? 'checkbox' : 'square-outline'}
          size={18}
          color={pledged ? colors.brandPrimary : colors.textMuted}
        />
        <Text style={[styles.copy, { color: colors.textPrimary, flex: 1 }]}>
          I agree to the community guidelines and to respect other writers’ work.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submit, { backgroundColor: colors.brandPrimary, opacity: pledged ? 1 : 0.55 }, theme.shadows.floating]}
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.onBrand} />
        ) : (
          <>
            <Text style={[styles.buttonLabel, { color: colors.onBrand }]}>Create account</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.onBrand} />
          </>
        )}
      </TouchableOpacity>

      <Text style={[styles.copy, styles.or, { color: colors.textPrimary }]}>or</Text>
      <TouchableOpacity style={[styles.google, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]} onPress={handleGoogle}>
        <Text style={[styles.buttonLabel, { color: colors.textPrimary }]}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
        <Text style={[styles.copy, { color: colors.textPrimary }]}>
          Already have an account? <Text style={{ color: colors.brandSecondary }}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, width: '100%', maxWidth: 480, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitles: { flex: 1, alignItems: 'center' },
  hero: { borderWidth: 1, borderRadius: 12, padding: 16 },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.3 },
  copy: { fontSize: 16, lineHeight: 24 },
  fieldLabel: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
  buttonLabel: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  label: { marginBottom: 8, marginTop: 18 },
  traditions: { flexDirection: 'row', gap: 8 },
  tradition: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    minHeight: 48,
    gap: 8,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, lineHeight: 22 },
  cipherLabel: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
  meterTrack: { height: 4, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  meterFill: { height: 4 },
  checks: { gap: 6, marginTop: 12 },
  pledge: { flexDirection: 'row', gap: 8, marginTop: 18, alignItems: 'flex-start' },
  submit: {
    marginTop: 18,
    height: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  or: { textAlign: 'center', marginVertical: 16 },
  google: { height: 48, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  switchLink: { marginTop: 22, alignItems: 'center' },
});

export default SignupScreen;
