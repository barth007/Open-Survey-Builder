
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SurveyLayoutProps {
  children: React.ReactNode;
  activeTab: "edit" | "answers";
  setActiveTab: (tab: "edit" | "answers") => void;
}

const SurveyLayout = ({ 
  children, 
  activeTab, 
  setActiveTab
}: SurveyLayoutProps) => {
  const handleTabChange = (value: string) => {
    console.log('[SurveyLayout] Tab change:', value);
    setActiveTab(value as "edit" | "answers");
  };

  return (
    <div className="flex flex-col h-full pt-14">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center px-6 py-3 bg-white border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Edit
            </TabsTrigger>
            <TabsTrigger value="answers" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Answers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default SurveyLayout;
