import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Screen} from '../../components/Screen';
import {SegmentedControl} from '../../components/SegmentedControl';
import {EmptyState} from '../../components/EmptyState';
import {PrimaryButton} from '../../components/PrimaryButton';
import {useAppData} from '../../store/AppDataContext';
import {useRootNavigation} from '../../navigation/hooks';
import {colors, spacing} from '../../theme';
import {formatMoney} from '../../utils/format';
import type {Transaction} from '../../types/models';

type Filter = 'all' | 'income' | 'expense';

export function TransactionsScreen() {
  const navigation = useRootNavigation();
  const {transactions, categories, settings, removeTransaction} = useAppData();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);

  const categoryName = (id: string) =>
    categories.find(c => c.id === id)?.name ?? 'Uncategorized';

  const confirmDelete = (transaction: Transaction) => {
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeTransaction(transaction.id),
      },
    ]);
  };

  return (
    <Screen scroll={false} style={styles.body}>
      <View style={styles.header}>
        <SegmentedControl
          options={[
            {label: 'All', value: 'all'},
            {label: 'Income', value: 'income'},
            {label: 'Expense', value: 'expense'},
          ]}
          value={filter}
          onChange={setFilter}
        />
        <PrimaryButton
          label="+ Add Transaction"
          onPress={() => navigation.navigate('AddTransaction')}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="Nothing here yet"
            subtitle="Transactions you add will show up in this list."
          />
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.row}
            onLongPress={() => confirmDelete(item)}
            activeOpacity={0.7}>
            <View style={styles.flexShrink}>
              <Text style={styles.category}>
                {categoryName(item.categoryId)}
                {item.photoUri ? ' 📎' : ''}
              </Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    item.type === 'income' ? colors.income : colors.expense,
                },
              ]}>
              {item.type === 'income' ? '+' : '-'}
              {formatMoney(item.amount, settings.currencySymbol)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 0,
  },
  header: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  flexShrink: {
    flexShrink: 1,
    paddingRight: spacing.sm,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  note: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
