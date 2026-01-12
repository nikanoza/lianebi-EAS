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
import { Flame, Droplet, LogOut, Award } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <LioMascot state="happy" size={100} />
          <Text style={styles.email}>{user?.email}</Text>
          {profile?.display_name && (
            <Text style={styles.displayName}>{profile.display_name}</Text>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Progress</Text>

          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Flame size={24} color={Colors.warning} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValue}>{profile?.streak_count || 0} days</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Droplet size={24} color={Colors.accent} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Care Drops</Text>
                <Text style={styles.statValue}>{profile?.care_drops || 0}</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Award size={24} color={Colors.gold} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Member Since</Text>
                <Text style={styles.statValue}>
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Just now'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Lianebi</Text>
          <Text style={styles.infoText}>
            Lianebi is your companion in the parenting journey. Learn essential skills through
            interactive games and build healthy habits with streak tracking and rewards.
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
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
  },
  signOutText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.error,
  },
});
