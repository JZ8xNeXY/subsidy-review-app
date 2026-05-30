'use client';

import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { ApplicationInfo } from '@/types';
import { allMenus } from '@/lib/data/menus';

interface ApplicationFormProps {
  data: ApplicationInfo;
  onChange: (data: ApplicationInfo) => void;
}

export default function ApplicationForm({ data, onChange }: ApplicationFormProps) {
  const handleChange = (field: keyof ApplicationInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({ ...data, [field]: e.target.value });
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 1.5, borderBottom: 2, borderColor: 'primary.main' }}>
          <Typography variant="h2" sx={{ color: 'primary.dark' }}>
            申請情報入力
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          補助金審査を行う事業の基本情報を入力してください。
        </Typography>

        <Box sx={{ display: 'grid', gap: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <TextField
              label="事業名"
              required
              fullWidth
              value={data.name}
              onChange={handleChange('name')}
              placeholder="例: ○○区カーボンニュートラル推進事業"
            />
            <TextField
              label="申請者名"
              required
              fullWidth
              value={data.applicant}
              onChange={handleChange('applicant')}
              placeholder="例: ○○市"
            />
          </Box>

          <TextField
            label="事業の目的"
            fullWidth
            multiline
            rows={3}
            value={data.purpose}
            onChange={handleChange('purpose')}
            placeholder="この事業で実現したいこと、解決したい地域課題などを記載してください"
          />

          <TextField
            label="取組内容"
            required
            fullWidth
            multiline
            rows={5}
            value={data.content}
            onChange={handleChange('content')}
            placeholder="具体的な取組内容、実施方法、対象者、期待される効果などを記載してください"
          />

          <TextField
            label="実施体制"
            fullWidth
            multiline
            rows={3}
            value={data.structure}
            onChange={handleChange('structure')}
            placeholder="連携先の団体・事業者、役割分担などを記載してください"
          />

          <FormControl fullWidth>
            <InputLabel id="desired-menu-label">メニュー希望（任意）</InputLabel>
            <Select
              labelId="desired-menu-label"
              label="メニュー希望（任意）"
              value={data.desiredMenuId || ''}
              onChange={(e) => onChange({ ...data, desiredMenuId: e.target.value || undefined })}
            >
              <MenuItem value="">
                <em>未選択（自動サジェストのみ）</em>
              </MenuItem>

              <MenuItem disabled sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                ━━━ 政策促進事業（補助率 2/3） ━━━
              </MenuItem>
              {allMenus
                .filter(m => m.category === 'policy')
                .map(menu => (
                  <MenuItem key={menu.id} value={menu.id}>
                    {menu.code} {menu.name}
                  </MenuItem>
                ))}

              <MenuItem disabled sx={{ fontWeight: 'bold', color: 'primary.dark', mt: 1 }}>
                ━━━ 一般的対策事業（補助率 1/2）━━━
              </MenuItem>
              {allMenus
                .filter(m => m.category === 'general' && !m.isEmergency)
                .map(menu => (
                  <MenuItem key={menu.id} value={menu.id}>
                    {menu.code} {menu.name}
                  </MenuItem>
                ))}

              <MenuItem disabled sx={{ fontWeight: 'bold', color: 'warning.main', mt: 1 }}>
                ━━━ 緊急的・重点的メニュー（補助率 2/3） ━━━
              </MenuItem>
              {allMenus
                .filter(m => m.isEmergency)
                .map(menu => (
                  <MenuItem key={menu.id} value={menu.id}>
                    {menu.code} {menu.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
}
