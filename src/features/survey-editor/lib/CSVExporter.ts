
import { ProcessedResponseGroup, calculatePercentages } from './ResponsesProcessor';
import { useToast } from '@/hooks/use-toast';

export function useCSVExporter(processedResponses: ProcessedResponseGroup[], surveyTitle: string) {
  const { toast } = useToast();
  
  const exportToCSV = () => {
    if (processedResponses.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There are no responses to export yet."
      });
      return;
    }
    
    // Create CSV headers
    let csvContent = "Question,Answer,Count,Percentage\n";
    
    // Add data rows
    processedResponses.forEach(item => {
      const processedAnswers = calculatePercentages(item.responses);
      processedAnswers.forEach(response => {
        csvContent += `"${item.question}","${response.answer}",${response.count},${response.percentage}%\n`;
      });
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${surveyTitle}-responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `${surveyTitle}-responses.csv has been downloaded.`
    });
  };
  
  return { exportToCSV };
}
