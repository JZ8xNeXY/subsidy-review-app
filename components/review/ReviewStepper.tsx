'use client';

import { Box, Step, StepLabel, Stepper } from '@mui/material';

const steps = [
  '申請情報入力',
  'メニュー選択',
  '要件チェック',
  '経費チェック',
  '判定結果',
];

interface ReviewStepperProps {
  activeStep: number;
}

export default function ReviewStepper({ activeStep }: ReviewStepperProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stepper activeStep={activeStep} sx={{
        bgcolor: 'background.paper',
        p: 2.5,
        borderRadius: 1,
        boxShadow: 1
      }}>
        {steps.map((label, index) => (
          <Step key={label} completed={index < activeStep}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
