
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  clearClicks: () => void;
}

const LOCAL_STORAGE_KEY = 'surveyClickData';

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

  // Load clicks from localStorage on mount
  useEffect(() => {
    try {
      const storedClicks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedClicks) {
        setClicks(JSON.parse(storedClicks));
      }
    } catch (error) {
      console.error('Failed to load clicks from localStorage:', error);
    }
  }, []);

  // Save clicks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clicks));
    } catch (error) {
      console.error('Failed to save clicks to localStorage:', error);
    }
  }, [clicks]);

  const addClick = (clickData: ClickData) => {
    setClicks(prevClicks => [...prevClicks, clickData]);
  };

  const getClicksByQuestionId = (questionId: string) => {
    return clicks.filter(click => click.questionId === questionId);
  };

  const clearClicks = () => {
    setClicks([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <ClickContext.Provider value={{ clicks, addClick, getClicksByQuestionId, clearClicks }}>
      {children}
    </ClickContext.Provider>
  );
};
