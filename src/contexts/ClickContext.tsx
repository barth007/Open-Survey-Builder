
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ClickData {
  x: number;
  y: number;
  questionId: string;
  sessionId: string;
  timestamp: number;
}

interface ClickContextType {
  clicks: ClickData[];
  addClick: (clickData: ClickData) => void;
  getClicksByQuestionId: (questionId: string) => ClickData[];
}

const ClickContext = createContext<ClickContextType | undefined>(undefined);

export const useClickContext = () => {
  const context = useContext(ClickContext);
  if (context === undefined) {
    throw new Error('useClickContext must be used within a ClickProvider');
  }
  return context;
};

export const ClickProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clicks, setClicks] = useState<ClickData[]>([]);

  const addClick = (clickData: ClickData) => {
    setClicks(prevClicks => [...prevClicks, clickData]);
  };

  const getClicksByQuestionId = (questionId: string) => {
    return clicks.filter(click => click.questionId === questionId);
  };

  return (
    <ClickContext.Provider value={{ clicks, addClick, getClicksByQuestionId }}>
      {children}
    </ClickContext.Provider>
  );
};
