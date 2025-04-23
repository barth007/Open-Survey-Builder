
import React from 'react';
import { Survey } from '@/types/survey';
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
import { BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AnswersTabProps {
  survey: Survey;
}

// Sample data for demonstration - in real app, this would come from a database
const mockResponses = [
  {
    questionId: "1",
    question: "What is your preferred platform?",
    responses: [
      { answer: "Windows", count: 45 },
      { answer: "macOS", count: 35 },
      { answer: "Linux", count: 20 },
    ]
  },
  {
    questionId: "2",
    question: "Which features are most important to you?",
    responses: [
      { answer: "Performance", count: 40 },
      { answer: "Security", count: 30 },
      { answer: "Ease of use", count: 25 },
      { answer: "Customization", count: 15 },
    ]
  },
  {
    questionId: "3",
    question: "How would you rate our service?",
    responses: [
      { answer: "Very poor", count: 5 },
      { answer: "Poor", count: 10 },
      { answer: "Average", count: 25 },
      { answer: "Good", count: 35 },
      { answer: "Excellent", count: 25 },
    ],
    likert: true
  }
];

interface ResponseData {
  answer: string;
  count: number;
}

const COLORS = ['#2563eb', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

const AnswersTab: React.FC<AnswersTabProps> = ({ survey }) => {
  const [chartType, setChartType] = React.useState<Record<string, "bar" | "pie">>({});

  const handleChartTypeChange = (questionId: string, type: "bar" | "pie") => {
    setChartType(prev => ({
      ...prev,
      [questionId]: type
    }));
  };

  // Calculate percentages for responses
  const calculatePercentages = (responses: ResponseData[]) => {
    const total = responses.reduce((sum, item) => sum + item.count, 0);
    return responses.map(item => ({
      ...item,
      percentage: Math.round((item.count / total) * 100)
    }));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-ice p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-carbon">Response Summary</h2>
        <p className="text-gray-600 mb-2">Total responses: <span className="font-medium">95</span></p>
        <p className="text-gray-600">Last response: <span className="font-medium">Today, 2:30 PM</span></p>
      </div>

      {mockResponses.map((item) => {
        const responses = calculatePercentages(item.responses);
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
                  <BarChart data={responses} layout={item.likert ? "horizontal" : "vertical"}>
                    <XAxis dataKey={item.likert ? "answer" : ""} type={item.likert ? "category" : "number"} />
                    <YAxis dataKey={item.likert ? "" : "answer"} type={item.likert ? "number" : "category"} />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        return [`${value} (${props.payload.percentage}%)`, 'Responses'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#2563eb" name="Responses">
                      {responses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={responses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="answer"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {responses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        return [`${value} (${(props.percent * 100).toFixed(0)}%)`, props.name];
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
                  {responses.map((response) => (
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
    </div>
  );
};

export default AnswersTab;
