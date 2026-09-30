import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Screen} from '../../components/Screen';
import {SegmentedControl} from '../../components/SegmentedControl';
import {TextField} from '../../components/TextField';
import {PrimaryButton} from '../../components/PrimaryButton';
import {ReceiptPicker} from '../../components/ReceiptPicker';
import {useAppData} from '../../store/AppDataContext';
import {colors, radius, spacing} from '../../theme';
import {isValidISODate, todayISO, yesterdayISO} from '../../utils/format';
import type {RootStackParamList} from '../../navigation/types';
import type {TransactionType} from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export function AddTransactionScreen({navigation, route}: Props) {
  const {categories, addTransaction} = useAppData();
  const [type, setType] = useState<TransactionType>(
    route.params?.type ?? 'income',
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dateChoice, setDateChoice] = useState<
    'today' | 'yesterday' | 'custom'
  >('today');
  const [customDate, setCustomDate] = useState(todayISO());
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const relevantCategories = useMemo(
    () => categories.filter(c => c.type === type),
    [categories, type],
  );

  const activeCategoryId = categoryId ?? relevantCategories[0]?.id ?? null;

  const resolvedDate =
    dateChoice === 'today'
      ? todayISO()
      : dateChoice === 'yesterday'
      ? yesterdayISO()
      : customDate;

  const handleSave = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }
    if (!activeCategoryId) {
      Alert.alert('Pick a category', 'Choose a category for this transaction.');
      return;
    }
    if (dateChoice === 'custom' && !isValidISODate(customDate)) {
      Alert.alert('Invalid date', 'Use the format YYYY-MM-DD.');
      return;
    }

    setSaving(true);
    try {
      await addTransaction({
        type,
        amount: numericAmount,
        categoryId: activeCategoryId,
        note: note.trim() || undefined,
        photoUri,
        date: resolvedDate,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <SegmentedControl
        options={[
          {label: 'Income', value: 'income'},
          {label: 'Expense', value: 'expense'},
        ]}
        value={type}
        onChange={next => {
          setType(next);
          setCategoryId(null);
        }}
      />

      <TextField
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {relevantCategories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              activeCategoryId === cat.id && {
                backgroundColor: cat.color,
                borderColor: cat.color,
              },
            ]}
            onPress={() => setCategoryId(cat.id)}>
            <Text
              style={[
                styles.chipLabel,
                activeCategoryId === cat.id && styles.chipLabelActive,
              ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Date</Text>
      <SegmentedControl
        options={[
          {label: 'Today', value: 'today'},
          {label: 'Yesterday', value: 'yesterday'},
          {label: 'Custom', value: 'custom'},
        ]}
        value={dateChoice}
        onChange={setDateChoice}
      />
      {dateChoice === 'custom' && (
        <TextField
          label="Custom date (YYYY-MM-DD)"
          value={customDate}
          onChangeText={setCustomDate}
          placeholder="2026-09-30"
        />
      )}

      <TextField
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Sold 3 bags of rice"
        multiline
      />

      <ReceiptPicker photoUri={photoUri} onChange={setPhotoUri} />

      <PrimaryButton
        label="Save transaction"
        onPress={handleSave}
        loading={saving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  chipLabel: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  chipLabelActive: {
    color: '#fff',
  },
});
