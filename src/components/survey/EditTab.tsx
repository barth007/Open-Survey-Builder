
import React from 'react';
import { Survey } from '@/types/survey';
import SurveyTitle from '@/components/SurveyTitle';
import AddQuestionButton from '@/components/AddQuestionButton';
import QuestionsList from './QuestionsList';

interface EditTabProps {
  survey: Survey;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onQuestionChange: (question: any) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: any) => void;
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

      <QuestionsList 
        questions={survey.questions}
        onQuestionChange={onQuestionChange}
        onDeleteQuestion={onDeleteQuestion}
        onDuplicateQuestion={onDuplicateQuestion}
      />

      <AddQuestionButton onClick={onAddQuestion} />
    </div>
  );
};

export default EditTab;
