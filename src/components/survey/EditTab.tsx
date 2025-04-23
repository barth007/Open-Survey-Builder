
import React from 'react';
import { Survey, Question } from '@/types/survey';
import SurveyTitle from '@/components/SurveyTitle';
import QuestionCard from '@/components/QuestionCard';
import AddQuestionButton from '@/components/AddQuestionButton';

interface EditTabProps {
  survey: Survey;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onQuestionChange: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onAddQuestion: () => void;
}

const EditTab: React.FC<EditTabProps> = ({
  survey,
  onTitleChange,
  onDescriptionChange,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  onAddQuestion,
}) => {
  return (
    <div className="space-y-4">
      <SurveyTitle
        title={survey.title}
        description={survey.description}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />

      {survey.questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          questions={survey.questions}
          onQuestionChange={onQuestionChange}
          onDeleteQuestion={onDeleteQuestion}
          onDuplicateQuestion={onDuplicateQuestion}
        />
      ))}

      <AddQuestionButton onClick={onAddQuestion} />
    </div>
  );
};

export default EditTab;
