'use client';

import { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReviewStepper from '@/components/review/ReviewStepper';
import ApplicationForm from '@/components/forms/ApplicationForm';
import MenuSuggest from '@/components/review/MenuSuggest';
import RequirementChecklist, { MenuCheckData } from '@/components/review/RequirementChecklist';
import { ApplicationInfo } from '@/types';

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationInfo>({
    name: '',
    applicant: '',
    purpose: '',
    content: '',
    structure: '',
  });
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [checkStates, setCheckStates] = useState<Record<string, MenuCheckData>>({});

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleMenusSelected = (menuIds: string[]) => {
    setSelectedMenuIds(menuIds);
    handleNext();
  };

  const isStep1Valid = applicationData.name && applicationData.applicant && applicationData.content;

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'primary.dark' }}>
        <Toolbar>
          <Typography variant="h1" component="h1" sx={{ flexGrow: 1, color: 'white' }}>
            審査アプリ
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <ReviewStepper activeStep={activeStep} />

          {activeStep === 0 && (
            <>
              <ApplicationForm
                data={applicationData}
                onChange={setApplicationData}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
                <Box />
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  size="large"
                >
                  メニュー候補を見る
                </Button>
              </Box>
            </>
          )}

          {activeStep === 1 && (
            <>
              <MenuSuggest
                applicationData={applicationData}
                onMenusSelected={handleMenusSelected}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  size="large"
                >
                  戻る
                </Button>
              </Box>
            </>
          )}

          {activeStep === 2 && (
            <>
              <RequirementChecklist
                menuIds={selectedMenuIds}
                checkStates={checkStates}
                onCheckStatesChange={setCheckStates}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  size="large"
                >
                  戻る
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  size="large"
                >
                  経費入力へ
                </Button>
              </Box>
            </>
          )}

          {activeStep === 3 && (
            <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 1 }}>
              <Typography variant="h2">経費チェック（開発中）</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                この画面では、経費の入力と補助金額の自動計算を行います。
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>戻る</Button>
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}>次へ</Button>
              </Box>
            </Box>
          )}

          {activeStep === 4 && (
            <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 1 }}>
              <Typography variant="h2">判定結果（開発中）</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                この画面では、総合的な判定結果と所見を表示します。
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>戻る</Button>
                <Button variant="contained" onClick={() => setActiveStep(0)}>最初に戻る</Button>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
}
