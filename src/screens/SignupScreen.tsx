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
          <Text style={[theme.typography.labelMono, { color: colors.brandSecondary }]}>CREATE ACCOUNT</Text>
          <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>Join the reading room</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.hero, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
        <Text style={[theme.typography.labelMono, { color: colors.brandSecondary }]}>YOUR PEN NAME</Text>
        <Text style={[theme.typography.displaySm, { color: colors.textPrimary, marginTop: 6 }]}>
          Start your <Text style={{ fontStyle: 'italic', color: colors.brandSecondary }}>folio</Text>
        </Text>
        <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 6 }]}>
          A quiet place to read, write, and learn poetry.
        </Text>
      </View>

      <Text style={[theme.typography.labelMono, styles.label, { color: colors.textSecondary }]}>WHAT DO YOU LIKE TO WRITE?</Text>
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
              <Text style={[theme.typography.labelBold, { color: active ? colors.brandSecondary : colors.textPrimary }]}>
                {item.title}
              </Text>
              <Text style={[theme.typography.labelMono, { color: colors.textMuted, marginTop: 4, textAlign: 'center' }]}>
                {item.detail}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[theme.typography.labelMono, styles.label, { color: colors.textSecondary }]}>PEN NAME</Text>
      <View style={fieldStyle('name')}>
        <Text style={[theme.typography.bodyMd, { color: colors.textMuted }]}>@</Text>
        <TextInput
          style={[styles.input, theme.typography.bodyMd, { color: colors.textPrimary }]}
          placeholder="your.name"
          placeholderTextColor={colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
        />
      </View>

      <Text style={[theme.typography.labelMono, styles.label, { color: colors.textSecondary }]}>EMAIL</Text>
      <View style={fieldStyle('email')}>
        <Ionicons name="mail-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.input, theme.typography.bodyMd, { color: colors.textPrimary }]}
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
        <Text style={[theme.typography.labelMono, { color: colors.textSecondary }]}>PASSWORD</Text>
        <Text style={[theme.typography.labelMono, { color: colors.accent }]}>
          {passed >= 3 ? 'STRONG ENOUGH' : 'KEEP GOING'}
        </Text>
      </View>
      <View style={fieldStyle('password')}>
        <Ionicons name="key-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.input, theme.typography.bodyMd, { color: colors.textPrimary }]}
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
            <Text key={check.id} style={[theme.typography.labelMono, { color: ok ? colors.brandSecondary : colors.textMuted }]}>
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
        <Text style={[theme.typography.bodySm, { color: colors.textSecondary, flex: 1 }]}>
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
            <Text style={[theme.typography.labelBold, { color: colors.onBrand }]}>Create account</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.onBrand} />
          </>
        )}
      </TouchableOpacity>

      <Text style={[theme.typography.labelMono, styles.or, { color: colors.textMuted }]}>OR</Text>
      <TouchableOpacity style={[styles.google, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]} onPress={handleGoogle}>
        <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
        <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
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
  input: { flex: 1, paddingVertical: 10 },
  cipherLabel: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
  meterTrack: { height: 4, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  meterFill: { height: 4 },
  checks: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
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
