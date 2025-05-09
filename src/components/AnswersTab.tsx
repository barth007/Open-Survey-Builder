
import React, { useState, useMemo } from 'react';
import { Survey, Question, Answer } from '@/types/survey';
import { 
  BarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart2, PieChart as PieChartIcon, Download } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuerySurveyResponses } from '@/hooks/survey/useQuerySurveyResponses';
import { useToast } from '@/hooks/use-toast';
import { FigmaHeatmapCard } from './survey/FigmaHeatmapCard';

interface AnswersTabProps {
  survey: Survey;
}

interface ResponseData {
  answer: string;
  count: number;
  percentage?: number;
}

const COLORS = ['#2563eb', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

const AnswersTab: React.FC<AnswersTabProps> = ({ survey }) => {
  const { toast } = useToast();
  const [chartType, setChartType] = React.useState<Record<string, "bar" | "pie">>({});
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "count" | "alpha">("default");
  const { data: responses, isLoading, error } = useQuerySurveyResponses(survey.id);

  // Add the missing handleChartTypeChange function
  const handleChartTypeChange = (questionId: string, type: "bar" | "pie") => {
    setChartType(prev => ({
      ...prev,
      [questionId]: type
    }));
  };

  // Filter questions with Figma prototypes
  const figmaQuestions = useMemo(() => {
    return survey.questions.filter(q => q.figmaPrototypeUrl);
  }, [survey.questions]);

  // Process response data into a format suitable for charts
  const processedResponses = useMemo(() => {
    if (!responses || responses.length === 0) {
      // Return mock data for development and if there's no responses yet
      return [];
    }

    const result = survey.questions
      .filter(question => question.type === 'multipleChoice' || question.type === 'checkboxes' || 
                         question.type === 'likert5' || question.type === 'likert7' || question.type === 'likert10')
      .map(question => {
        // Collect all answers for this question
        let answerCounts: Record<string, number> = {};
        
        // Count occurrences of each answer
        responses.forEach(response => {
          const answer = response.answers.find((a: Answer) => a.questionId === question.id);
          
          if (answer) {
            if (Array.isArray(answer.value)) {
              // Handle checkboxes (multiple selections)
              answer.value.forEach(val => {
                answerCounts[val] = (answerCounts[val] || 0) + 1;
              });
            } else {
              // Handle single selection
              answerCounts[answer.value] = (answerCounts[answer.value] || 0) + 1;
            }
          }
        });

        // Convert to our response format and map option IDs to text
        const optionMap = new Map(
          question.options.map(option => [option.id, option.text])
        );

        const processedAnswers: ResponseData[] = Object.entries(answerCounts).map(([answerId, count]) => ({
          answer: optionMap.get(answerId) || answerId,
          count: count
        }));

        return {
          questionId: question.id,
          question: question.text,
          responses: processedAnswers,
          likert: question.type.startsWith('likert')
        };
      })
      .filter(item => item.responses.length > 0); // Only include questions with answers
    
    return result;
  }, [responses, survey.questions]);

  // Calculate percentages for responses
  const calculatePercentages = (responses: ResponseData[]) => {
    const total = responses.reduce((sum, item) => sum + item.count, 0);
    return responses.map(item => ({
      ...item,
      percentage: Math.round((item.count / total) * 100)
    }));
  };

  // Handle sorting of responses
  const sortResponses = (responses: ResponseData[]) => {
    const processedResponses = calculatePercentages(responses);
    
    if (sortBy === "count") {
      return [...processedResponses].sort((a, b) => b.count - a.count);
    } else if (sortBy === "alpha") {
      return [...processedResponses].sort((a, b) => a.answer.localeCompare(b.answer));
    }
    
    return processedResponses;
  };

  // Filter responses by question text
  const filteredResponses = processedResponses
    .filter(item => item.question.toLowerCase().includes(filterText.toLowerCase()));

  // Calculate total responses
  const totalResponses = responses?.length || 0;
  const lastResponseDate = responses && responses.length > 0 
    ? new Date(responses[responses.length - 1].submittedAt).toLocaleString() 
    : 'No responses yet';

  // Handle CSV export
  const exportToCSV = () => {
    if (processedResponses.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no responses to export yet.",
        variant: "destructive"
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
    link.setAttribute('download', `${survey.title}-responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `${survey.title}-responses.csv has been downloaded.`
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-ice">
        <p className="text-magma font-medium">Error loading survey responses</p>
        <p className="text-gray-500 mt-2">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-ice p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2 text-carbon">Response Summary</h2>
            <p className="text-gray-600 mb-2">Total responses: <span className="font-medium">{totalResponses}</span></p>
            <p className="text-gray-600">Last response: <span className="font-medium">{lastResponseDate}</span></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={exportToCSV} variant="outline" className="flex gap-2">
              <Download size={18} />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Display Figma prototype heatmaps if any */}
      {figmaQuestions.length > 0 && totalResponses > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-carbon">Figma Prototype Interactions</h2>
          <div className="space-y-4">
            {figmaQuestions.map(question => (
              <FigmaHeatmapCard
                key={question.id}
                questionId={question.id}
                questionText={question.text}
                figmaUrl={question.figmaPrototypeUrl || ''}
              />
            ))}
          </div>
        </div>
      )}

      {filteredResponses.length === 0 && totalResponses > 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-ice">
          <p className="text-gray-500">No responses match your filter criteria.</p>
        </div>
      )}

      {totalResponses === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-ice">
          <p className="text-gray-500">No responses have been collected for this survey yet.</p>
        </div>
      )}

      {filteredResponses.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Filter questions..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default order</SelectItem>
                  <SelectItem value="count">By count (highest first)</SelectItem>
                  <SelectItem value="alpha">Alphabetically</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredResponses.map((item) => {
            const sortedResponses = sortResponses(item.responses);
            const currentChartType = chartType[item.questionId] || "bar";

            return (
              <Card key={item.questionId} className="border-ice">
                <CardHeader className="border-b border-ice">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                    <ToggleGroup type="single" value={currentChartType} onValueChange={(value) => {
                      if (value) handleChartTypeChange(item.questionId, value as "bar" | "pie");
                    }}>
                      <ToggleGroupItem value="bar">
                        <BarChart2 size={18} />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="pie">
                        <PieChartIcon size={18} />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {currentChartType === "bar" ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sortedResponses} layout={item.likert ? "horizontal" : "vertical"}>
                        <XAxis dataKey={item.likert ? "answer" : ""} type={item.likert ? "category" : "number"} />
                        <YAxis dataKey={item.likert ? "" : "answer"} type={item.likert ? "number" : "category"} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            return [`${value} (${props.payload.percentage}%)`, 'Responses'];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#2563eb" name="Responses">
                          {sortedResponses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sortedResponses}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="answer"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {sortedResponses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, entry) => {
                            // Access the percentage directly from our data
                            const dataEntry = entry && entry.payload ? entry.payload : {};
                            const percentage = dataEntry.percentage || 0;
                            return [`${value} (${percentage}%)`, name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Answer</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedResponses.map((response) => (
                        <TableRow key={response.answer}>
                          <TableCell>{response.answer}</TableCell>
                          <TableCell>{response.count}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                              {response.percentage}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
};

export default AnswersTab;
