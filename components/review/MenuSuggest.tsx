'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Checkbox,
  Collapse,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ApplicationInfo, SubsidyMenu } from '@/types';
import { suggestMenus, MenuSuggestion } from '@/lib/logic/suggest';
import { allMenus } from '@/lib/data/menus';

interface MenuSuggestProps {
  applicationData: ApplicationInfo;
  onMenusSelected: (menuIds: string[]) => void;
}

export default function MenuSuggest({ applicationData, onMenusSelected }: MenuSuggestProps) {
  const [suggestions, setSuggestions] = useState<MenuSuggestion[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [showAllMenus, setShowAllMenus] = useState(false);

  useEffect(() => {
    // サジェスト実行
    const allText = `${applicationData.name} ${applicationData.purpose} ${applicationData.content} ${applicationData.structure}`;
    const results = suggestMenus(allText, applicationData.desiredMenuId);
    setSuggestions(results);

    // 希望メニューがある場合は自動選択
    if (applicationData.desiredMenuId) {
      setSelectedMenuIds([applicationData.desiredMenuId]);
    }
  }, [applicationData]);

  const handleToggle = (menuId: string) => {
    setSelectedMenuIds(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleSubmit = () => {
    if (selectedMenuIds.length > 0) {
      onMenusSelected(selectedMenuIds);
    }
  };

  const renderMenuCard = (suggestion: MenuSuggestion) => {
    const { menu, score, matchedKeywords, isDesired } = suggestion;
    const isSelected = selectedMenuIds.includes(menu.id);

    return (
      <Card
        key={menu.id}
        sx={{
          mb: 1.5,
          cursor: 'pointer',
          border: 2,
          borderColor: isSelected ? 'primary.main' : 'divider',
          bgcolor: isSelected ? 'rgba(27, 94, 32, 0.03)' : 'background.paper',
          position: 'relative',
          transition: 'all 0.15s',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 2,
          },
        }}
        onClick={() => handleToggle(menu.id)}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
            <Checkbox
              checked={isSelected}
              sx={{ p: 0, mt: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              onChange={() => handleToggle(menu.id)}
            />

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={menu.code}
                  size="small"
                  sx={{
                    bgcolor: menu.isEmergency ? 'warning.main' : 'primary.dark',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {menu.name}
                </Typography>
                {isDesired && (
                  <Chip
                    label="申請者希望"
                    size="small"
                    color="info"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {menu.purpose}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`補助率 ${menu.subsidyRate}`}
                  size="small"
                  sx={{
                    bgcolor: menu.subsidyRate === '2/3' ? 'success.light' : 'info.light',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
                {!isDesired && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      マッチ度: {score}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {matchedKeywords.slice(0, 5).map((keyword, idx) => (
                        <Chip
                          key={idx}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '10px', height: 20 }}
                        />
                      ))}
                      {matchedKeywords.length > 5 && (
                        <Chip
                          label={`+${matchedKeywords.length - 5}個`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '10px', height: 20 }}
                        />
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 1.5, borderBottom: 2, borderColor: 'primary.main' }}>
          <Typography variant="h2" sx={{ color: 'primary.dark' }}>
            メニュー候補の選択
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          入力内容から該当しそうなメニューを抽出しました。審査するメニューを1つ以上選択してください。
        </Typography>

        {suggestions.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            キーワードにマッチするメニューが見つかりませんでした。下記の「すべてのメニューから選択」を展開して手動で選択してください。
          </Alert>
        )}

        {suggestions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
              サジェスト候補 ({suggestions.length}件)
            </Typography>
            {suggestions.map(renderMenuCard)}
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowAllMenus(!showAllMenus)}
            endIcon={showAllMenus ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            すべてのメニューから選択 ({allMenus.length}件)
          </Button>

          <Collapse in={showAllMenus}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'primary.dark' }}>
                政策促進事業（補助率 2/3）
              </Typography>
              {allMenus
                .filter(m => m.category === 'policy')
                .map(menu => renderMenuCard({
                  menu,
                  score: 0,
                  matchedKeywords: [],
                  isDesired: menu.id === applicationData.desiredMenuId,
                }))}

              <Typography variant="body2" sx={{ mb: 1, mt: 2, fontWeight: 500, color: 'primary.dark' }}>
                一般的対策事業（補助率 1/2）
              </Typography>
              {allMenus
                .filter(m => m.category === 'general' && !m.isEmergency)
                .map(menu => renderMenuCard({
                  menu,
                  score: 0,
                  matchedKeywords: [],
                  isDesired: menu.id === applicationData.desiredMenuId,
                }))}

              <Typography variant="body2" sx={{ mb: 1, mt: 2, fontWeight: 500, color: 'warning.main' }}>
                緊急的・重点的メニュー（補助率 2/3）
              </Typography>
              {allMenus
                .filter(m => m.isEmergency)
                .map(menu => renderMenuCard({
                  menu,
                  score: 0,
                  matchedKeywords: [],
                  isDesired: menu.id === applicationData.desiredMenuId,
                }))}
            </Box>
          </Collapse>
        </Box>

        {selectedMenuIds.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {selectedMenuIds.length}件のメニューが選択されています
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={selectedMenuIds.length === 0}
          >
            審査を開始（{selectedMenuIds.length}件）
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
