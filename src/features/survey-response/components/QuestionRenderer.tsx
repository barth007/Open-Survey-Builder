import React from 'react';

import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  AnswerValue,
  FileUploadAnswerValue,
  MatrixAnswerValue,
  PaymentAnswerValue,
  Question,
  RankingAnswerValue,
  SignatureAnswerValue,
  VerificationAnswerValue,
} from '@/types/survey';
import {
  isFileUploadAnswerValue,
  isMatrixAnswerValue,
  isPaymentAnswerValue,
  isRankingAnswerValue,
  isSignatureAnswerValue,
  isVerificationAnswerValue,
} from '@/lib/answer-values';
import {
  getNormalizedBlockType,
  isContentBlock,
  isScaleBlock,
  isTextInputBlock,
} from '@/features/survey-editor/lib/editor-blocks';
import { MultipleChoiceRenderer } from './MultipleChoiceRenderer';
import { CheckboxesRenderer } from './CheckboxesRenderer';
import { LikertScaleRenderer } from './LikertScaleRenderer';
import { RankingQuestionRenderer } from './RankingQuestionRenderer';
import { MatrixQuestionRenderer } from './MatrixQuestionRenderer';
import { FileUploadQuestionRenderer } from './FileUploadQuestionRenderer';
import { SignatureQuestionRenderer } from './SignatureQuestionRenderer';
import { VerificationQuestionRenderer } from './VerificationQuestionRenderer';
import { PaymentQuestionRenderer } from './PaymentQuestionRenderer';

