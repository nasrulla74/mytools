import { useState, useEffect } from "react";
import { Globe, Server, CheckSquare, FileText, Plus, X, ExternalLink, Edit2, Filter } from "lucide-react";

type Tab = "Websites" | "Servers" | "Tasks" | "Notes";

interface Website {
    id?: number;
    name: string;
    link: string;
    icon: string;
    description: string;
    category: string;
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("Websites");
    const [websites, setWebsites] = useState<Website[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
    const [newWebsite, setNewWebsite] = useState<Website>({ name: "", link: "", icon: "", description: "", category: "General" });
    const [loading, setLoading] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("All");

    useEffect(() => {
        if (activeTab === "Websites") {
            fetchWebsites();
        }
    }, [activeTab]);

    const fetchWebsites = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/websites`);
            const data = await res.json();
            setWebsites(data);
        } catch (e) {
            console.error("Failed to fetch websites:", e);
        }
    };

    const saveWebsite = async () => {
        const websiteToSave = editingWebsite || newWebsite;
        if (!websiteToSave.name || !websiteToSave.link) return;
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const method = editingWebsite ? "PUT" : "POST";
            const url = editingWebsite ? `${apiBase}/websites/${editingWebsite.id}` : `${apiBase}/websites`;

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(websiteToSave),
            });

            setIsModalOpen(false);
            setEditingWebsite(null);
            setNewWebsite({ name: "", link: "", icon: "", description: "", category: "General" });
            fetchWebsites();
        } catch (e) {
            console.error("Failed to save website:", e);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (e: React.MouseEvent, site: Website) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingWebsite(site);
        setIsModalOpen(true);
    };

    const categories = ["All", ...Array.from(new Set(websites.map(s => s.category || "General")))];

    const filteredWebsites = categoryFilter === "All"
        ? websites
        : websites.filter(s => s.category === categoryFilter);

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
                {activeTab === "Websites" && (
                    <button
                        onClick={() => {
                            setEditingWebsite(null);
                            setNewWebsite({ name: "", link: "", icon: "", description: "", category: "General" });
                            setIsModalOpen(true);
                        }}
                        className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 cursor-pointer font-medium"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        Add Website
                    </button>
                )}
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

            {/* Filter Bar */}
            {activeTab === "Websites" && websites.length > 0 && (
                <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm whitespace-nowrap mr-2">
                        <Filter size={14} />
                        Filter:
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap
                ${categoryFilter === cat
                                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "Websites" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWebsites.map((site, i) => (
                            <div
                                key={i}
                                className="group relative bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl hover:border-emerald-500/50 hover:bg-zinc-800/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full"
                            >
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500"></div>

                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-zinc-700/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all duration-500">
                                        {site.icon || "🌐"}
                                    </div>
                                    <div className="flex gap-2 relative z-10">
                                        <button
                                            onClick={(e) => openEditModal(e, site)}
                                            className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <a
                                            href={site.link.startsWith('http') ? site.link : `https://${site.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                                            title="Open Website"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-emerald-500/70 transition-colors">
                                        {site.category || "General"}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors duration-300">{site.name}</h3>
                                <p className="text-sm text-zinc-400 line-clamp-3 flex-1 leading-relaxed mb-4">{site.description || "No description provided."}</p>

                                <a
                                    href={site.link.startsWith('http') ? site.link : `https://${site.link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center gap-2 group/btn cursor-pointer"
                                >
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold group-hover/btn:text-emerald-500 transition-colors">Visit Site</div>
                                    <div className="h-[1px] flex-1 bg-zinc-800 group-hover/btn:bg-emerald-500/20 transition-colors"></div>
                                    <ExternalLink size={10} className="text-zinc-600 group-hover/btn:text-emerald-500 transition-colors" />
                                </a>
                            </div>
                        ))}
                        {filteredWebsites.length === 0 && (
                            <div className="col-span-full py-32 text-center text-zinc-500 border-2 border-dashed border-zinc-800/30 rounded-3xl bg-zinc-900/10">
                                <div className="mb-6 opacity-10 flex justify-center"><Globe size={80} /></div>
                                <h4 className="text-xl font-medium text-zinc-300 mb-2">No websites found</h4>
                                <p className="text-zinc-500">Try changing your filter or add a new website.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-12 min-h-[400px] flex flex-col items-center justify-center text-center backdrop-blur-sm">
                        <div className="w-20 h-20 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6 text-zinc-600 border border-zinc-700/50 shadow-xl">
                            {(() => {
                                const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon;
                                return ActiveIcon ? <ActiveIcon size={36} /> : null;
                            })()}
                        </div>
                        <h3 className="text-xl font-bold text-zinc-200 mb-3">{activeTab}</h3>
                        <p className="text-zinc-500 max-w-sm leading-relaxed">
                            This module is currently being optimized for the best experience.
                            Stay tuned for more updates!
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                    {editingWebsite ? <Edit2 size={20} /> : <Plus size={20} />}
                                </div>
                                <h3 className="text-xl font-bold text-white">{editingWebsite ? "Edit Website" : "New Website"}</h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors">Website Name</label>
                                    <input
                                        type="text"
                                        value={editingWebsite ? editingWebsite.name : newWebsite.name}
                                        onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, name: e.target.value }) : setNewWebsite({ ...newWebsite, name: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="e.g. Google"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors">Category</label>
                                    <input
                                        type="text"
                                        value={editingWebsite ? editingWebsite.category : newWebsite.category}
                                        onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, category: e.target.value }) : setNewWebsite({ ...newWebsite, category: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="e.g. Tools"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors">Destination Link</label>
                                <input
                                    type="text"
                                    value={editingWebsite ? editingWebsite.link : newWebsite.link}
                                    onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, link: e.target.value }) : setNewWebsite({ ...newWebsite, link: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all outline-none"
                                    placeholder="https://google.com"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 space-y-2 group">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors">Emoji Icon</label>
                                    <input
                                        type="text"
                                        value={editingWebsite ? editingWebsite.icon : newWebsite.icon}
                                        onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, icon: e.target.value }) : setNewWebsite({ ...newWebsite, icon: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-2xl text-center focus:outline-none focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="🚀"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2 group">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors">Brief Description</label>
                                    <input
                                        type="text"
                                        value={editingWebsite ? editingWebsite.description : newWebsite.description}
                                        onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, description: e.target.value }) : setNewWebsite({ ...newWebsite, description: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="What is this site?"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-zinc-950/30 flex gap-4">
                            <button
                                onClick={saveWebsite}
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer"
                            >
                                {loading ? "Saving..." : (editingWebsite ? "Update Website" : "Create Website Entry")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
