import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { updateStreak } from '@/lib/streakHelper';
import { ArrowLeft, Award, Droplet } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';

// Game Imports
import SwipeGame from '@/components/games/SwipeGame';
import RhythmGame from '@/components/games/RhythmGame';
import DragDropGame from '@/components/games/DragDropGame';
import SliderGame from '@/components/games/SliderGame';
import QuizGame from '@/components/games/QuizGame';
import MultiGame from '@/components/games/MultiGame';
import LioMascot from '@/components/LioMascot';

// 1. DEFINE TYPES (Keep them as Objects)
type LocalizedString = {
  en: string;
  ka: string;
};

type Lesson = {
  id: string;
  unit_id: string;
  day_number: number;
  title: LocalizedString; // Title is an Object {en, ka}
  description: LocalizedString | null;
  game_type: string;
  content: any; // Content is JSON containing objects {en, ka}
  care_drops_reward: number;
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const { profile, refreshProfile, user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  // 2. FETCH DATA WITHOUT TRANSLATING IT
  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id as string)
        .single();

      if (error) throw error;

      // DO NOT USE translateDeep HERE!
      // Save the raw data so we can translate it dynamically in the render.
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (finalScore: number) => {
    await refreshProfile();
    if (!lesson || !profile) return;

    setScore(finalScore);
    setShowResults(true);
    try {
      // (Progress saving logic remains the same)
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user?.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingProgress) {
        await supabase
          .from('user_progress')
          .update({
            completed: true,
            score: finalScore,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase.from('user_progress').insert({
          user_id: profile.id,
          lesson_id: lesson.id,
          completed: true,
          score: finalScore,
          completed_at: new Date().toISOString(),
        });
      }

      await supabase
        .from('user_profiles')
        .update({
          care_drops: profile.care_drops + lesson.care_drops_reward,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      await updateStreak(profile.id);
      await refreshProfile();
    } catch (error: any) {
      console.error('Error saving progress:', error);
      Alert.alert(
        t({ en: 'Save Error', ka: 'შენახვის შეცდომა' }),
        t({ en: 'Could not save progress.', ka: 'პროგრესი ვერ შეინახა.' }),
      );
    }
  };

  const handleContinue = () => {
    setShowResults(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {t({ en: 'Lesson not found', ka: 'გაკვეთილი არ მოიძებნა' })}
        </Text>
      </View>
    );
  }

  const renderGame = () => {
    // Pass the RAW content to the game.
    // The Game Component uses t() internally to translate.
    switch (lesson.game_type) {
      case 'swipe':
        return (
          <SwipeGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'rhythm':
        return (
          <RhythmGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'drag_drop':
        return (
          <DragDropGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'slider':
        return (
          <SliderGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'quiz':
        return (
          <QuizGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'multi':
        return (
          <MultiGame content={lesson.content} onComplete={handleComplete} />
        );
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unknown game type</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {/* 3. TRANSLATE DYNAMICALLY IN RENDER */}
          <Text style={styles.dayLabel}>
            {t({
              en: `Day ${lesson.day_number}`,
              ka: `დღე ${lesson.day_number}`,
            })}
          </Text>

          <Text style={styles.headerTitle}>
            {/* Translate the Title Object Here */}
            {t(lesson.title)}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {renderGame()}

      <Modal
        visible={showResults}
        transparent
        animationType="fade"
        onRequestClose={handleContinue}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultsCard}>
            <LioMascot state="happy" size={120} />

            <Text style={styles.resultsTitle}>
              {t({ en: 'Great Job!', ka: 'ყოჩაღ!' })}
            </Text>

            <View style={styles.scoreContainer}>
              <Award size={32} color={Colors.gold} />
              <Text style={styles.scoreText}>{score}%</Text>
            </View>

            <View style={styles.rewardContainer}>
              <Droplet size={24} color={Colors.accent} />
              <Text style={styles.rewardText}>
                +{lesson.care_drops_reward}{' '}
                {t({ en: 'Care Drops', ka: 'წვეთი' })}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                {t({ en: 'Continue', ka: 'გაგრძელება' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: { fontSize: Typography.sizes.lg, color: Colors.error },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, alignItems: 'center' },
  dayLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  placeholder: { width: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  resultsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...Shadow.large,
  },
  resultsTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  scoreText: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  rewardText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    ...Shadow.medium,
    zIndex: 9999,
  },
  continueButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
});
