import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import QuizGame from './QuizGame';
import RhythmGame from './RhythmGame';
import { Colors } from '@/constants/theme';
import DragDropGame from './DragDropGame';
import BucketSortGame from './BucketSortGame';
import SequenceGame from './SequenceGame';
import SwipeGame from './SwipeGame';
import BathTimeSwipeGame from './BathTimeSwipeGame';
import SliderGame from './SliderGame';

type Section = {
  type:
    | 'quiz'
    | 'rhythm'
    | 'cleanup'
    | 'bucketSort'
    | 'sequence'
    | 'swipe'
    | 'slider';
  questions?: any[];
  instructions?: string;
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
    intro?: { text: string };
    sections: Section[];
    reward?: { text: string; reward: string };
  };
  onComplete: (score: number) => void;
};

export default function MultiGame({ content, onComplete }: Props) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  const handleSectionComplete = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);

    if (currentSectionIndex < content.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      const averageScore = Math.round(
        newScores.reduce((sum, s) => sum + s, 0) / newScores.length
      );
      onComplete(averageScore);
    }
  };

  const currentSection = content.sections[currentSectionIndex];

  const renderSection = () => {
    switch (currentSection.type) {
      case 'quiz':
        return (
          <QuizGame
            content={{
              intro: content.intro,
              questions: currentSection.questions || [],
              reward: content.reward,
            }}
            onComplete={handleSectionComplete}
          />
        );
      case 'rhythm':
        return (
          <RhythmGame
            content={{
              instructions: currentSection.instructions || 'Tap to the beat',
              tempo: currentSection.tempo || 80,
              duration: currentSection.duration || 15,
            }}
            onComplete={handleSectionComplete}
          />
        );
      case 'cleanup':
        return (
          <DragDropGame
            content={{
              instructions: currentSection.instructions || '',
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
              instructions: currentSection.instructions || '',
              items: currentSection.items || [],
            }}
            onComplete={handleSectionComplete}
          />
        );
      case 'sequence':
        return (
          <SequenceGame
            content={{
              instructions: currentSection.instructions || '',
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
              instructions: currentSection.instructions || '',
              min: currentSection.min || 0,
              max: currentSection.max || 0,
              optimal: currentSection.optimal || 0,
              safeRange: currentSection.safeRange || [0, 0],
              unit: currentSection.unit || '',
            }}
            onComplete={handleSectionComplete}
          />
        );
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderSection()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
