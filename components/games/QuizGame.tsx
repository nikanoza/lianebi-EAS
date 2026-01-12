import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Check, X } from 'lucide-react-native';
import LioMascot from '@/components/LioMascot';

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  feedback?: string;
};

type Props = {
  content: {
    intro?: {
      text: string;
    };
    questions: Question[];
    reward?: {
      text: string;
      reward: string;
    };
  };
  onComplete: (score: number) => void;
};

export default function QuizGame({ content, onComplete }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showReward, setShowReward] = useState(false);

  const showingIntro = currentQuestionIndex === -1;
  const showingQuestion = currentQuestionIndex >= 0 && currentQuestionIndex < content.questions.length;
  const currentQuestion = showingQuestion ? content.questions[currentQuestionIndex] : null;

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion?.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestionIndex]));
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);

    if (currentQuestionIndex < content.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (content.reward) {
        setShowReward(true);
      } else {
        const finalScore = Math.round((score / content.questions.length) * 100);
        onComplete(finalScore);
      }
    }
  };

  const handleFinish = () => {
    const finalScore = Math.round((score / content.questions.length) * 100);
    onComplete(finalScore);
  };

  if (showReward && content.reward) {
    return (
      <View style={styles.container}>
        <View style={styles.rewardContainer}>
          <View style={styles.mascotContainer}>
            <LioMascot state="happy" size={150} />
          </View>
          <Text style={styles.rewardTitle}>Fantastic!</Text>
          <Text style={styles.rewardText}>{content.reward.text}</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardBadgeText}>{content.reward.reward}</Text>
          </View>
          <Text style={styles.scoreText}>
            You got {score} out of {content.questions.length} correct!
          </Text>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Continue Journey</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showingIntro && content.intro) {
    return (
      <View style={styles.container}>
        <View style={styles.introContainer}>
          <View style={styles.mascotContainer}>
            <LioMascot state="standing" size={150} />
          </View>
          <Text style={styles.introText}>{content.intro.text}</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showingQuestion && currentQuestion) {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestionIndex + 1) / content.questions.length) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {content.questions.length}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrectOption;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected && !showFeedback && styles.optionButtonSelected,
                      showCorrect && styles.optionButtonCorrect,
                      showIncorrect && styles.optionButtonIncorrect,
                    ]}
                    onPress={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && !showFeedback && styles.optionTextSelected,
                        (showCorrect || showIncorrect) && styles.optionTextFeedback,
                      ]}
                    >
                      {option}
                    </Text>
                    {showCorrect && (
                      <View style={styles.iconContainer}>
                        <Check size={24} color={Colors.white} />
                      </View>
                    )}
                    {showIncorrect && (
                      <View style={styles.iconContainer}>
                        <X size={24} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {showFeedback && currentQuestion.feedback && (
              <View style={[styles.feedbackContainer, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
                <Text style={styles.feedbackText}>{currentQuestion.feedback}</Text>
              </View>
            )}

            {showFeedback && (
              <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
                <Text style={styles.nextButtonText}>
                  {currentQuestionIndex < content.questions.length - 1 ? 'Next Question' : 'See Results'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  mascotContainer: {
    marginBottom: Spacing.xl,
  },
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
  questionContainer: {
    gap: Spacing.lg,
  },
  questionText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    lineHeight: 32,
    marginBottom: Spacing.md,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
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
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.gray[50],
  },
  optionButtonCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  optionButtonIncorrect: {
    borderColor: Colors.error,
    backgroundColor: Colors.error,
  },
  optionText: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[800],
    flex: 1,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  optionTextFeedback: {
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  iconContainer: {
    marginLeft: Spacing.sm,
  },
  feedbackContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  feedbackCorrect: {
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  feedbackIncorrect: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
  },
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
    marginTop: Spacing.md,
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
