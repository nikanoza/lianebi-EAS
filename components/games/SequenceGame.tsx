import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  LinearTransition,
  FadeInDown,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import { Check, X, ArrowUp, Undo2 } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';

const { width } = Dimensions.get('window');

type Item = {
  id: string;
  text: string;
  image?: string; // If you have local images
  correctIndex: number;
};

type Props = {
  content: {
    instructions: string;
    items: Item[];
  };
  onComplete: (score: number) => void;
};

export default function SequenceGame({ content, onComplete }: Props) {
  // State for the "Pool" (bottom) and "Slots" (top)
  // We shuffle the pool initially
  const [pool, setPool] = useState<Item[]>([]);
  const [slots, setSlots] = useState<(Item | null)[]>([null, null, null, null]);
  const [isChecked, setIsChecked] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize randomized pool
  useEffect(() => {
    const shuffled = [...content.items].sort(() => Math.random() - 0.5);
    setPool(shuffled);
  }, []);

  // Handle tapping an item in the Pool -> Moves to first empty Slot
  const handlePoolTap = (item: Item) => {
    if (isChecked) return; // Locked if checking

    const firstEmptyIndex = slots.findIndex((s) => s === null);
    if (firstEmptyIndex !== -1) {
      // Add to slots
      const newSlots = [...slots];
      newSlots[firstEmptyIndex] = item;
      setSlots(newSlots);

      // Remove from pool
      setPool((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  // Handle tapping an item in a Slot -> Returns to Pool
  const handleSlotTap = (index: number) => {
    if (isChecked) return;
    const item = slots[index];
    if (!item) return;

    // Remove from slots
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);

    // Add back to pool
    setPool((prev) => [...prev, item]);
  };

  // Check the answer
  const handleCheck = () => {
    const isCorrect = slots.every(
      (item, index) => item?.correctIndex === index
    );
    setIsChecked(true);

    if (isCorrect) {
      setIsSuccess(true);
      setTimeout(() => {
        onComplete(100);
      }, 1500);
    } else {
      setIsSuccess(false);
      // Auto-reset after 1.5s so they can try again
      setTimeout(() => {
        setIsChecked(false);
      }, 1500);
    }
  };

  const allSlotsFilled = slots.every((s) => s !== null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.instructionText}>{content.instructions}</Text>
      </View>

      {/* --- SLOTS AREA (Top) --- */}
      <View style={styles.slotsContainer}>
        {slots.map((item, index) => (
          <View key={`slot-${index}`} style={styles.slotWrapper}>
            {/* Slot Label (Step 1, 2...) */}
            <Text style={styles.slotLabel}>Step {index + 1}</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSlotTap(index)}
              style={[
                styles.slot,
                // Change border color based on validation state
                isChecked && item
                  ? item.correctIndex === index
                    ? styles.slotCorrect
                    : styles.slotWrong
                  : null,
              ]}
            >
              {item ? (
                <Animated.View
                  layout={LinearTransition.springify()}
                  entering={ZoomIn}
                  exiting={FadeOut}
                  style={styles.card}
                >
                  <Text style={styles.cardText}>{item.text}</Text>
                  {isChecked && (
                    <View style={styles.iconBadge}>
                      {item.correctIndex === index ? (
                        <Check size={16} color="white" />
                      ) : (
                        <X size={16} color="white" />
                      )}
                    </View>
                  )}
                </Animated.View>
              ) : (
                <View style={styles.emptySlotPlaceholder}>
                  <View style={styles.dashedBorder} />
                  <Text style={styles.emptyText}>Tap to fill</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* --- DIVIDER / ACTION AREA --- */}
      <View style={styles.dividerArea}>
        {allSlotsFilled && !isChecked && (
          <Animated.View entering={FadeInDown}>
            <TouchableOpacity style={styles.checkButton} onPress={handleCheck}>
              <Text style={styles.checkButtonText}>Check Order</Text>
              <ArrowUp size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {isChecked && !isSuccess && (
          <Animated.View entering={FadeInDown}>
            <Text style={styles.errorText}>Incorrect sequence. Try again!</Text>
          </Animated.View>
        )}

        {isChecked && isSuccess && (
          <Animated.View entering={FadeInDown}>
            <Text style={styles.successText}>Perfect Sequence!</Text>
          </Animated.View>
        )}
      </View>

      {/* --- POOL AREA (Bottom) --- */}
      <View style={styles.poolContainer}>
        {pool.length > 0 ? (
          <Text style={styles.poolLabel}>Tap items to place them:</Text>
        ) : (
          <Text style={styles.poolLabel}>All items placed</Text>
        )}

        <View style={styles.poolGrid}>
          {pool.map((item) => (
            <Animated.View
              key={item.id}
              layout={LinearTransition.springify()}
              entering={FadeInDown}
              exiting={FadeOut}
            >
              <TouchableOpacity
                style={styles.poolCard}
                onPress={() => handlePoolTap(item)}
              >
                <Text style={styles.poolCardText}>{item.text}</Text>
                <ArrowUp
                  size={16}
                  color={Colors.primary}
                  style={{ marginTop: 4 }}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    textAlign: 'center',
  },

  // Slots
  slotsContainer: {
    gap: Spacing.sm,
  },
  slotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  slotLabel: {
    width: 60,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[500],
    textAlign: 'right',
  },
  slot: {
    flex: 1,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    padding: 4,
  },
  slotCorrect: {
    backgroundColor: Colors.success + '20', // transparent green
    borderColor: Colors.success,
    borderWidth: 1,
  },
  slotWrong: {
    backgroundColor: Colors.error + '20', // transparent red
    borderColor: Colors.error,
    borderWidth: 1,
  },
  emptySlotPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: Colors.gray[400],
    borderStyle: 'dashed',
    borderRadius: BorderRadius.sm,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray[400],
  },

  // Cards inside slots
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    ...Shadow.small,
  },
  cardText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.gray[800],
  },
  iconBadge: {
    marginLeft: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gray[400], // overridden by container style mostly, just logic dependent
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Divider / Actions
  dividerArea: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  checkButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.medium,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: Typography.weights.bold,
  },
  errorText: {
    color: Colors.error,
    fontWeight: Typography.weights.bold,
  },
  successText: {
    color: Colors.success,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.lg,
  },

  // Pool
  poolContainer: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadow.medium, // subtle top shadow
  },
  poolLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray[500],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  poolGrid: {
    gap: Spacing.sm,
  },
  poolCard: {
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Shadow.small,
  },
  poolCardText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[700],
    flex: 1,
  },
});
