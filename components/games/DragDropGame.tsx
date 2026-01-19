import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';
import { X } from 'lucide-react-native';

type Item = {
  id: string;
  name: string;
  safe: boolean;
};

type Props = {
  content: {
    instructions: string;
    items: Item[];
  };
  onComplete: (score: number) => void;
};

export default function DragDropGame({ content, onComplete }: Props) {
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleRemoveItem = (itemId: string) => {
    setRemovedItems((prev) => [...prev, itemId]);
    setActiveItem(null);
  };
  console.log(1);

  const handleComplete = () => {
    const unsafeItems = content.items.filter((item) => !item.safe);
    const correctlyRemoved = unsafeItems.filter((item) =>
      removedItems.includes(item.id)
    ).length;

    const score = Math.round((correctlyRemoved / unsafeItems.length) * 100);
    onComplete(score);
  };

  const allUnsafeItemsRemoved = content.items
    .filter((item) => !item.safe)
    .every((item) => removedItems.includes(item.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.instructions}>{content.instructions}</Text>
        <Text style={styles.subInstructions}>
          Tap items to remove them from the crib
        </Text>
      </View>

      <View style={styles.cribContainer}>
        <View style={styles.crib}>
          <View style={styles.cribItems}>
            {content.items.map((item) => {
              if (removedItems.includes(item.id)) return null;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.item}
                  onPress={() => handleRemoveItem(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                  <View style={styles.removeIcon}>
                    <X size={16} color={Colors.error} />
                  </View>
                </TouchableOpacity>
              );
            })}

            {removedItems.length === 0 && (
              <Text style={styles.cribLabel}>Baby's Crib</Text>
            )}

            {allUnsafeItemsRemoved && (
              <View style={styles.safeCrib}>
                <Text style={styles.safeCribEmoji}>✅</Text>
                <Text style={styles.safeCribText}>Safe Sleep Environment!</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {removedItems.length > 0 && (
        <View style={styles.removedContainer}>
          <Text style={styles.removedTitle}>Removed Items:</Text>
          <View style={styles.removedItems}>
            {removedItems.map((itemId) => {
              const item = content.items.find((i) => i.id === itemId);
              return (
                <View
                  key={itemId}
                  style={[
                    styles.removedItem,
                    item?.safe === false && styles.removedItemCorrect,
                  ]}
                >
                  <Text style={styles.removedItemText}>{item?.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        {allUnsafeItemsRemoved ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.hint}>Remove all unsafe items to continue</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  instructions: {
    fontSize: Typography.sizes.xl,
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
  },
  crib: {
    width: '100%',
    minHeight: 300,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 4,
    borderColor: Colors.primary,
    padding: Spacing.lg,
    ...Shadow.medium,
  },
  cribItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 250,
  },
  cribLabel: {
    fontSize: Typography.sizes.lg,
    color: Colors.gray[400],
  },
  item: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.small,
  },
  itemText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.white,
  },
  removeIcon: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeCrib: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  safeCribEmoji: {
    fontSize: 64,
  },
  safeCribText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
  removedContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
  },
  removedTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[700],
    marginBottom: Spacing.sm,
  },
  removedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  removedItem: {
    backgroundColor: Colors.gray[200],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  removedItemCorrect: {
    backgroundColor: Colors.success + '30',
  },
  removedItemText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[700],
  },
  footer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadow.medium,
  },
  completeButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  hint: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
  },
});
