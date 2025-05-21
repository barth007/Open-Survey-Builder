import React from "react";
import { Sidebar } from "@/components/ui/sidebar"; // 

interface SurveyLayoutProps {
  children: React.ReactNode;
}

const SurveyLayout: React.FC<SurveyLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left Sidebar */}
      <aside className="w-[260px] border-r border-gray-200 bg-white">
        <Sidebar />
      </aside>

      {/* Main content area (editor, tabs, etc.) */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default SurveyLayout;
