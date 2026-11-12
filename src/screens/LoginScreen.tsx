import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { resetPassword, signInWithGoogle } from '../lib/auth';

const REMEMBER_KEY = 'poetik.rememberedEmail';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [secure, setSecure] = useState(true);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(REMEMBER_KEY).then((saved) => {
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      if (remember) {
        await AsyncStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        await AsyncStorage.removeItem(REMEMBER_KEY);
      }
      navigation.replace('App');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLostKey = async () => {
    if (!email.trim()) {
      Alert.alert('Email needed', 'Enter your email and we’ll send a reset link.');
      return;
    }
    try {
      await resetPassword(email.trim());
      Alert.alert('Check your email', 'We sent a link to reset your password.');
    } catch (error: any) {
      Alert.alert('Could not send the email', error.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Google sign-in failed', error.message);
    }
  };

  const fieldStyle = (name: 'email' | 'password') => [
    styles.field,
    {
      backgroundColor: colors.bgCanvas,
      borderColor: focused === name ? colors.focus : colors.borderMuted,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgCanvas }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.meta, { color: colors.brandSecondary }]}>SIGN IN</Text>
          <Text style={[styles.copy, { color: colors.textPrimary }]}>Welcome back</Text>
        </View>
        <Ionicons name="book-outline" size={22} color={colors.brandSecondary} />
      </View>

      <View style={[styles.hero, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.meta, { color: colors.brandSecondary }]}>YOUR DESK</Text>
          <Text style={[theme.typography.displaySm, { color: colors.textPrimary, marginTop: 6 }]}>Welcome back</Text>
          <Text style={[styles.copy, { color: colors.textPrimary, marginTop: 6 }]}>
            Pick up the poems you left unfinished.
          </Text>
        </View>
        <View style={[styles.lamp, { backgroundColor: colors.bgCanvas, borderColor: colors.borderSubtle }]}>
          <Ionicons name="flame-outline" size={22} color={colors.brandSecondary} />
        </View>
      </View>

      <Text style={[styles.verse, styles.epigraph, { color: colors.textPrimary }]}>
        “Words are the soul’s quiet breath.”
      </Text>
      <Text style={[styles.meta, styles.folioMark, { color: colors.textPrimary }]}>A SMALL HOUR FOR VERSE</Text>

      <View style={styles.labelRow}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Email</Text>
      </View>
      <View style={fieldStyle('email')}>
        <Ionicons name="create-outline" size={16} color={colors.textMuted} />
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

      <View style={styles.labelRow}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Password</Text>
      </View>
      <View style={fieldStyle('password')}>
        <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
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

      <View style={styles.row}>
        <TouchableOpacity style={styles.remember} onPress={() => setRemember(!remember)}>
          <Ionicons
            name={remember ? 'checkbox' : 'square-outline'}
            size={18}
            color={remember ? colors.brandPrimary : colors.textMuted}
          />
          <Text style={[styles.copy, { color: colors.textPrimary }]}>Remember me</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLostKey}>
          <Text style={[styles.copy, { color: colors.brandSecondary, textDecorationLine: 'underline' }]}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submit, { backgroundColor: colors.brandPrimary }, theme.shadows.floating]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.onBrand} />
        ) : (
          <>
            <Text style={[styles.buttonLabel, { color: colors.onBrand }]}>Sign in</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.onBrand} />
          </>
        )}
      </TouchableOpacity>

      <Text style={[styles.copy, styles.or, { color: colors.textPrimary }]}>or</Text>
      <TouchableOpacity style={[styles.google, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]} onPress={handleGoogle}>
        <Text style={[styles.buttonLabel, { color: colors.textPrimary }]}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={[styles.prompt, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
        <View style={[styles.pip, { backgroundColor: colors.brandSecondary }]} />
        <Text style={[styles.meta, { color: colors.brandSecondary }]}>TONIGHT</Text>
        <Text style={[styles.copy, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
          “The Geometry of Rain”
        </Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.switchLink}>
        <Text style={[styles.copy, { color: colors.textPrimary }]}>
          New here? <Text style={{ color: colors.brandSecondary }}>Create an account</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, width: '100%', maxWidth: 480, alignSelf: 'center' },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.3 },
  copy: { fontSize: 16, lineHeight: 24 },
  verse: { fontSize: 18, lineHeight: 28, fontStyle: 'italic' },
  fieldLabel: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
  buttonLabel: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitles: { flex: 1, alignItems: 'center' },
  hero: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 18, flexDirection: 'row', gap: 12, alignItems: 'center' },
  lamp: { width: 52, height: 52, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  epigraph: { textAlign: 'center' },
  folioMark: { textAlign: 'center', marginTop: 6, marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 14, gap: 8 },
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 8 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  submit: {
    marginTop: 20,
    height: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  or: { textAlign: 'center', marginVertical: 16 },
  google: {
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    marginTop: 22,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pip: { width: 7, height: 7, borderRadius: 4 },
  switchLink: { marginTop: 18, alignItems: 'center' },
});

export default LoginScreen;
