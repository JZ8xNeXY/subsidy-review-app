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
import ExpenseChecker, { ExpenseState } from '@/components/review/ExpenseChecker';
import ResultView from '@/components/review/ResultView';
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
  const [expenseStates, setExpenseStates] = useState<Record<string, ExpenseState>>({});

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
            <>
              <ExpenseChecker
                menuIds={selectedMenuIds}
                expenseStates={expenseStates}
                onExpenseStatesChange={setExpenseStates}
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
                  判定結果を見る
                </Button>
              </Box>
            </>
          )}

          {activeStep === 4 && (
            <>
              <ResultView
                menuIds={selectedMenuIds}
                checkStates={checkStates}
                expenseStates={expenseStates}
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
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  size="large"
                >
                  最初に戻る
                </Button>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </>
  );
}
