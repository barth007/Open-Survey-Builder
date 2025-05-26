
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SurveyTabsProps {
  activeTab: "edit" | "answers";
  setActiveTab: (tab: "edit" | "answers") => void;
}

const SurveyTabs: React.FC<SurveyTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full bg-pebble h-12 flex-shrink-0">
      <div className="h-full">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full h-full"
        >
          <TabsList className="flex w-full h-full rounded-none bg-transparent">
            <TabsTrigger
              value="edit"
              className="flex-1 h-full rounded-none border-0 data-[state=active]:bg-abyss data-[state=active]:text-white"
            >
              Edit
            </TabsTrigger>
            <TabsTrigger
              value="answers"
              className="flex-1 h-full rounded-none border-0 data-[state=active]:bg-abyss data-[state=active]:text-white"
            >
              Answers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default SurveyTabs;
