'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Button,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import { SubsidyMenu, Verdict } from '@/types';
import { getMenuById } from '@/lib/data/menus';
import { judgeRequirements } from '@/lib/logic/judgement';
import { calculateSubsidy } from '@/lib/logic/calculator';
import { MenuCheckData } from './RequirementChecklist';
import { ExpenseState } from './ExpenseChecker';

interface ResultViewProps {
  menuIds: string[];
  checkStates: Record<string, MenuCheckData>;
  expenseStates: Record<string, ExpenseState>;
}

export default function ResultView({
  menuIds,
  checkStates,
  expenseStates,
}: ResultViewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const menus = menuIds.map(id => getMenuById(id)).filter(Boolean) as SubsidyMenu[];
  const currentMenu = menus[activeTab];

  if (!currentMenu) {
    return <Alert severity="error">メニュー情報が見つかりません</Alert>;
  }

  const checkState = checkStates[currentMenu.id] || { requirementResults: {}, requirementNotes: {} };
  const expenseState = expenseStates[currentMenu.id] || { expenses: {}, deductions: 0, unitCounts: {} };

  const judgement = judgeRequirements(currentMenu, checkState.requirementResults);
  const calculation = calculateSubsidy(
    currentMenu,
    expenseState.expenses,
    expenseState.deductions,
    expenseState.unitCounts
  );

  const getVerdictIcon = (verdict: Verdict) => {
    switch (verdict) {
      case 'ok':
        return <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />;
      case 'warn':
        return <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
      case 'ng':
        return <CancelIcon sx={{ fontSize: 48, color: 'error.main' }} />;
    }
  };

  const getVerdictLabel = (verdict: Verdict) => {
    switch (verdict) {
      case 'ok':
        return '◯ 補助対象として認められる';
      case 'warn':
        return '△ 要確認';
      case 'ng':
        return '✕ 補助対象として認められない';
    }
  };

  const getVerdictColor = (verdict: Verdict) => {
    switch (verdict) {
      case 'ok':
        return 'success.main';
      case 'warn':
        return 'warning.main';
      case 'ng':
        return 'error.main';
    }
  };

  const generateMarkdown = () => {
    const lines: string[] = [];

    lines.push('# 補助金審査所見');
    lines.push('');
    lines.push(`## メニュー: ${currentMenu.code} ${currentMenu.name}`);
    lines.push('');
    lines.push(`**補助率**: ${currentMenu.subsidyRate}`);
    lines.push('');

    lines.push('## 総合判定');
    lines.push('');
    lines.push(`**${getVerdictLabel(judgement.verdict)}**`);
    lines.push('');

    if (judgement.reasons.length > 0) {
      lines.push('### 判定理由');
      lines.push('');
      judgement.reasons.forEach(reason => {
        lines.push(`- ${reason}`);
      });
      lines.push('');
    }

    if (judgement.missingInfo.length > 0) {
      lines.push('### 不足情報・追加確認事項');
      lines.push('');
      judgement.missingInfo.forEach(info => {
        lines.push(`- ${info}`);
      });
      lines.push('');
    }

    lines.push('## 経費・補助金額');
    lines.push('');
    lines.push(`- 補助対象経費合計: ${calculation.totalEligibleExpense.toLocaleString()}円`);
    lines.push(`- 控除後額: ${calculation.amountAfterDeduction.toLocaleString()}円`);
    lines.push(`- 補助率適用後額: ${Math.floor(calculation.amountBeforeCeil).toLocaleString()}円`);
    lines.push(`- **最終交付額（千円未満切捨）: ${calculation.finalSubsidyAmount.toLocaleString()}円**`);
    lines.push('');

    if (calculation.expenseWarnings.length > 0) {
      lines.push('### 経費に関する注意事項');
      lines.push('');
      calculation.expenseWarnings.forEach(warning => {
        lines.push(`- ⚠️ ${warning}`);
      });
      lines.push('');
    }

    lines.push('## 根拠');
    lines.push('');
    lines.push(`- 実施要綱: ${currentMenu.sourceRefs.youkou}`);
    lines.push(`- 事業方針: ${currentMenu.sourceRefs.houshin}`);
    lines.push('');

    lines.push('---');
    lines.push('');
    lines.push('*本所見は審査支援アプリによる一次判定です。最終判断は審査担当者が行ってください。*');

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const markdown = generateMarkdown();
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました', err);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 1.5, borderBottom: 2, borderColor: 'primary.main' }}>
          <Typography variant="h2" sx={{ color: 'primary.dark' }}>
            判定結果
          </Typography>
        </Box>

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

        {/* 総合判定バッジ */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            mb: 3,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: 2,
            borderColor: getVerdictColor(judgement.verdict),
          }}
        >
          {getVerdictIcon(judgement.verdict)}
          <Typography
            variant="h4"
            sx={{
              mt: 2,
              fontWeight: 700,
              color: getVerdictColor(judgement.verdict),
            }}
          >
            {getVerdictLabel(judgement.verdict)}
          </Typography>
        </Box>

        {/* メニュー情報 */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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

        {/* 判定理由 */}
        {judgement.reasons.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600, mb: 1.5 }}>
              判定理由
            </Typography>
            {judgement.reasons.map((reason, idx) => (
              <Alert key={idx} severity="info" sx={{ mb: 1 }}>
                {reason}
              </Alert>
            ))}
          </Box>
        )}

        {/* 不足情報 */}
        {judgement.missingInfo.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600, mb: 1.5 }}>
              不足情報・追加確認事項
            </Typography>
            <Alert severity="warning">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {judgement.missingInfo.map((info, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{info}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* 経費・補助金額 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600, mb: 1.5 }}>
            経費・補助金額
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">補助対象経費合計</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {calculation.totalEligibleExpense.toLocaleString()}円
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">控除後額</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {calculation.amountAfterDeduction.toLocaleString()}円
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">補助率適用後額（{currentMenu.subsidyRate}）</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Math.floor(calculation.amountBeforeCeil).toLocaleString()}円
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                最終交付額（千円未満切捨）
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {calculation.finalSubsidyAmount.toLocaleString()}円
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 経費警告 */}
        {calculation.expenseWarnings.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              経費に関する注意事項
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

        {/* 根拠 */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'info.dark' }}>
            根拠
          </Typography>
          <Typography variant="body2" sx={{ color: 'info.dark' }}>
            • 実施要綱: {currentMenu.sourceRefs.youkou}
          </Typography>
          <Typography variant="body2" sx={{ color: 'info.dark' }}>
            • 事業方針: {currentMenu.sourceRefs.houshin}
          </Typography>
        </Box>

        {/* Markdown出力 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600 }}>
              所見（Markdown形式）
            </Typography>
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
              color={copySuccess ? 'success' : 'primary'}
            >
              {copySuccess ? 'コピー完了！' : 'コピー'}
            </Button>
          </Box>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'grey.900',
              color: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: 'monospace',
              maxHeight: 400,
            }}
          >
            {generateMarkdown()}
          </Box>
        </Box>

        <Alert severity="info">
          本所見は審査支援アプリによる一次判定です。最終判断は審査担当者が行ってください。
        </Alert>
      </CardContent>
    </Card>
  );
}
