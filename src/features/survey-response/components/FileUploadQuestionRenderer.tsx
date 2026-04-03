import React, { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { FileUploadAnswerValue } from '@/types/survey';
import { serializeFilesForAnswer } from '@/lib/answer-values';

interface FileUploadQuestionRendererProps {
  value?: FileUploadAnswerValue;
  onChange: (value: FileUploadAnswerValue) => void;
}

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = 6 * 1024 * 1024;

export const FileUploadQuestionRenderer: React.FC<FileUploadQuestionRendererProps> = ({
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const files = value?.files || [];

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const serialized = await serializeFilesForAnswer(selectedFiles, MAX_FILE_BYTES);
      const nextFiles = [...files, ...serialized.files];
      const totalBytes = nextFiles.reduce((sum, file) => sum + file.size, 0);

      if (totalBytes > MAX_TOTAL_BYTES) {
        throw new Error('The combined upload exceeds the 6 MB total limit for this form response.');
      }

      onChange({
        kind: 'fileUpload',
        files: nextFiles,
      });
      event.target.value = '';
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not read the selected file.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = (fileName: string) => {
    onChange({
      kind: 'fileUpload',
      files: files.filter((file) => file.name !== fileName),
    });
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelection}
      />

      <div className="rounded-[28px] border border-dashed border-border/70 bg-muted/10 p-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-base font-medium text-foreground">Upload files</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Files are stored directly with the response. Limits: 2 MB per file, 6 MB total.
            </div>
          </div>
          <Button type="button" onClick={handleBrowse} disabled={isLoading} className="rounded-full px-5">
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? 'Reading file...' : 'Choose files'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={`${file.name}-${file.lastModified}`} className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-background px-4 py-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{file.name}</div>
                <div className="text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB</div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => removeFile(file.name)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
