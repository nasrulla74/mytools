import { useState } from "react";
import { Globe, Server, CheckSquare, FileText } from "lucide-react";

type Tab = "Websites" | "Servers" | "Tasks" | "Notes";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("Websites");

    const tabs: { id: Tab; icon: any }[] = [
        { id: "Websites", icon: Globe },
        { id: "Servers", icon: Server },
        { id: "Tasks", icon: CheckSquare },
        { id: "Notes", icon: FileText },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            </div>

            {/* Tabs Header */}
            <div className="flex gap-2 border-b border-zinc-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative cursor-pointer
              ${activeTab === tab.id
                                ? "text-emerald-400 border-b-2 border-emerald-500"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"}`}
                    >
                        <tab.icon size={16} />
                        {tab.id}
                    </button>
                ))}
            </div>

            {/* Tab Content Placeholder */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                    {(() => {
                        const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon;
                        return ActiveIcon ? <ActiveIcon size={32} /> : null;
                    })()}
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">{activeTab}</h3>
                <p className="text-zinc-500 max-w-sm">
                    Management interface for your {activeTab.toLowerCase()} will appear here.
                    This is a placeholder for the Dashboard feature.
                </p>
            </div>
        </div>
    );
}
