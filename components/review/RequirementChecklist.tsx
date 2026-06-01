'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Chip,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { SubsidyMenu, CheckResult, Requirement, RequirementGroup } from '@/types';
import { getMenuById } from '@/lib/data/menus';

interface RequirementChecklistProps {
  menuIds: string[];
  checkStates: Record<string, MenuCheckData>;
  onCheckStatesChange: (states: Record<string, MenuCheckData>) => void;
}

export interface MenuCheckData {
  requirementResults: Record<string, CheckResult>;
  requirementNotes: Record<string, string>;
}

export default function RequirementChecklist({
  menuIds,
  checkStates,
  onCheckStatesChange,
}: RequirementChecklistProps) {
  const [activeTab, setActiveTab] = useState(0);
  const menus = menuIds.map(id => getMenuById(id)).filter(Boolean) as SubsidyMenu[];
  const currentMenu = menus[activeTab];

  const handleResultChange = (menuId: string, requirementId: string, result: CheckResult) => {
    const currentState = checkStates[menuId] || { requirementResults: {}, requirementNotes: {} };
    const newStates = {
      ...checkStates,
      [menuId]: {
        ...currentState,
        requirementResults: {
          ...currentState.requirementResults,
          [requirementId]: result,
        },
      },
    };
    onCheckStatesChange(newStates);
  };

  const handleNoteChange = (menuId: string, requirementId: string, note: string) => {
    const currentState = checkStates[menuId] || { requirementResults: {}, requirementNotes: {} };
    const newStates = {
      ...checkStates,
      [menuId]: {
        ...currentState,
        requirementNotes: {
          ...currentState.requirementNotes,
          [requirementId]: note,
        },
      },
    };
    onCheckStatesChange(newStates);
  };

  const renderRequirement = (req: Requirement, menuId: string) => {
    const currentState = checkStates[menuId] || { requirementResults: {}, requirementNotes: {} };
    const result = currentState.requirementResults[req.id];
    const note = currentState.requirementNotes[req.id] || '';

    return (
      <Box key={req.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <Chip
            label={req.code}
            size="small"
            sx={{
              bgcolor: 'primary.light',
              color: 'white',
              fontWeight: 700,
              fontSize: '11px',
              minWidth: 60,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
              {req.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.65 }}>
              {req.description}
            </Typography>

            <RadioGroup
              row
              value={result || ''}
              onChange={(e) => handleResultChange(menuId, req.id, e.target.value as CheckResult)}
              sx={{ mb: 1.5 }}
            >
              <FormControlLabel
                value="ok"
                control={<Radio size="small" />}
                label="満たす"
                sx={{
                  mr: 2,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '14px',
                  },
                }}
              />
              <FormControlLabel
                value="ng"
                control={<Radio size="small" />}
                label="満たさない"
                sx={{
                  mr: 2,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '14px',
                  },
                }}
              />
              <FormControlLabel
                value="unknown"
                control={<Radio size="small" />}
                label="不明"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '14px',
                  },
                }}
              />
            </RadioGroup>

            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="担当者メモ（任意）"
              value={note}
              onChange={(e) => handleNoteChange(menuId, req.id, e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }}
            />
          </Box>
        </Box>
      </Box>
    );
  };

  const renderRequirementGroup = (group: RequirementGroup, menuId: string) => {
    const logicLabel = group.logic === 'all' ? '全て必須' : 'いずれか1つ以上';
    const logicColor = group.logic === 'all' ? 'secondary.main' : 'info.main';

    return (
      <Box key={group.id} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 1, borderBottom: 2, borderColor: 'primary.main' }}>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 700, color: 'primary.dark' }}>
            {group.label}
          </Typography>
          <Chip
            label={logicLabel}
            size="small"
            sx={{
              bgcolor: logicColor,
              color: 'white',
              fontWeight: 700,
              fontSize: '10px',
              height: 22,
            }}
          />
        </Box>

        {group.requirements.map(req => renderRequirement(req, menuId))}
      </Box>
    );
  };

  if (!currentMenu) {
    return (
      <Alert severity="error">
        メニュー情報が見つかりません
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 1.5, borderBottom: 2, borderColor: 'primary.main' }}>
          <Typography variant="h2" sx={{ color: 'primary.dark' }}>
            要件チェック
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          選択されたメニューの要件に対して、適合性を確認してください。
        </Typography>

        {menus.length > 1 && (
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            {menus.map((menu, idx) => (
              <Tab
                key={menu.id}
                label={`${menu.code} ${menu.name}`}
                sx={{ fontSize: '13px', textTransform: 'none' }}
              />
            ))}
          </Tabs>
        )}

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
          <Typography variant="body2" color="text.secondary">
            {currentMenu.purpose}
          </Typography>
        </Box>

        {/* 核心要件（ア） */}
        {currentMenu.requirementGroups.map(group => renderRequirementGroup(group, currentMenu.id))}

        {/* 共通要件（イ・ウ） */}
        {currentMenu.commonRequirements.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ p: 2, bgcolor: '#FFFBF0', border: 1, borderColor: '#FFB74D', borderRadius: 1, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 700, color: '#E65100' }}>
                  共通要件（全て必須）
                </Typography>
                <Chip
                  label="全て必須"
                  size="small"
                  sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 700, fontSize: '10px' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                効果検証、周知・普及啓発、事業の広域化など
              </Typography>
              {currentMenu.commonRequirements.map(req => renderRequirement(req, currentMenu.id))}
            </Box>
          </>
        )}

        {/* 追加条件 */}
        {currentMenu.conditions.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              追加条件・留意事項
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {currentMenu.conditions.map((condition, idx) => (
                <li key={idx}>
                  <Typography variant="body2">{condition}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* 留意事項 */}
        {currentMenu.notes.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              留意事項
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {currentMenu.notes.map((note, idx) => (
                <li key={idx}>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>{note}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* 出典情報 */}
        <Box sx={{ mt: 3, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>出典：</strong> {currentMenu.sourceRefs.youkou} / {currentMenu.sourceRefs.houshin}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
