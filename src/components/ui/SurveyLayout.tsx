import Sidebar, { SidebarProvider } from "@/components/ui/sidebar";

const SurveyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen overflow-hidden bg-white">
                <aside className="w-[260px] border-r border-gray-200 bg-white">
                    <Sidebar />
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
};

export default SurveyLayout;
