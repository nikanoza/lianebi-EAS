import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import {
  Check,
  X,
  CalendarClock,
  Droplets,
  User,
  Thermometer,
  UserX,
  HelpCircle,
} from 'lucide-react-native';
import LioMascot from '@/components/LioMascot';
// 1. IMPORT LANGUAGE HOOK
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// --- 2. INTERNAL ICON MAPPING ---
const ICON_MAP: Record<string, React.ElementType> = {
  dailyBath: CalendarClock,
  spongeBath: Droplets,
  washHead: User,
  elbowTest: Thermometer,
  leaveAlone: UserX,
};

// --- 3. TYPES ---
type BilingualText = string | { en: string; ka: string };

export type Card = {
  id?: string;
  icon?: string;
  text: BilingualText;
  answer?: 'left' | 'right';
  feedback?: BilingualText;
};

type Props = {
  content: {
    intro?: { text: BilingualText };
    cards: Card[];
    reward?: { text: BilingualText; reward: string };
  };
  onComplete: (score: number) => void;
};

// --- CARD COMPONENT ---
function SwipeableCard({
  card,
  onSwipe,
  isActive,
  getText,
  t,
}: {
  card: Card;
  onSwipe: (dir: 'left' | 'right') => void;
  isActive: boolean;
  getText: (text: BilingualText | undefined) => string;
  t: (text: any) => string;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.2;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        runOnJS(onSwipe)('left');
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        runOnJS(onSwipe)('right');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
    };
  });

  // Get the correct icon component
  const IconComponent = card.icon ? ICON_MAP[card.icon] : HelpCircle;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        <View style={styles.card}>
          {/* Overlays */}
          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.leftOverlay,
              { opacity: translateX.value < -50 ? 1 : 0 },
            ]}
          >
            <X size={80} color="white" />
            <Text style={styles.overlayText}>
              {t({ en: 'BAD HABIT', ka: 'ცუდი ჩვევა' })}
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.rightOverlay,
              { opacity: translateX.value > 50 ? 1 : 0 },
            ]}
          >
            <Check size={80} color="white" />
            <Text style={styles.overlayText}>
              {t({ en: 'GOOD HABIT', ka: 'კარგი ჩვევა' })}
            </Text>
          </Animated.View>

          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <IconComponent size={100} color={Colors.primary} />
            </View>
            <Text style={styles.cardText}>{getText(card.text)}</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// --- MAIN GAME COMPONENT ---
export default function BathTimeSwipeGame({ content, onComplete }: Props) {
  const { t } = useLanguage();

  const [phase, setPhase] = useState<'intro' | 'game' | 'reward'>(
    content.intro ? 'intro' : 'game',
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    correct: boolean;
    feedback?: BilingualText;
  } | null>(null);

  // Helper to safely extract text
  const getText = (text: BilingualText | undefined) => {
    if (!text) return '';
    return typeof text === 'object' ? t(text) : text;
  };

  const currentCard = content.cards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentCard?.answer) return;
    const isCorrect = direction === currentCard.answer;
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    setLastAnswer({ correct: isCorrect, feedback: currentCard.feedback });
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIndex < content.cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Game Finished
      if (content.reward) {
        setPhase('reward');
      } else {
        onComplete(Math.round((correctCount / content.cards.length) * 100));
      }
    }
  };

  if (phase === 'intro' && content.intro) {
    return (
      <View style={styles.centerContainer}>
        <LioMascot state="excited" size={160} />
        <Text style={styles.introText}>{getText(content.intro.text)}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => setPhase('game')}>
          <Text style={styles.btnText}>
            {t({ en: 'Start Bathing Lesson', ka: 'გაკვეთილის დაწყება' })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'reward' && content.reward) {
    return (
      <View style={styles.centerContainer}>
        <LioMascot state="happy" size={160} />
        <Text style={styles.introText}>{getText(content.reward.text)}</Text>
        <Text style={styles.rewardAmount}>{content.reward.reward}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => onComplete(100)}>
          <Text style={styles.btnText}>
            {t({ en: 'Finish', ka: 'დასრულება' })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          {t({ en: 'Card', ka: 'ბარათი' })} {currentIndex + 1} /{' '}
          {content.cards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {!showFeedback && (
          <SwipeableCard
            card={currentCard}
            onSwipe={handleSwipe}
            isActive={true}
            getText={getText}
            t={t}
          />
        )}
      </View>

      {/* FEEDBACK POPUP */}
      {showFeedback && lastAnswer && (
        <View
          style={[
            styles.feedback,
            lastAnswer.correct ? styles.correct : styles.incorrect,
          ]}
        >
          <Text style={styles.feedbackTitle}>
            {lastAnswer.correct
              ? t({ en: 'Correct!', ka: 'სწორია!' })
              : t({ en: 'Not quite!', ka: 'არასწორია!' })}
          </Text>
          <Text style={styles.feedbackText}>
            {getText(lastAnswer.feedback)}
          </Text>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>
              {t({ en: 'Next Card', ka: 'შემდეგი' })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* INSTRUCTIONS FOOTER */}
      <View style={styles.footer}>
        <View style={styles.legendItem}>
          <X size={20} color={Colors.error} />
          <Text style={styles.legendText}>
            {t({ en: 'Left: Bad', ka: 'მარცხნივ: ცუდი' })}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Check size={20} color={Colors.success} />
          <Text style={styles.legendText}>
            {t({ en: 'Right: Good', ka: 'მარჯვნივ: კარგი' })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  header: { alignItems: 'center', marginTop: Spacing.lg },
  progress: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },

  cardContainer: { flex: 1, alignItems: 'center', marginTop: 40 },
  cardWrapper: { width: CARD_WIDTH, height: 450 },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: BorderRadius.xl,
    ...Shadow.medium,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  iconContainer: { marginBottom: 30 },
  cardText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },

  swipeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftOverlay: { left: 0, backgroundColor: 'rgba(214, 40, 40, 0.9)' },
  rightOverlay: { right: 0, backgroundColor: 'rgba(76, 175, 80, 0.9)' },
  overlayText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },

  feedback: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    zIndex: 20,
    ...Shadow.large,
  },
  correct: { backgroundColor: Colors.success },
  incorrect: { backgroundColor: Colors.error },
  feedbackTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  feedbackText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  continueBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
  },
  continueBtnText: { fontWeight: 'bold', color: '#333' },

  introText: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
    fontWeight: '500',
  },
  rewardAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: 30,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    ...Shadow.medium,
  },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    paddingBottom: 40,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontSize: 16, color: Colors.gray[600], fontWeight: 'bold' },
});
