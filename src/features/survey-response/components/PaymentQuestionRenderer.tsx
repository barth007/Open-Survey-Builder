import React from 'react';
import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { PaymentAnswerValue, Question } from '@/types/survey';

interface PaymentQuestionRendererProps {
  question: Question;
  value?: PaymentAnswerValue;
  onChange: (value: PaymentAnswerValue) => void;
}

export const PaymentQuestionRenderer: React.FC<PaymentQuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  const checkoutUrl = question.embedUrl || '';

  const openCheckout = () => {
    if (!checkoutUrl) {
      return;
    }

    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 rounded-[28px] border border-border/70 bg-muted/10 p-5">
      <div>
        <div className="text-base font-medium text-foreground">External checkout</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {checkoutUrl
            ? 'Open the checkout link, complete payment externally, then confirm below.'
            : 'Add a checkout URL in the editor to use this block.'}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={openCheckout} disabled={!checkoutUrl} className="rounded-full">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open checkout
        </Button>
      </div>

      <label className="flex items-start gap-4 rounded-[22px] border border-border/70 bg-background px-4 py-3">
        <Checkbox
          checked={value?.confirmed || false}
          onCheckedChange={(checked) =>
            onChange({
              kind: 'payment',
              confirmed: Boolean(checked),
              checkoutUrl,
              confirmedAt: checked ? new Date().toISOString() : undefined,
            })
          }
        />
        <div>
          <div className="text-sm font-medium text-foreground">I completed the payment step</div>
          <div className="mt-1 text-xs text-muted-foreground">
            This form records confirmation only. Card processing happens outside this app.
          </div>
        </div>
      </label>
    </div>
  );
};