interface QuestionRendererProps {
  question: Question;
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionId: string, value: AnswerValue) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answers,
  onAnswerChange,
}) => {
  const normalizedBlockType = getNormalizedBlockType(question);

  if (isContentBlock(question)) {
    if (normalizedBlockType === 'divider') {
      return <div className="h-px w-full bg-border/80" />;
    }

    if (normalizedBlockType === 'title') {
      return <div className="text-5xl font-bold tracking-tight text-foreground">{question.text}</div>;
    }

    if (normalizedBlockType === 'heading1' || normalizedBlockType === 'heading') {
      return <div className="text-4xl font-semibold tracking-tight text-foreground">{question.text}</div>;
    }

    if (normalizedBlockType === 'heading2') {
      return <div className="text-2xl font-semibold text-foreground/85">{question.text}</div>;
    }

    if (normalizedBlockType === 'heading3') {
      return <div className="text-xl font-semibold text-foreground/75">{question.text}</div>;
    }

    if (normalizedBlockType === 'label') {
      return <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{question.text}</div>;
    }

    if (normalizedBlockType === 'textBlock') {
      return <div className="max-w-2xl text-lg leading-8 text-muted-foreground">{question.text}</div>;
    }

    if (normalizedBlockType === 'pageBreak') {
      return <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">Page break</div>;
    }

    if (normalizedBlockType === 'audio') {
      return question.mediaUrl ? (
        <audio controls src={question.mediaUrl} className="w-full" />
      ) : null;
    }

    if (normalizedBlockType === 'embed') {
      return question.embedUrl ? (
        <iframe
          src={question.embedUrl}
          className="w-full rounded-[24px] border border-border/70"
          style={{ height: 400 }}
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          title={question.text || 'Embedded content'}
        />
      ) : null;
    }

    return <div className="text-muted-foreground">{question.text}</div>;
  }

  if (isTextInputBlock(question)) {
    const value = (answers[question.id] as string) || '';

    if (question.inputType === 'textarea') {
      return (
        <Textarea
          value={value}
          onChange={(event) => onAnswerChange(question.id, event.target.value)}
          rows={4}
          placeholder={question.placeholder || 'Type your answer here...'}
          className="min-h-[120px] rounded-[24px] border-border/70 bg-muted/10 px-5 py-4 text-base shadow-none"
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(event) => onAnswerChange(question.id, event.target.value)}
        type={question.inputType || 'text'}
        placeholder={question.placeholder || 'Type your answer here...'}
        className="h-14 rounded-[24px] border-border/70 bg-muted/10 px-5 text-base shadow-none"
      />
    );
  }

  if (question.type === 'multipleChoice') {
    if (normalizedBlockType === 'dropdown') {
      return (
        <select
          value={(answers[question.id] as string) || ''}
          onChange={(event) => onAnswerChange(question.id, event.target.value)}
          className="h-14 w-full rounded-[24px] border border-border/70 bg-muted/10 px-5 text-base text-foreground outline-none"
        >
          <option value="">Select an option</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.text}
            </option>
          ))}
        </select>
      );
    }

    return (
      <MultipleChoiceRenderer
        question={question}
        value={(answers[question.id] as string) || ''}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }

  if (question.type === 'checkboxes') {
    if (normalizedBlockType === 'multiSelect') {
      const selected = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : [];

      return (
        <select
          multiple
          value={selected}
          onChange={(event) => {
            const values = Array.from(event.currentTarget.selectedOptions, (option) => option.value);
            onAnswerChange(question.id, values);
          }}
          className="min-h-[180px] w-full rounded-[24px] border border-border/70 bg-muted/10 px-5 py-4 text-base text-foreground outline-none"
        >
          {question.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.text}
            </option>
          ))}
        </select>
      );
    }

    return (
      <CheckboxesRenderer
        question={question}
        selectedValues={(answers[question.id] as string[]) || []}
        onChange={(values) => onAnswerChange(question.id, values)}
      />
    );
  }

  if (isScaleBlock(question)) {
    if (normalizedBlockType === 'rating') {
      return (
        <RadioGroup
          value={(answers[question.id] as string) || ''}
          onValueChange={(value) => onAnswerChange(question.id, value)}
          className="grid grid-cols-5 gap-3"
        >
          {question.options.map((option, index) => {
            const isSelected = (answers[question.id] as string) === option.id;

            return (
              <label
                key={option.id}
                htmlFor={`rating-${option.id}`}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-[24px] border px-3 py-4 transition-all',
                  isSelected ? 'border-primary/30 bg-primary/5' : 'border-border/70 bg-muted/10',
                )}
              >
                <div className="text-xl">{'★'.repeat(index + 1)}</div>
                <span className="mt-2 text-xs text-muted-foreground">{option.text}</span>
                <RadioGroupItem id={`rating-${option.id}`} value={option.id} className="sr-only" />
              </label>
            );
          })}
        </RadioGroup>
      );
    }

    return (
      <LikertScaleRenderer
        question={question}
        value={(answers[question.id] as string) || ''}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }

  if (question.type === 'ranking') {
    return (
      <RankingQuestionRenderer
        question={question}
        value={isRankingAnswerValue(answers[question.id]) ? (answers[question.id] as RankingAnswerValue) : undefined}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }

  if (question.type === 'matrix') {
    return (
      <MatrixQuestionRenderer
        question={question}
        value={isMatrixAnswerValue(answers[question.id]) ? (answers[question.id] as MatrixAnswerValue) : undefined}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }

  if (question.type === 'fileUpload') {
    return (
      <FileUploadQuestionRenderer
        value={isFileUploadAnswerValue(answers[question.id]) ? (answers[question.id] as FileUploadAnswerValue) : undefined}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }

  if (question.type === 'signature') {
    return (
      <SignatureQuestionRenderer
        value={isSignatureAnswerValue(answers[question.id]) ? (answers[question.id] as SignatureAnswerValue) : undefined}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }

  if (question.type === 'payment') {
    return (
      <PaymentQuestionRenderer
        question={question}
        value={isPaymentAnswerValue(answers[question.id]) ? (answers[question.id] as PaymentAnswerValue) : undefined}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }

  if (question.type === 'recaptcha') {
    return (
      <VerificationQuestionRenderer
        value={isVerificationAnswerValue(answers[question.id]) ? (answers[question.id] as VerificationAnswerValue) : undefined}
        onChange={(value) => onAnswerChange(question.id, value)}
      />
    );
  }

  return null;
};
