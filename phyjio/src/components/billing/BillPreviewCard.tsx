import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { formatDate, formatTime, formatDuration } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatUtils';

interface BillPreviewCardProps {
  text: string;
}

export default function BillPreviewCard({ text }: BillPreviewCardProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.monospace} selectable>
        {text}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    padding: Spacing.base,
  },
  monospace: {
    fontFamily: 'Courier New',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
});
