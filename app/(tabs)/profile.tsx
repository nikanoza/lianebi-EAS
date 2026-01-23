import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import LioMascot from '@/components/LioMascot';
import { useLanguage } from '@/contexts/LanguageContext'; // 1. Import Language Hook
import { Flame, Droplet, LogOut, Award, Globe } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage(); // 2. Get language tools

  // Helper to format date based on current language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t({ en: 'Profile', ka: 'პროფილი' })}
        </Text>
      </View>

      <View style={styles.content}>
        {/* --- USER INFO --- */}
        <View style={styles.profileCard}>
          <LioMascot state="happy" size={100} />
          <Text style={styles.email}>{user?.email}</Text>
          {profile?.display_name && (
            <Text style={styles.displayName}>{profile.display_name}</Text>
          )}
        </View>

        {/* --- STATS --- */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            {t({ en: 'Your Progress', ka: 'შენი პროგრესი' })}
          </Text>

          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Flame size={24} color={Colors.warning} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>
                  {t({ en: 'Current Streak', ka: 'მიმდინარე სერია' })}
                </Text>
                <Text style={styles.statValue}>
                  {profile?.streak_count || 0} {t({ en: 'days', ka: 'დღე' })}
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Droplet size={24} color={Colors.accent} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>
                  {t({ en: 'Care Drops', ka: 'ზრუნვის წვეთები' })}
                </Text>
                <Text style={styles.statValue}>{profile?.care_drops || 0}</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Award size={24} color={Colors.gold} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>
                  {t({ en: 'Member Since', ka: 'წევრია' })}
                </Text>
                <Text style={styles.statValue}>
                  {profile?.created_at
                    ? formatDate(profile.created_at)
                    : t({ en: 'Just now', ka: 'ახლახანს' })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- LANGUAGE SETTINGS (NEW) --- */}
        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Globe size={20} color={Colors.gray[600]} />
            <Text style={styles.settingsTitle}>
              {t({ en: 'Language', ka: 'ენა' })}
            </Text>
          </View>

          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.langBtn,
                language === 'en' && styles.activeLangBtn,
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.langText,
                  language === 'en' && styles.activeLangText,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langBtn,
                language === 'ka' && styles.activeLangBtn,
              ]}
              onPress={() => setLanguage('ka')}
            >
              <Text
                style={[
                  styles.langText,
                  language === 'ka' && styles.activeLangText,
                ]}
              >
                ქართული
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- ABOUT INFO --- */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            {t({ en: 'About Lianebi', ka: 'ლიანების შესახებ' })}
          </Text>
          <Text style={styles.infoText}>
            {t({
              en: 'Lianebi is your companion in the parenting journey. Learn essential skills through interactive games and build healthy habits with streak tracking and rewards.',
              ka: 'ლიანები შენი მეგზურია მშობლობის გზაზე. ისწავლე საჭირო უნარები ინტერაქტიული თამაშებით და გამოიმუშავე ჯანსაღი ჩვევები სერიების და ჯილდოების დახმარებით.',
            })}
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>
            {t({ en: 'Sign Out', ka: 'გასვლა' })}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.medium,
  },
  email: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[700],
  },
  displayName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.medium,
  },
  statsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
    marginBottom: Spacing.md,
  },
  statsList: {
    gap: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
  },
  statValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
  },
  // --- LANGUAGE SETTINGS STYLES ---
  settingsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.medium,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  settingsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
  },
  languageButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  langBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  activeLangBtn: {
    backgroundColor: Colors.primary + '20', // transparent primary
    borderColor: Colors.primary,
  },
  langText: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[600],
    fontWeight: Typography.weights.medium,
  },
  activeLangText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  // --- END LANGUAGE STYLES ---
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.medium,
  },
  infoTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
    marginBottom: Spacing.xl,
  },
  signOutText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.error,
  },
});
