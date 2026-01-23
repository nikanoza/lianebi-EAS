import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Smile,
  Cat,
  Square,
  Layers,
  Maximize,
  FileText,
  X,
  Check,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  ZoomOut,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// 1. TYPES
type BilingualText = string | { en: string; ka: string };

type Item = {
  id: string;
  name: BilingualText;
  safe: boolean;
  icon: string;
};

type Props = {
  content: {
    instructions: BilingualText;
    items: Item[];
  };
  onComplete: (score: number) => void;
};

// 2. ICON MAPPER (Smaller size for mobile)
const getIcon = (name: string, color: string) => {
  const size = 28; // Reduced from 32 to 28 for mobile
  switch (name) {
    case 'smile':
      return <Smile size={size} color={color} />;
    case 'cat':
      return <Cat size={size} color={color} />;
    case 'square':
      return <Square size={size} color={color} />;
    case 'layers':
      return <Layers size={size} color={color} />;
    case 'maximize':
      return <Maximize size={size} color={color} />;
    case 'file-text':
      return <FileText size={size} color={color} />;
    default:
      return <Square size={size} color={color} />;
  }
};

// 3. SINGLE ITEM COMPONENT
const CribItem = ({ item, onPress, getText }: any) => {
  const offset = useSharedValue(0);

  const handlePress = () => {
    if (item.safe) {
      // Shake animation for safe items
      offset.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
    onPress(item);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn}
      exiting={ZoomOut}
      style={styles.itemWrapper}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[styles.item, item.safe ? styles.itemSafe : styles.itemUnsafe]}
      >
        <Animated.View style={animatedStyle}>
          {getIcon(item.icon, item.safe ? Colors.primary : '#D62828')}
        </Animated.View>
        <Text style={styles.itemText} numberOfLines={2}>
          {getText(item.name)}
        </Text>
        {!item.safe && (
          <View style={styles.removeIcon}>
            <X size={10} color={Colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// 4. MAIN GAME
export default function DragDropGame({ content, onComplete }: Props) {
  const { t } = useLanguage();
  const [activeItems, setActiveItems] = useState<Item[]>(content.items);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const getText = (text: BilingualText | undefined) => {
    if (!text) return '';
    return typeof text === 'object' ? t(text) : text;
  };

  const handleRemoveItem = (item: Item) => {
    if (item.safe) {
      setFeedback(
        t({ en: "Keep this! It's safe.", ka: 'დატოვეთ! ეს უსაფრთხოა.' }),
      );
      setTimeout(() => setFeedback(null), 1500);
    } else {
      setFeedback(null);
      setActiveItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  useEffect(() => {
    const unsafeRemaining = activeItems.filter((i) => !i.safe).length;
    if (unsafeRemaining === 0 && !isComplete) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete(100);
      }, 1500);
    }
  }, [activeItems]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.instructions}>{getText(content.instructions)}</Text>

        {feedback ? (
          <Text
            style={[
              styles.subInstructions,
              { color: Colors.error, fontWeight: 'bold' },
            ]}
          >
            {feedback}
          </Text>
        ) : (
          <Text style={styles.subInstructions}>
            {t({
              en: 'Tap unsafe items to remove',
              ka: 'შეეხეთ სახიფათო ნივთებს',
            })}
          </Text>
        )}
      </View>

      <View style={styles.cribContainer}>
        {/* Crib Box */}
        <View style={styles.crib}>
          <View style={styles.mattress}>
            {activeItems.map((item) => (
              <CribItem
                key={item.id}
                item={item}
                onPress={handleRemoveItem}
                getText={getText}
              />
            ))}

            {isComplete && (
              <Animated.View entering={FadeIn} style={styles.safeMessage}>
                <Check size={40} color={Colors.success} />
                <Text style={styles.safeText}>
                  {t({ en: 'Safe Sleep Zone!', ka: 'უსაფრთხო ზონა!' })}
                </Text>
              </Animated.View>
            )}
          </View>
        </View>
        <Text style={styles.cribLabel}>
          {t({ en: "Baby's Crib", ka: 'ჩვილის საწოლი' })}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          {t({ en: 'Unsafe items left: ', ka: 'დარჩენილი საფრთხეები: ' })}
          {activeItems.filter((i) => !i.safe).length}
        </Text>
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
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    minHeight: 60,
  },
  instructions: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    textAlign: 'center',
  },
  subInstructions: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  cribContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // --- RESPONSIVE CRIB SIZE ---
  crib: {
    width: '100%',
    maxWidth: 340, // Fits nicely on mobile
    aspectRatio: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: BorderRadius.xl,
    borderWidth: 6,
    borderColor: '#D4A373',
    padding: Spacing.sm,
    ...Shadow.medium,
  },
  mattress: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    overflow: 'hidden',
  },
  cribLabel: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: '#D4A373',
  },
  itemWrapper: {
    margin: 4,
  },
  // --- RESPONSIVE ITEM SIZE ---
  item: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: 2,
    ...Shadow.small,
  },
  itemSafe: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  itemUnsafe: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  itemText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.gray[700],
    textAlign: 'center',
    lineHeight: 11,
  },
  removeIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 8,
    padding: 2,
  },
  safeMessage: {
    position: 'absolute',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    zIndex: 10,
    ...Shadow.medium,
  },
  safeText: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.success,
  },
  footer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  hint: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    fontWeight: 'medium',
  },
});
