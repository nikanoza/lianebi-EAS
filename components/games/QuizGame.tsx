import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';
import { Check, X, ArrowRight, Droplet } from 'lucide-react-native';
import LioMascot from '@/components/LioMascot';
import { useLanguage } from '@/contexts/LanguageContext';
import Animated, { FadeIn } from 'react-native-reanimated';

type Translation = { en: string; ka: string };
type BilingualText = string | Translation;

type QuestionOption = {
  text: BilingualText;
  isCorrect: boolean;
};

type Question = {
  question: BilingualText;
  options: QuestionOption[];
  feedback?: BilingualText;
};

type Props = {
  content: {
    intro?: { text: BilingualText };
    questions: Question[];
    reward?: { text: BilingualText; reward: string };
  };
  onComplete: (score: number) => void;
};

export default function QuizGame({ content, onComplete }: Props) {
  const { t } = useLanguage();

  // FIX: If there is no intro, start at 0 (Question 1). If there is intro, start at -1.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    content.intro ? -1 : 0,
  );

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const questions = content.questions || [];

  const getText = (data: BilingualText | undefined) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    return t(data);
  };

  const showingIntro = currentQuestionIndex === -1;
  const showingReward = currentQuestionIndex >= questions.length;

  // Logic update: Ensure we don't try to access questions[-1]
  const currentQuestion =
    !showingIntro && !showingReward && questions.length > 0
      ? questions[currentQuestionIndex]
      : null;

  const handleStartQuiz = () => setCurrentQuestionIndex(0);

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || !currentQuestion) return;
    const isCorrect = currentQuestion.options[selectedOptionIndex].isCorrect;
    if (isCorrect) setScore(score + 1);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOptionIndex(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleFinish = () => {
    const finalScore = Math.round((score / questions.length) * 100);
    onComplete(finalScore);
  };

  // --- REWARD SCREEN ---
  if (showingReward && content.reward) {
    return (
      <View style={styles.container}>
        <View style={styles.rewardContainer}>
          <View style={styles.mascotContainer}>
            <LioMascot state="happy" size={150} />
          </View>
          <Text style={styles.rewardTitle}>
            {t({ en: 'Fantastic!', ka: 'ფანტასტიკურია!' })}
          </Text>
          <Text style={styles.rewardText}>{getText(content.reward.text)}</Text>

          <View style={styles.rewardBadge}>
            <Droplet size={24} color={Colors.white} />
            <Text style={styles.rewardBadgeText}>
              {content.reward.reward || '+15'} {t({ en: 'Drops', ka: 'წვეთი' })}
            </Text>
          </View>

          <Text style={styles.scoreText}>
            {t({ en: 'You got', ka: 'თქვენ გამოიცანით' })} {score} /{' '}
            {questions.length}
          </Text>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>
              {t({ en: 'Continue Journey', ka: 'გზის გაგრძელება' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- SPECIAL CASE: NO REWARD ---
  // If MultiGame is using this, it might not pass a reward object.
  // We should just finish immediately when questions are done.
  if (showingReward && !content.reward) {
    // We can render a minimal "Section Complete" or auto-finish.
    // Ideally MultiGame handles the transition, but let's provide a manual button just in case.
    return (
      <View style={styles.container}>
        <View style={styles.rewardContainer}>
          <LioMascot state="happy" size={150} />
          <Text style={styles.rewardTitle}>
            {t({ en: 'Section Complete!', ka: 'ნაწილი დასრულდა!' })}
          </Text>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>
              {t({ en: 'Next', ka: 'შემდეგი' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- INTRO SCREEN ---
  if (showingIntro && content.intro) {
    return (
      <View style={styles.container}>
        <View style={styles.introContainer}>
          <View style={styles.mascotContainer}>
            <LioMascot state="excited" size={150} />
          </View>
          <Text style={styles.introText}>{getText(content.intro.text)}</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
          >
            <Text style={styles.startButtonText}>
              {t({ en: 'Start Quiz', ka: 'ტესტის დაწყება' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- QUIZ SCREEN ---
  if (currentQuestion) {
    const isCorrect =
      selectedOptionIndex !== null &&
      currentQuestion.options[selectedOptionIndex].isCorrect;

    return (
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {t({ en: 'Question', ka: 'კითხვა' })} {currentQuestionIndex + 1} /{' '}
            {questions.length}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {getText(currentQuestion.question)}
            </Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                const isCorrectOption = option.isCorrect;

                let borderStyle = {};
                let bgStyle = {};
                let textStyle = {};

                if (showFeedback) {
                  if (isCorrectOption) {
                    borderStyle = { borderColor: Colors.success };
                    bgStyle = { backgroundColor: Colors.success + '10' };
                    textStyle = { color: Colors.success, fontWeight: 'bold' };
                  } else if (isSelected && !isCorrectOption) {
                    borderStyle = { borderColor: Colors.error };
                    bgStyle = { backgroundColor: Colors.error + '10' };
                    textStyle = { color: Colors.error };
                  }
                } else if (isSelected) {
                  borderStyle = { borderColor: Colors.primary };
                  bgStyle = { backgroundColor: Colors.primary + '10' };
                  textStyle = { color: Colors.primary, fontWeight: 'bold' };
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionButton, borderStyle, bgStyle]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                  >
                    <Text style={[styles.optionText, textStyle]}>
                      {getText(option.text)}
                    </Text>

                    {showFeedback && isCorrectOption && (
                      <View style={styles.iconContainer}>
                        <Check size={24} color={Colors.success} />
                      </View>
                    )}
                    {showFeedback && isSelected && !isCorrectOption && (
                      <View style={styles.iconContainer}>
                        <X size={24} color={Colors.error} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {!showFeedback && (
              <TouchableOpacity
                style={[
                  styles.checkButton,
                  selectedOptionIndex === null && styles.disabledButton,
                ]}
                onPress={handleSubmitAnswer}
                disabled={selectedOptionIndex === null}
              >
                <Text style={styles.checkButtonText}>
                  {t({ en: 'Check Answer', ka: 'შემოწმება' })}
                </Text>
              </TouchableOpacity>
            )}

            {showFeedback && (
              <Animated.View entering={FadeIn} style={styles.feedbackArea}>
                <View
                  style={[
                    styles.feedbackContainer,
                    isCorrect
                      ? styles.feedbackCorrect
                      : styles.feedbackIncorrect,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 5,
                    }}
                  >
                    <LioMascot
                      state={isCorrect ? 'happy' : 'standing'}
                      size={40}
                    />
                    <Text
                      style={[
                        styles.feedbackTitle,
                        { color: isCorrect ? Colors.success : Colors.error },
                      ]}
                    >
                      {isCorrect
                        ? t({ en: 'Correct!', ka: 'სწორია!' })
                        : t({ en: 'Not quite...', ka: 'არასწორია...' })}
                    </Text>
                  </View>
                  <Text style={styles.feedbackText}>
                    {getText(currentQuestion.feedback)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.nextButtonText}>
                    {currentQuestionIndex < questions.length - 1
                      ? t({ en: 'Next Question', ka: 'შემდეგი კითხვა' })
                      : t({ en: 'See Results', ka: 'შედეგები' })}
                  </Text>
                  <ArrowRight size={20} color={Colors.white} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    ...Shadow.small,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40 },
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  mascotContainer: { marginBottom: Spacing.xl },
  introText: {
    fontSize: Typography.sizes.xl,
    color: Colors.gray[800],
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 28,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadow.medium,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  questionContainer: { gap: Spacing.lg },
  questionText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    lineHeight: 32,
    marginBottom: Spacing.md,
  },
  optionsContainer: { gap: Spacing.md },
  optionButton: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadow.small,
  },
  optionText: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[800],
    flex: 1,
    lineHeight: 22,
  },
  iconContainer: { marginLeft: Spacing.sm },
  checkButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadow.small,
  },
  disabledButton: { backgroundColor: Colors.gray[300], opacity: 0.7 },
  checkButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  feedbackArea: { marginTop: Spacing.sm, gap: Spacing.lg },
  feedbackContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success,
  },
  feedbackIncorrect: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error,
  },
  feedbackTitle: { fontSize: Typography.sizes.lg, fontWeight: 'bold' },
  feedbackText: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[800],
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadow.medium,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  rewardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  rewardTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  rewardText: {
    fontSize: Typography.sizes.lg,
    color: Colors.gray[700],
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 26,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    ...Shadow.medium,
  },
  rewardBadgeText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  scoreText: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[600],
    marginBottom: Spacing.xxl,
  },
  finishButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadow.medium,
  },
  finishButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
});
