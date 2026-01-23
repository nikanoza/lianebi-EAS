import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';
import LioMascot from '@/components/LioMascot';
import { useLanguage } from '@/contexts/LanguageContext';
import { Droplet } from 'lucide-react-native';

// Sub-Games
import QuizGame from './QuizGame';
import RhythmGame from './RhythmGame';
import DragDropGame from './DragDropGame';
import BucketSortGame from './BucketSortGame';
import SequenceGame from './SequenceGame';
import BathTimeSwipeGame from './BathTimeSwipeGame';
import SliderGame from './SliderGame';
import MassageGame from './MassageGame';
import MilestoneSwipeGame from './MilestoneSwipeGame';

// Types
type BilingualText = string | { en: string; ka: string };

type Section = {
  type: string;
  questions?: any[];
  instructions?: BilingualText;
  tempo?: number;
  duration?: number;
  items?: any[];
  buckets?: any[];
  cards?: any[];
  min?: number;
  max?: number;
  optimal?: number;
  safeRange?: [number, number];
  unit?: string;
};

type Props = {
  content: {
    intro?: { text: BilingualText };
    sections: Section[];
    reward?: { text: BilingualText; reward: string };
  };
  onComplete: (score: number) => void;
};

export default function MultiGame({ content, onComplete }: Props) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'reward'>('intro');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  // Helper to safely render text whether it is a String or Object
  const getText = (text: BilingualText | undefined): string => {
    if (!text) return '';
    return typeof text === 'object' ? t(text) : text;
  };

  const handleStart = () => {
    setPhase('playing');
  };

  const handleSectionComplete = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);

    if (currentSectionIndex < content.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      setPhase('reward');
    }
  };

  const handleFinish = () => {
    const averageScore = Math.round(
      scores.reduce((sum, s) => sum + s, 0) / scores.length,
    );
    onComplete(averageScore);
  };

  // --- 1. GLOBAL INTRO SCREEN ---
  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <LioMascot state="standing" size={150} />
          <Text style={styles.introText}>{getText(content.intro?.text)}</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>
              {t({ en: 'Start', ka: 'დაწყება' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- 3. GLOBAL REWARD SCREEN ---
  if (phase === 'reward') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <LioMascot state="happy" size={150} />
          <Text style={styles.rewardTitle}>
            {t({ en: 'Lesson Complete!', ka: 'გაკვეთილი დასრულდა!' })}
          </Text>
          <Text style={styles.rewardText}>{getText(content.reward?.text)}</Text>

          <View style={styles.rewardBadge}>
            <Droplet size={24} color={Colors.white} />
            <Text style={styles.rewardBadgeText}>
              {content.reward?.reward || '+15'}{' '}
              {t({ en: 'Drops', ka: 'წვეთი' })}
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleFinish}>
            <Text style={styles.startButtonText}>
              {t({ en: 'Finish', ka: 'დასრულება' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- 2. PLAYING SECTIONS ---
  const currentSection = content.sections[currentSectionIndex];
  const renderSection = () => {
    switch (currentSection.type) {
      case 'quiz':
        return (
          <QuizGame
            // QuizGame handles translation internally now, so passing the object is fine
            content={{ questions: currentSection.questions || [] }}
            onComplete={handleSectionComplete}
          />
        );
      case 'rhythm':
        return (
          <RhythmGame
            content={{
              // USE getText() HERE
              instructions: getText(currentSection.instructions),
              tempo: currentSection.tempo || 100,
              duration: currentSection.duration || 30,
            }}
            onComplete={handleSectionComplete}
          />
        );
      case 'cleanup':
        return (
          <DragDropGame
            content={{
              // USE getText() HERE
              instructions: getText(currentSection.instructions),
              items: currentSection.items || [],
            }}
            onComplete={handleSectionComplete}
          />
        );
      case 'bucketSort':
        return (
          <BucketSortGame
            content={{
              buckets: currentSection.buckets || [],
              // USE getText() HERE
              instructions: getText(currentSection.instructions),
              items: currentSection.items || [],
            }}
            onComplete={handleSectionComplete}
          />
        );
      case 'sequence':
        return (
          <SequenceGame
            content={{
              // USE getText() HERE
              instructions: getText(currentSection.instructions),
              items: currentSection.items || [],
            }}
            onComplete={handleSectionComplete}
          />
        );
      case 'swipe':
        return (
          <BathTimeSwipeGame
            content={{ cards: currentSection.cards || [] }}
            onComplete={handleSectionComplete}
          />
        );
      case 'slider':
        return (
          <SliderGame
            content={{
              // USE getText() HERE
              instructions: getText(currentSection.instructions),
              min: currentSection.min || 0,
              max: currentSection.max || 0,
              optimal: currentSection.optimal || 0,
              safeRange: currentSection.safeRange || [0, 0],
              unit: currentSection.unit || '',
            }}
            onComplete={handleSectionComplete}
          />
        );
      case 'tracing':
        return <MassageGame onComplete={handleSectionComplete} />;
      case 'milestoneCheck':
        return (
          <MilestoneSwipeGame
            content={{ cards: currentSection.cards || [] }}
            onComplete={handleSectionComplete}
          />
        );
      default:
        return (
          <View style={styles.center}>
            <Text>Unknown section: {currentSection.type}</Text>
            <TouchableOpacity onPress={() => handleSectionComplete(100)}>
              <Text>Skip</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderSection()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
    ...Shadow.medium,
  },
  introText: {
    fontSize: Typography.sizes.xl,
    textAlign: 'center',
    color: Colors.gray[800],
    lineHeight: 28,
  },
  rewardTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  rewardText: {
    fontSize: Typography.sizes.lg,
    textAlign: 'center',
    color: Colors.gray[600],
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  rewardBadgeText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
});
