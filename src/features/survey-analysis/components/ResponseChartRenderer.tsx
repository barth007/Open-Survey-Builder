
import React from 'react';
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

interface ResponseData {
  answer: string;
  count: number;
  percentage?: number;
}

interface ResponseChartRendererProps {
  chartType: 'bar' | 'pie';
  data: ResponseData[];
  isLikert: boolean;
}

// ColorBrewer-safe palette for accessibility (colorblind-friendly)
const ACCESSIBLE_COLORS = [
  '#377eb8', // blue
  '#4daf4a', // green
  '#984ea3', // purple
  '#ff7f00', // orange
  '#e41a1c', // red
  '#ffff33', // yellow
  '#a65628', // brown
  '#f781bf'  // pink
];

export const ResponseChartRenderer: React.FC<ResponseChartRendererProps> = ({
  chartType,
  data,
  isLikert
}) => {
  // Calculate summary statistics for text description
  const totalResponses = data.reduce((sum, item) => sum + item.count, 0);
  const mostSelected = data.reduce((max, item) => 
    item.count > max.count ? item : max, data[0] || { answer: '', count: 0, percentage: 0 }
  );
  const leastSelected = data.reduce((min, item) => 
    item.count < min.count ? item : min, data[0] || { answer: '', count: 0, percentage: 0 }
  );

  const chartId = `chart-${chartType}-${Math.random().toString(36).substr(2, 9)}`;
  const summaryId = `summary-${chartId}`;

  // Text summary for screen readers and accessibility
  const getTextSummary = () => {
    if (data.length === 0) return "No data available for this chart.";
    
    return `Chart showing ${totalResponses} total responses across ${data.length} answer options. ` +
           `Most selected answer: ${mostSelected.answer} with ${mostSelected.count} responses (${mostSelected.percentage}%). ` +
           `Least selected answer: ${leastSelected.answer} with ${leastSelected.count} responses (${leastSelected.percentage}%).`;
  };

  if (chartType === 'bar') {
    return (
      <div className="space-y-4">
        <div 
          role="img" 
          aria-labelledby={chartId}
          aria-describedby={summaryId}
          tabIndex={0}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data} 
              layout={isLikert ? "vertical" : "horizontal"}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                dataKey={isLikert ? "count" : "answer"} 
                type={isLikert ? "number" : "category"}
                aria-label={isLikert ? "Response count" : "Answer options"}
              />
              <YAxis 
                dataKey={isLikert ? "answer" : "count"} 
                type={isLikert ? "category" : "number"}
                aria-label={isLikert ? "Answer options" : "Response count"}
              />
              <Tooltip 
                formatter={(value, name, props) => {
                  return [`${value} responses (${props.payload.percentage}%)`, 'Count'];
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#377eb8" 
                name="Responses"
                aria-label="Response data bars"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={ACCESSIBLE_COLORS[index % ACCESSIBLE_COLORS.length]}
                    aria-label={`${entry.answer}: ${entry.count} responses`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Text summary for accessibility */}
        <div 
          id={summaryId}
          className="bg-gray-50 p-3 rounded border text-sm"
          role="region"
          aria-label="Chart summary"
        >
          <h4 className="font-medium mb-2 text-gray-700">Chart Summary</h4>
          <ul className="space-y-1 text-gray-600">
            <li>• <strong>Most selected:</strong> {mostSelected.answer} ({mostSelected.count} responses, {mostSelected.percentage}%)</li>
            <li>• <strong>Least selected:</strong> {leastSelected.answer} ({leastSelected.count} responses, {leastSelected.percentage}%)</li>
            <li>• <strong>Total responses:</strong> {totalResponses}</li>
            <li>• <strong>Answer options:</strong> {data.length}</li>
          </ul>
          <p className="sr-only">{getTextSummary()}</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="space-y-4">
        <div 
          role="img" 
          aria-labelledby={chartId}
          aria-describedby={summaryId}
          tabIndex={0}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="answer"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                aria-label="Pie chart showing response distribution"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={ACCESSIBLE_COLORS[index % ACCESSIBLE_COLORS.length]}
                    aria-label={`${entry.answer}: ${entry.count} responses, ${entry.percentage}%`}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, entry) => {
                  const dataEntry = entry && entry.payload ? entry.payload : {};
                  const percentage = dataEntry.percentage || 0;
                  return [`${value} responses (${percentage}%)`, name];
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Text summary for accessibility */}
        <div 
          id={summaryId}
          className="bg-gray-50 p-3 rounded border text-sm"
          role="region"
          aria-label="Chart summary"
        >
          <h4 className="font-medium mb-2 text-gray-700">Chart Summary</h4>
          <ul className="space-y-1 text-gray-600">
            <li>• <strong>Most selected:</strong> {mostSelected.answer} ({mostSelected.count} responses, {mostSelected.percentage}%)</li>
            <li>• <strong>Least selected:</strong> {leastSelected.answer} ({leastSelected.count} responses, {leastSelected.percentage}%)</li>
            <li>• <strong>Total responses:</strong> {totalResponses}</li>
            <li>• <strong>Answer options:</strong> {data.length}</li>
          </ul>
          <p className="sr-only">{getTextSummary()}</p>
        </div>
      </div>
    );
  }
};
