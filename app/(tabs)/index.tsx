import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import LioMascot from '@/components/LioMascot';
import { Flame, Droplet, Lock } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';

// 2. Define Static Translations
const translations = {
  headerTitle: {
    en: 'Your Journey',
    ka: 'შენი მოგზაურობა',
  },
  completed: {
    en: 'completed',
    ka: 'დასრულებულია',
  },
  startJourney: {
    en: 'Start Journey',
    ka: 'დაწყება',
  },
  continueJourney: {
    en: 'Continue Journey',
    ka: 'გაგრძელება',
  },
  lockedMessage: {
    en: 'Complete previous units to unlock',
    ka: 'დაასრულეთ წინა ნაწილები გასახსნელად',
  },
  retry: {
    en: 'Retry',
    ka: 'თავიდან ცდა',
  },
  noCourses: {
    en: 'No courses available yet',
    ka: 'კურსები ჯერ არ არის ხელმისაწვდომი',
  },
  reloadCourses: {
    en: 'Reload Courses',
    ka: 'კურსების განახლება',
  },
  loadError: {
    en: 'Failed to load courses',
    ka: 'კურსების ჩატვირთვა ვერ მოხერხდა',
  },
};

// 3. Update Unit Type to reflect JSONB columns
type LocalizedString = {
  en: string;
  ka: string;
};

type Unit = {
  id: string;
  title: LocalizedString; // Changed from string
  description: LocalizedString | null; // Changed from string
  age_range: LocalizedString | null; // Changed from string
  order_index: number;
  is_active: boolean;
  image_key: string | null;
};

type Progress = {
  completed: number;
  total: number;
};

export default function HomeHub() {
  const { profile } = useAuth();
  const { t } = useLanguage(); // <--- 4. Get translation helper
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unitProgress, setUnitProgress] = useState<Record<string, Progress>>(
    {},
  );

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (profile && units.length > 0) {
      fetchProgress(units);
    }
  }, [profile]);

  const fetchUnits = async () => {
    try {
      setError(null);
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .order('order_index');

      if (unitsError) {
        console.error('Error fetching units:', unitsError);
        setError(t(translations.loadError)); // Localized error
        throw unitsError;
      }

      if (unitsData) {
        setUnits(unitsData);
        if (profile) {
          await fetchProgress(unitsData);
        }
      } else {
        setUnits([]);
      }
    } catch (error: any) {
      console.error('Error fetching units:', error);
      setError(t(translations.loadError));
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (unitsList: Unit[]) => {
    if (!profile) return;

    try {
      const progressMap: Record<string, Progress> = {};

      for (const unit of unitsList) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('unit_id', unit.id);

        const { data: userProgress } = await supabase
          .from('user_progress')
          .select('completed')
          .eq('user_id', profile.id)
          .in('lesson_id', lessons?.map((l) => l.id) || []);

        const completed = userProgress?.filter((p) => p.completed).length || 0;
        const total = lessons?.length || 0;

        progressMap[unit.id] = { completed, total };
      }

      setUnitProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleUnitPress = (unit: Unit) => {
    if (!unit.is_active) return;

    if (Platform.OS === 'web') {
      const appSessionId = (window as any).__appSessionId;
      if (appSessionId) {
        sessionStorage.setItem('unitLessonSession', appSessionId);
      }
    }

    router.push(`/unit/${unit.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* 5. Translated Header Title */}
          <Text style={styles.headerTitle}>{t(translations.headerTitle)}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Flame size={20} color={Colors.white} />
              <Text style={styles.statText}>{profile?.streak_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Droplet size={20} color={Colors.white} />
              <Text style={styles.statText}>{profile?.care_drops || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUnits}>
              <Text style={styles.retryButtonText}>
                {t(translations.retry)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && !loading && units.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t(translations.noCourses)}</Text>
            {/* Kept debug text in English as it's for devs */}
            <Text style={styles.debugText}>
              Debug: Profile ID: {profile?.id || 'Not loaded'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUnits}>
              <Text style={styles.retryButtonText}>
                {t(translations.reloadCourses)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {units.map((unit) => {
          const progress = unitProgress[unit.id] || { completed: 0, total: 0 };
          const isLocked = !unit.is_active;
          const progressPercentage =
            progress.total > 0
              ? (progress.completed / progress.total) * 100
              : 0;

          return (
            <TouchableOpacity
              key={unit.id}
              style={[styles.unitCard, isLocked && styles.unitCardLocked]}
              onPress={() => handleUnitPress(unit)}
              disabled={isLocked}
              activeOpacity={0.8}
            >
              <View style={styles.unitCardContent}>
                <View style={styles.unitMascotContainer}>
                  {isLocked ? (
                    <View style={styles.lockedIcon}>
                      <Lock size={40} color={Colors.gray[400]} />
                    </View>
                  ) : (
                    <LioMascot
                      state={(unit.image_key as any) || 'happy'}
                      size={100}
                    />
                  )}
                </View>

                <View style={styles.unitInfo}>
                  <View style={styles.unitHeader}>
                    {/* 6. Dynamic Translation for Title */}
                    <Text
                      style={[
                        styles.unitTitle,
                        isLocked && styles.unitTitleLocked,
                      ]}
                    >
                      {t(unit.title)}
                    </Text>

                    {unit.age_range && (
                      <View style={styles.ageRangeBadge}>
                        {/* 7. Dynamic Translation for Age Range */}
                        <Text style={styles.ageRangeText}>
                          {t(unit.age_range)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {unit.description && (
                    /* 8. Dynamic Translation for Description */
                    <Text
                      style={[
                        styles.unitDescription,
                        isLocked && styles.unitDescriptionLocked,
                      ]}
                    >
                      {t(unit.description)}
                    </Text>
                  )}

                  {!isLocked && progress.total > 0 && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progressPercentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {progress.completed}/{progress.total}{' '}
                        {t(translations.completed)}
                      </Text>
                    </View>
                  )}

                  {!isLocked && (
                    <View style={styles.unitButtonContainer}>
                      <View style={styles.continueButton}>
                        <Text style={styles.continueButtonText}>
                          {progress.completed === 0
                            ? t(translations.startJourney)
                            : t(translations.continueJourney)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {isLocked && (
                    <View style={styles.lockedBadge}>
                      <Lock size={16} color={Colors.gray[500]} />
                      <Text style={styles.lockedText}>
                        {t(translations.lockedMessage)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  unitCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.medium,
  },
  unitCardLocked: {
    opacity: 0.6,
  },
  unitCardContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  unitMascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIcon: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.full,
  },
  unitInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  unitTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    flex: 1,
  },
  unitTitleLocked: {
    color: Colors.gray[500],
  },
  ageRangeBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  ageRangeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.white,
  },
  unitDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  unitDescriptionLocked: {
    color: Colors.gray[400],
  },
  progressContainer: {
    gap: Spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  unitButtonContainer: {
    marginTop: Spacing.xs,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadow.small,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  lockedText: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray[500],
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: Spacing.lg,
    backgroundColor: '#FEE',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    color: '#C33',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  debugText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[400],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
