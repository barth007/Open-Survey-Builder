
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

const COLORS = ['#2563eb', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

export const ResponseChartRenderer: React.FC<ResponseChartRendererProps> = ({
  chartType,
  data,
  isLikert
}) => {
  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout={isLikert ? "horizontal" : "vertical"}>
          <XAxis dataKey={isLikert ? "answer" : ""} type={isLikert ? "category" : "number"} />
          <YAxis dataKey={isLikert ? "" : "answer"} type={isLikert ? "number" : "category"} />
          <Tooltip 
            formatter={(value, name, props) => {
              return [`${value} (${props.payload.percentage}%)`, 'Responses'];
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#2563eb" name="Responses">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  } else {
    return (
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
          >
            {data.map((entry, index) => (
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
    );
  }
};
