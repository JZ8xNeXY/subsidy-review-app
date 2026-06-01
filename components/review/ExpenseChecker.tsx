'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Tabs,
  Tab,
  Divider,
  Paper,
} from '@mui/material';
import { SubsidyMenu, ExpenseCategory, ALL_EXPENSE_CATEGORIES } from '@/types';
import { getMenuById } from '@/lib/data/menus';
import { calculateSubsidy, CalculationResult } from '@/lib/logic/calculator';

interface ExpenseCheckerProps {
  menuIds: string[];
  expenseStates: Record<string, ExpenseState>;
  onExpenseStatesChange: (states: Record<string, ExpenseState>) => void;
}

export interface ExpenseState {
  expenses: Partial<Record<ExpenseCategory, number>>;
  deductions: number;
  unitCounts: Record<string, number>;
}

export default function ExpenseChecker({
  menuIds,
  expenseStates,
  onExpenseStatesChange,
}: ExpenseCheckerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const menus = menuIds.map(id => getMenuById(id)).filter(Boolean) as SubsidyMenu[];
  const currentMenu = menus[activeTab];

  const handleExpenseChange = (menuId: string, category: ExpenseCategory, value: string) => {
    const amount = value ? parseInt(value.replace(/,/g, '')) : 0;
    const currentState = expenseStates[menuId] || { expenses: {}, deductions: 0, unitCounts: {} };
    const newStates = {
      ...expenseStates,
      [menuId]: {
        ...currentState,
        expenses: {
          ...currentState.expenses,
          [category]: amount,
        },
      },
    };
    onExpenseStatesChange(newStates);
  };

  const handleDeductionChange = (menuId: string, value: string) => {
    const amount = value ? parseInt(value.replace(/,/g, '')) : 0;
    const currentState = expenseStates[menuId] || { expenses: {}, deductions: 0, unitCounts: {} };
    const newStates = {
      ...expenseStates,
      [menuId]: {
        ...currentState,
        deductions: amount,
      },
    };
    onExpenseStatesChange(newStates);
  };

  const handleUnitCountChange = (menuId: string, scope: string, value: string) => {
    const count = value ? parseInt(value) : 0;
    const currentState = expenseStates[menuId] || { expenses: {}, deductions: 0, unitCounts: {} };
    const newStates = {
      ...expenseStates,
      [menuId]: {
        ...currentState,
        unitCounts: {
          ...currentState.unitCounts,
          [scope]: count,
        },
      },
    };
    onExpenseStatesChange(newStates);
  };

  if (!currentMenu) {
    return <Alert severity="error">メニュー情報が見つかりません</Alert>;
  }

  const currentState = expenseStates[currentMenu.id] || {
    expenses: {},
    deductions: 0,
    unitCounts: {},
  };

  const calculation = calculateSubsidy(
    currentMenu,
    currentState.expenses,
    currentState.deductions,
    currentState.unitCounts
  );

  const formatCurrency = (amount: number) => amount.toLocaleString() + '円';

  const isIneligible = (category: ExpenseCategory) => {
    return currentMenu.ineligibleExpenses.some(ie => ie.category === category);
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 1.5, borderBottom: 2, borderColor: 'primary.main' }}>
          <Typography variant="h2" sx={{ color: 'primary.dark' }}>
            経費チェック
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          補助対象経費と控除額を入力してください。補助金額を自動計算します。
        </Typography>

        {menus.length > 1 && (
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            {menus.map((menu) => (
              <Tab
                key={menu.id}
                label={`${menu.code} ${menu.name}`}
                sx={{ fontSize: '13px', textTransform: 'none' }}
              />
            ))}
          </Tabs>
        )}

        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={currentMenu.code}
              size="small"
              sx={{
                bgcolor: currentMenu.isEmergency ? 'warning.main' : 'primary.dark',
                color: 'white',
                fontWeight: 700,
              }}
            />
            <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600 }}>
              {currentMenu.name}
            </Typography>
            <Chip
              label={`補助率 ${currentMenu.subsidyRate}`}
              size="small"
              color={currentMenu.subsidyRate === '2/3' ? 'success' : 'info'}
              sx={{ ml: 'auto' }}
            />
          </Box>
        </Box>

        {/* 上限額情報 */}
        {currentMenu.upperLimits.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              上限額
            </Typography>
            {currentMenu.upperLimits.map((limit, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {limit.scope}: <strong>{limit.amount.toLocaleString()}千円</strong> {limit.unit}
                </Typography>
                {(limit.unit.includes('千円/台') || limit.unit.includes('千円/件')) && (
                  <TextField
                    size="small"
                    type="number"
                    label={`${limit.scope}の数量`}
                    value={currentState.unitCounts[limit.scope] || ''}
                    onChange={(e) => handleUnitCountChange(currentMenu.id, limit.scope, e.target.value)}
                    sx={{ mt: 1, width: 200 }}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                )}
              </Box>
            ))}
          </Alert>
        )}

        {/* 経費入力テーブル */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600, width: '40%' }}>科目</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '30%' }}>金額（円）</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '30%' }}>状態</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ALL_EXPENSE_CATEGORIES.map((category) => {
                const ineligible = isIneligible(category);
                const amount = currentState.expenses[category] || 0;
                const hasWarning = ineligible && amount > 0;

                return (
                  <TableRow
                    key={category}
                    sx={{
                      bgcolor: hasWarning ? '#FFEBEE' : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: hasWarning ? 600 : 400,
                          color: hasWarning ? 'error.main' : 'text.primary',
                        }}
                      >
                        {category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={currentState.expenses[category] || ''}
                        onChange={(e) => handleExpenseChange(currentMenu.id, category, e.target.value)}
                        fullWidth
                        slotProps={{ htmlInput: { min: 0, step: 1000 } }}
                        error={hasWarning}
                      />
                    </TableCell>
                    <TableCell>
                      {currentMenu.eligibleExpenses.includes(category) ? (
                        <Chip label="対象" size="small" color="success" />
                      ) : (
                        <Chip label="対象外" size="small" color="error" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 対象外経費の警告 */}
        {calculation.expenseWarnings.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              補助対象外の経費が入力されています
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {calculation.expenseWarnings.map((warning, idx) => (
                <li key={idx}>
                  <Typography variant="body2">{warning}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* 控除額入力 */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            国等補助金・寄附金等の控除額
          </Typography>
          <TextField
            size="small"
            type="number"
            label="控除額（円）"
            value={currentState.deductions || ''}
            onChange={(e) => handleDeductionChange(currentMenu.id, e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 計算結果 */}
        <Box sx={{ p: 3, bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            補助金額計算結果
          </Typography>

          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">補助対象経費合計</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(calculation.totalEligibleExpense)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">控除後額</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(calculation.amountAfterDeduction)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">補助率適用後額（{currentMenu.subsidyRate}）</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(Math.floor(calculation.amountBeforeCeil))}
              </Typography>
            </Box>

            {calculation.upperLimitDetails.map((detail, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">上限額（{detail.scope}）</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatCurrency(detail.limit)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                最終交付額（千円未満切捨）
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formatCurrency(calculation.finalSubsidyAmount)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
