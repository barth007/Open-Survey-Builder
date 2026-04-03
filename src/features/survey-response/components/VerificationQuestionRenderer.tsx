import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import type { VerificationAnswerValue } from '@/types/survey';

interface VerificationQuestionRendererProps {
  value?: VerificationAnswerValue;
  onChange: (value: VerificationAnswerValue) => void;
}

export const VerificationQuestionRenderer: React.FC<VerificationQuestionRendererProps> = ({
  value,
  onChange,
}) => {
  return (
    <label className="flex items-start gap-4 rounded-[24px] border border-border/70 bg-muted/10 px-5 py-4">
      <Checkbox
        checked={value?.verified || false}
        onCheckedChange={(checked) =>
          onChange({
            kind: 'verification',
            verified: Boolean(checked),
            provider: 'local',
          })
        }
      />
      <div>
        <div className="text-base font-medium text-foreground">I&apos;m not a robot</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Local human-verification step for this form.
        </div>
      </div>
    </label>
  );
};
