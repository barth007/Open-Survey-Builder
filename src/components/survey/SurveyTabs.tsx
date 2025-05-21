import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SurveyTabsProps {
  activeTab: "edit" | "answers";
  setActiveTab: (tab: "edit" | "answers") => void;
}

const SurveyTabs: React.FC<SurveyTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full bg-pebble">
      <div className="max-w-7xl mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <div className="flex w-full border-b">
            <TabsList className="flex w-full rounded-none bg-transparent">
              <TabsTrigger
                value="edit"
                className="flex-1 min-h-12 rounded-none border-0 data-[state=active]:bg-abyss data-[state=active]:text-white"
              >
                Edit
              </TabsTrigger>
              <TabsTrigger
                value="answers"
                className="flex-1 min-h-12 rounded-none border-0 data-[state=active]:bg-abyss data-[state=active]:text-white"
              >
                Answers
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SurveyTabs;
