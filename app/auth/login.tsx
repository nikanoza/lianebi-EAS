import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext'; // 1. Import Hook
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const { t } = useLanguage(); // 2. Init Hook
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      setError(
        t({ en: 'Please fill in all fields', ka: 'გთხოვთ შეავსოთ ყველა ველი' }),
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: authError } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (authError) {
        // You might want to map specific Supabase errors to bilingual text here
        setError(authError.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(
        err.message || t({ en: 'An error occurred', ka: 'დაფიქსირდა შეცდომა' }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    setError('');
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError.message);
      }
    } catch (err: any) {
      setError(
        err.message || t({ en: 'An error occurred', ka: 'დაფიქსირდა შეცდომა' }),
      );
    } finally {
      setSocialLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setSocialLoading(true);
    setError('');
    try {
      const { error: authError } = await signInWithFacebook();
      if (authError) {
        setError(authError.message);
      }
    } catch (err: any) {
      setError(
        err.message || t({ en: 'An error occurred', ka: 'დაფიქსირდა შეცდომა' }),
      );
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={200} />
          <Text style={styles.appTitle}>
            {t({ en: 'Lianebi App', ka: 'ლიანები' })}
          </Text>
          <Text style={styles.subtitle}>
            {t({ en: 'Nurture to Learn', ka: 'იზრუნე და ისწავლე' })}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.nestIcon}>
              <Text style={styles.nestEmoji}>🪺</Text>
            </View>
            <Text style={styles.cardTitle}>
              {t({
                en: 'Keep your progress safe',
                ka: 'შეინახე შენი პროგრესი',
              })}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isSignUp
                ? t({
                    en: 'Create an account to start your journey',
                    ka: 'შექმენი ანგარიში მოგზაურობის დასაწყებად',
                  })
                : t({
                    en: 'Welcome back to your learning journey',
                    ka: 'კეთილი იყოს შენი დაბრუნება',
                  })}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {t({ en: 'Email', ka: 'ელ-ფოსტა' })}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {t({ en: 'Password', ka: 'პაროლი' })}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp
                    ? t({ en: 'Create Account', ka: 'რეგისტრაცია' })
                    : t({ en: 'Sign In', ka: 'შესვლა' })}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {t({ en: 'or continue with', ka: 'ან გააგრძელე' })}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                disabled={loading || socialLoading}
              >
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIcon}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookSignIn}
                disabled={loading || socialLoading}
              >
                <View style={[styles.socialIconContainer, styles.facebookIcon]}>
                  <Text style={styles.socialIcon}>f</Text>
                </View>
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              disabled={loading}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? t({
                      en: 'Already have an account? Sign In',
                      ka: 'უკვე გაქვს ანგარიში? შესვლა',
                    })
                  : t({
                      en: "Don't have an account? Sign Up",
                      ka: 'არ გაქვს ანგარიში? დარეგისტრირება',
                    })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          {t({
            en: 'Start your parenting journey with Lio',
            ka: 'დაიწყე მშობლობის მოგზაურობა ლიოსთან ერთად',
          })}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appTitle: {
    fontSize: Typography.sizes.xxl,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.gray[600],
    marginTop: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.medium,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  nestIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  nestEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.gray[700],
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.gray[900],
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.small,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  switchButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  switchButtonText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[500],
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  socialIconContainer: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
  socialIcon: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  socialButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.gray[700],
  },
  footer: {
    textAlign: 'center',
    color: Colors.gray[500],
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xl,
  },
});
