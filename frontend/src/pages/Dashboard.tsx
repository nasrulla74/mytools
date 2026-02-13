import { useState, useEffect } from "react";
import { Globe, Server, CheckSquare, FileText, Plus, X, ExternalLink, Edit2, Filter, Activity, Copy, Check, Calendar, Clock, Image as ImageIcon, Link as LinkIcon, Hash } from "lucide-react";

type Tab = "Websites" | "Servers" | "Tasks" | "Notes";

interface Website {
    id?: number;
    name: string;
    link: string;
    icon: string;
    description: string;
    category: string;
}

interface ServerData {
    id?: number;
    server_name: string;
    provider: string;
    provider_link: string;
    client: string;
    server_ip: string;
    description: string;
}

interface TaskData {
    id?: number;
    task_name: string;
    category: string;
    client: string;
    status: string;
    date_created: string;
    date_completed: string;
}

interface NoteData {
    id?: number;
    content: string;
    tags: string;
    ref_link: string;
    images: string; // JSON string of base64
    date_created: string;
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("Websites");

    // Website States
    const [websites, setWebsites] = useState<Website[]>([]);
    const [isWebModalOpen, setIsWebModalOpen] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
    const [newWebsite, setNewWebsite] = useState<Website>({ name: "", link: "", icon: "", description: "", category: "General" });
    const [webCategoryFilter, setWebCategoryFilter] = useState("All");

    // Server States
    const [servers, setServers] = useState<ServerData[]>([]);
    const [isServerModalOpen, setIsServerModalOpen] = useState(false);
    const [editingServer, setEditingServer] = useState<ServerData | null>(null);
    const [newServer, setNewServer] = useState<ServerData>({ server_name: "", provider: "", provider_link: "", client: "", server_ip: "", description: "" });
    const [serverClientFilter, setServerClientFilter] = useState("All");
    const [serverProviderFilter, setServerProviderFilter] = useState("All");

    // Task States
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskData | null>(null);
    const [newTask, setNewTask] = useState<TaskData>({ task_name: "", category: "General", client: "Internal", status: "Pending", date_created: "", date_completed: "" });
    const [taskCategoryFilter, setTaskCategoryFilter] = useState("All");
    const [taskClientFilter, setTaskClientFilter] = useState("All");
    const [taskStatusFilter, setTaskStatusFilter] = useState("All");

    // Note States
    const [notes, setNotes] = useState<NoteData[]>([]);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<NoteData | null>(null);
    const [newNote, setNewNote] = useState<NoteData>({ content: "", tags: "", ref_link: "", images: "[]", date_created: "" });
    const [noteTagFilter, setNoteTagFilter] = useState("All");

    const [loading, setLoading] = useState(false);
    const [copiedIp, setCopiedIp] = useState<number | null>(null);

    useEffect(() => {
        if (activeTab === "Websites") fetchWebsites();
        if (activeTab === "Servers") fetchServers();
        if (activeTab === "Tasks") fetchTasks();
        if (activeTab === "Notes") fetchNotes();
    }, [activeTab]);

    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // --- API Functions ---
    const fetchWebsites = async () => {
        try {
            const res = await fetch(`${apiBase}/websites`);
            const data = await res.json();
            setWebsites(data);
        } catch (e) { console.error("Failed to fetch websites:", e); }
    };

    const fetchServers = async () => {
        try {
            const res = await fetch(`${apiBase}/servers`);
            const data = await res.json();
            setServers(data);
        } catch (e) { console.error("Failed to fetch servers:", e); }
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${apiBase}/tasks`);
            const data = await res.json();
            setTasks(data);
        } catch (e) { console.error("Failed to fetch tasks:", e); }
    };

    const fetchNotes = async () => {
        try {
            const res = await fetch(`${apiBase}/notes`);
            const data = await res.json();
            setNotes(data);
        } catch (e) { console.error("Failed to fetch notes:", e); }
    };

    const saveWebsite = async () => {
        const websiteToSave = editingWebsite || newWebsite;
        if (!websiteToSave.name || !websiteToSave.link) return;
        setLoading(true);
        try {
            const method = editingWebsite ? "PUT" : "POST";
            const url = editingWebsite ? `${apiBase}/websites/${editingWebsite.id}` : `${apiBase}/websites`;
            await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(websiteToSave) });
            setIsWebModalOpen(false);
            setEditingWebsite(null);
            setNewWebsite({ name: "", link: "", icon: "", description: "", category: "General" });
            fetchWebsites();
        } catch (e) { console.error("Failed to save website:", e); } finally { setLoading(false); }
    };

    const saveServer = async () => {
        const serverToSave = editingServer || newServer;
        if (!serverToSave.server_name) return;
        setLoading(true);
        try {
            const method = editingServer ? "PUT" : "POST";
            const url = editingServer ? `${apiBase}/servers/${editingServer.id}` : `${apiBase}/servers`;
            await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(serverToSave) });
            setIsServerModalOpen(false);
            setEditingServer(null);
            setNewServer({ server_name: "", provider: "", provider_link: "", client: "", server_ip: "", description: "" });
            fetchServers();
        } catch (e) { console.error("Failed to save server:", e); } finally { setLoading(false); }
    };

    const saveTask = async () => {
        const taskToSave = editingTask || newTask;
        if (!taskToSave.task_name) return;
        setLoading(true);
        try {
            const method = editingTask ? "PUT" : "POST";
            const url = editingTask ? `${apiBase}/tasks/${editingTask.id}` : `${apiBase}/tasks`;
            const payload = { ...taskToSave };
            if (method === "POST" && !payload.date_created) payload.date_created = new Date().toISOString().split('T')[0];
            if (payload.status === "Completed" && !payload.date_completed) payload.date_completed = new Date().toISOString().split('T')[0];
            await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setNewTask({ task_name: "", category: "General", client: "Internal", status: "Pending", date_created: "", date_completed: "" });
            fetchTasks();
        } catch (e) { console.error("Failed to save task:", e); } finally { setLoading(false); }
    };

    const saveNote = async () => {
        const noteToSave = editingNote || newNote;
        if (!noteToSave.content) return;
        setLoading(true);
        try {
            const method = editingNote ? "PUT" : "POST";
            const url = editingNote ? `${apiBase}/notes/${editingNote.id}` : `${apiBase}/notes`;
            const payload = { ...noteToSave };
            if (method === "POST" && !payload.date_created) payload.date_created = new Date().toISOString().split('T')[0];
            await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            setIsNoteModalOpen(false);
            setEditingNote(null);
            setNewNote({ content: "", tags: "", ref_link: "", images: "[]", date_created: "" });
            fetchNotes();
        } catch (e) { console.error("Failed to save note:", e); } finally { setLoading(false); }
    };

    // --- Helpers ---
    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIp(id);
        setTimeout(() => setCopiedIp(null), 2000);
    };

    const handleNotePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        const currentImages = JSON.parse(editingNote ? editingNote.images : newNote.images);
                        const updatedImages = JSON.stringify([...currentImages, base64]);
                        if (editingNote) setEditingNote({ ...editingNote, images: updatedImages });
                        else setNewNote({ ...newNote, images: updatedImages });
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    };

    const removeImage = (index: number) => {
        const currentImages = JSON.parse(editingNote ? editingNote.images : newNote.images);
        const updatedImages = JSON.stringify(currentImages.filter((_: any, i: number) => i !== index));
        if (editingNote) setEditingNote({ ...editingNote, images: updatedImages });
        else setNewNote({ ...newNote, images: updatedImages });
    };

    const webCategories = ["All", ...Array.from(new Set(websites.map(s => s.category || "General")))];
    const filteredWebsites = webCategoryFilter === "All" ? websites : websites.filter(s => s.category === webCategoryFilter);

    const serverClients = ["All", ...Array.from(new Set(servers.map(s => s.client || "Self")))];
    const serverProviders = ["All", ...Array.from(new Set(servers.map(s => s.provider || "Unknown")))];
    const filteredServers = servers.filter(s => {
        const clientMatch = serverClientFilter === "All" || s.client === serverClientFilter;
        const providerMatch = serverProviderFilter === "All" || s.provider === serverProviderFilter;
        return clientMatch && providerMatch;
    });

    const taskCategories = ["All", ...Array.from(new Set(tasks.map(t => t.category || "General")))];
    const taskClients = ["All", ...Array.from(new Set(tasks.map(t => t.client || "Internal")))];
    const taskStatuses = ["All", "Pending", "In Progress", "Completed", "On Hold"];
    const filteredTasks = tasks.filter(t => {
        const categoryMatch = taskCategoryFilter === "All" || t.category === taskCategoryFilter;
        const clientMatch = taskClientFilter === "All" || t.client === taskClientFilter;
        const statusMatch = taskStatusFilter === "All" || t.status === taskStatusFilter;
        return categoryMatch && clientMatch && statusMatch;
    });

    const allNoteTags = notes.flatMap(n => (n.tags || "").split(",").map(t => t.trim())).filter(t => t !== "");
    const noteTags = ["All", ...Array.from(new Set(allNoteTags))];
    const filteredNotes = noteTagFilter === "All"
        ? notes
        : notes.filter(n => (n.tags || "").split(",").map(t => t.trim()).includes(noteTagFilter));

    const tabs: { id: Tab; icon: any }[] = [
        { id: "Websites", icon: Globe },
        { id: "Servers", icon: Server },
        { id: "Tasks", icon: CheckSquare },
        { id: "Notes", icon: FileText },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed": return "text-emerald-400 bg-emerald-500/10";
            case "In Progress": return "text-amber-400 bg-amber-500/10";
            case "On Hold": return "text-red-400 bg-red-500/10";
            default: return "text-zinc-400 bg-zinc-800";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <button
                    onClick={() => {
                        if (activeTab === "Websites") { setEditingWebsite(null); setNewWebsite({ name: "", link: "", icon: "", description: "", category: "General" }); setIsWebModalOpen(true); }
                        else if (activeTab === "Servers") { setEditingServer(null); setNewServer({ server_name: "", provider: "", provider_link: "", client: "", server_ip: "", description: "" }); setIsServerModalOpen(true); }
                        else if (activeTab === "Tasks") { setEditingTask(null); setNewTask({ task_name: "", category: "General", client: "Internal", status: "Pending", date_created: "", date_completed: "" }); setIsTaskModalOpen(true); }
                        else if (activeTab === "Notes") { setEditingNote(null); setNewNote({ content: "", tags: "", ref_link: "", images: "[]", date_created: "" }); setIsNoteModalOpen(true); }
                    }}
                    className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 cursor-pointer font-medium"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    Add {activeTab.slice(0, -1)}
                </button>
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

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                {activeTab === "Websites" && websites.length > 0 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide text-zinc-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        <Filter size={12} /> Category:
                        {webCategories.map(cat => (
                            <button key={cat} onClick={() => setWebCategoryFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${webCategoryFilter === cat ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"}`}>{cat}</button>
                        ))}
                    </div>
                )}
                {activeTab === "Servers" && servers.length > 0 && (
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide text-zinc-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            <Filter size={12} /> Client:
                            {serverClients.map(cat => (
                                <button key={cat} onClick={() => setServerClientFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${serverClientFilter === cat ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"}`}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide text-zinc-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            <Filter size={12} /> Provider:
                            {serverProviders.map(cat => (
                                <button key={cat} onClick={() => setServerProviderFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${serverProviderFilter === cat ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === "Tasks" && tasks.length > 0 && (
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide text-zinc-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            <Filter size={12} /> Status:
                            {taskStatuses.map(cat => (
                                <button key={cat} onClick={() => setTaskStatusFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${taskStatusFilter === cat ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"}`}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide text-zinc-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            <Filter size={12} /> Category:
                            {taskCategories.map(cat => (
                                <button key={cat} onClick={() => setTaskCategoryFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${taskCategoryFilter === cat ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"}`}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide text-zinc-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            <Filter size={12} /> Client:
                            {taskClients.map(cat => (
                                <button key={cat} onClick={() => setTaskClientFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${taskClientFilter === cat ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === "Notes" && notes.length > 0 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide text-zinc-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        <Filter size={12} /> Tag:
                        {noteTags.map(tag => (
                            <button key={tag} onClick={() => setNoteTagFilter(tag)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${noteTagFilter === tag ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"}`}>{tag}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "Websites" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWebsites.map((site, i) => (
                            <div key={i} className="group relative bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl hover:border-emerald-500/50 hover:bg-zinc-800/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-zinc-700/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all duration-500">{site.icon || "🌐"}</div>
                                    <div className="flex gap-2 relative z-10">
                                        <button onClick={() => { setEditingWebsite(site); setIsWebModalOpen(true); }} className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"><Edit2 size={14} /></button>
                                        <a href={site.link.startsWith('http') ? site.link : `https://${site.link}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"><ExternalLink size={14} /></a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-emerald-500/70 transition-colors">{site.category || "General"}</span></div>
                                <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors duration-300">{site.name}</h3>
                                <p className="text-sm text-zinc-400 line-clamp-3 flex-1 leading-relaxed mb-4">{site.description || "No description provided."}</p>
                                <a href={site.link.startsWith('http') ? site.link : `https://${site.link}`} target="_blank" rel="noopener noreferrer" className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center gap-2 group/btn cursor-pointer">
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold group-hover/btn:text-emerald-500 transition-colors">Visit Site</div>
                                    <div className="h-[1px] flex-1 bg-zinc-800 group-hover/btn:bg-emerald-500/20 transition-colors"></div>
                                    <ExternalLink size={10} className="text-zinc-600 group-hover/btn:text-emerald-500 transition-colors" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "Servers" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredServers.map((server, i) => (
                            <div key={i} className="group relative bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl hover:border-emerald-500/50 hover:bg-zinc-800/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner border border-zinc-700/50 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500"><Activity size={24} /></div>
                                    <div className="flex gap-2 relative z-10">
                                        <button onClick={() => { setEditingServer(server); setIsServerModalOpen(true); }} className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"><Edit2 size={14} /></button>
                                        {server.provider_link && <a href={server.provider_link.startsWith('http') ? server.provider_link : `https://${server.provider_link}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"><ExternalLink size={14} /></a>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-emerald-500/70 transition-colors">{server.client || "Self"}</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{server.provider || "Cloud"}</span>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-100 mb-1 group-hover:text-emerald-400 transition-colors duration-300">{server.server_name}</h3>
                                <div onClick={() => server.server_ip && copyToClipboard(server.server_ip, server.id!)} className="flex items-center justify-between bg-zinc-950/50 border border-zinc-800 px-3 py-2 rounded-xl mt-2 mb-4 cursor-pointer hover:border-emerald-500/30 group/ip transition-all">
                                    <code className="text-xs text-zinc-400 font-mono group-hover/ip:text-emerald-400">{server.server_ip || "0.0.0.0"}</code>
                                    {copiedIp === server.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-zinc-600 group-hover/ip:text-emerald-500 opacity-50" />}
                                </div>
                                <p className="text-sm text-zinc-500 line-clamp-3 flex-1 leading-relaxed mb-4">{server.description || "No description provided."}</p>
                                <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-600"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>Online · Ready</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "Tasks" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTasks.map((task, i) => (
                            <div key={i} className="group relative bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl hover:border-emerald-500/50 hover:bg-zinc-800/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner border border-zinc-700/50 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500"><CheckSquare size={24} /></div>
                                    <div className="flex gap-2 relative z-10"><button onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }} className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"><Edit2 size={14} /></button></div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>{task.status}</span>
                                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{task.client}</span>
                                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{task.category}</span>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-100 mb-4 group-hover:text-emerald-400 transition-colors duration-300">{task.task_name}</h3>
                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-zinc-500"><Calendar size={14} className="text-zinc-600" /><span>Created: {task.date_created}</span></div>
                                    {task.date_completed && <div className="flex items-center gap-2 text-xs text-emerald-500/70 font-medium"><Clock size={14} /><span>Completed: {task.date_completed}</span></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "Notes" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredNotes.map((note, i) => (
                            <div key={i} className="group relative bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl hover:border-emerald-500/50 hover:bg-zinc-800/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner border border-zinc-700/50 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500"><FileText size={24} /></div>
                                    <div className="flex gap-2 relative z-10">
                                        <button onClick={() => { setEditingNote(note); setIsNoteModalOpen(true); }} className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"><Edit2 size={14} /></button>
                                        {note.ref_link && <a href={note.ref_link.startsWith('http') ? note.ref_link : `https://${note.ref_link}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"><LinkIcon size={14} /></a>}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(note.tags || "").split(",").filter(t => t.trim() !== "").map((tag, ti) => (
                                        <span key={ti} className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                            <Hash size={8} /> {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-zinc-100 text-sm whitespace-pre-wrap flex-1 mb-4 line-clamp-6">{note.content}</p>
                                {JSON.parse(note.images || "[]").length > 0 && (
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {JSON.parse(note.images).map((img: string, ii: number) => (
                                            <img key={ii} src={img} className="h-16 w-16 object-cover rounded-lg border border-zinc-800 hover:scale-110 transition-transform cursor-pointer" onClick={() => window.open(img)} />
                                        ))}
                                    </div>
                                )}
                                <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                                    <div className="flex items-center gap-1"><Calendar size={10} /> {note.date_created}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Website Modal */}
            {isWebModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">{editingWebsite ? <Edit2 size={20} /> : <Plus size={20} />}</div><h3 className="text-xl font-bold text-white">{editingWebsite ? "Edit Website" : "New Website"}</h3></div>
                            <button onClick={() => setIsWebModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase ml-1">Name</label><input type="text" value={editingWebsite ? editingWebsite.name : newWebsite.name} onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, name: e.target.value }) : setNewWebsite({ ...newWebsite, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:border-emerald-500/50 transition-all" /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase ml-1">Category</label><input type="text" value={editingWebsite ? editingWebsite.category : newWebsite.category} onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, category: e.target.value }) : setNewWebsite({ ...newWebsite, category: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:border-emerald-500/50 transition-all" /></div>
                            </div>
                            <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase ml-1">Link</label><input type="text" value={editingWebsite ? editingWebsite.link : newWebsite.link} onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, link: e.target.value }) : setNewWebsite({ ...newWebsite, link: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:border-emerald-500/50 transition-all" /></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase ml-1">Icon</label><input type="text" value={editingWebsite ? editingWebsite.icon : newWebsite.icon} onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, icon: e.target.value }) : setNewWebsite({ ...newWebsite, icon: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-2xl text-center outline-none focus:border-emerald-500/50" /></div>
                                <div className="col-span-2 space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase ml-1">Description</label><input type="text" value={editingWebsite ? editingWebsite.description : newWebsite.description} onChange={(e) => editingWebsite ? setEditingWebsite({ ...editingWebsite, description: e.target.value }) : setNewWebsite({ ...newWebsite, description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:border-emerald-500/50" /></div>
                            </div>
                        </div>
                        <div className="p-8 bg-zinc-950/30"><button onClick={saveWebsite} disabled={loading} className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer">{loading ? "Saving..." : (editingWebsite ? "Update Website" : "Create Website")}</button></div>
                    </div>
                </div>
            )}

            {/* Server Modal */}
            {isServerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">{editingServer ? <Edit2 size={20} /> : <Plus size={20} />}</div><h3 className="text-xl font-bold text-white">{editingServer ? "Edit Server" : "New Server"}</h3></div>
                            <button onClick={() => setIsServerModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="space-y-2 text-xs font-bold text-zinc-500 uppercase ml-1">Server Name</div>
                            <input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={editingServer ? editingServer.server_name : newServer.server_name} onChange={(e) => editingServer ? setEditingServer({ ...editingServer, server_name: e.target.value }) : setNewServer({ ...newServer, server_name: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><div className="text-xs font-bold text-zinc-500 uppercase ml-1">Provider</div><input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={editingServer ? editingServer.provider : newServer.provider} onChange={(e) => editingServer ? setEditingServer({ ...editingServer, provider: e.target.value }) : setNewServer({ ...newServer, provider: e.target.value })} /></div>
                                <div className="space-y-2"><div className="text-xs font-bold text-zinc-500 uppercase ml-1">IP</div><input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={editingServer ? editingServer.server_ip : newServer.server_ip} onChange={(e) => editingServer ? setEditingServer({ ...editingServer, server_ip: e.target.value }) : setNewServer({ ...newServer, server_ip: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><div className="text-xs font-bold text-zinc-500 uppercase ml-1">Client</div><input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={editingServer ? editingServer.client : newServer.client} onChange={(e) => editingServer ? setEditingServer({ ...editingServer, client: e.target.value }) : setNewServer({ ...newServer, client: e.target.value })} /></div>
                                <div className="space-y-2"><div className="text-xs font-bold text-zinc-500 uppercase ml-1">Link</div><input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={editingServer ? editingServer.provider_link : newServer.provider_link} onChange={(e) => editingServer ? setEditingServer({ ...editingServer, provider_link: e.target.value }) : setNewServer({ ...newServer, provider_link: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2 text-xs font-bold text-zinc-500 uppercase ml-1">Description</div>
                            <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none h-24 resize-none" value={editingServer ? editingServer.description : newServer.description} onChange={(e) => editingServer ? setEditingServer({ ...editingServer, description: e.target.value }) : setNewServer({ ...newServer, description: e.target.value })} />
                        </div>
                        <div className="p-8 bg-zinc-950/30"><button onClick={saveServer} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer">Save Server</button></div>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">{editingTask ? <Edit2 size={20} /> : <Plus size={20} />}</div><h3 className="text-xl font-bold text-white">{editingTask ? "Edit Task" : "New Task"}</h3></div>
                            <button onClick={() => setIsTaskModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="space-y-2 text-xs font-bold text-zinc-500 uppercase ml-1">Task Name</div>
                            <input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" value={editingTask ? editingTask.task_name : newTask.task_name} onChange={(e) => editingTask ? setEditingTask({ ...editingTask, task_name: e.target.value }) : setNewTask({ ...newTask, task_name: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><div className="text-xs font-bold text-zinc-500 uppercase ml-1">Category</div><input className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 w-full" value={editingTask ? editingTask.category : newTask.category} onChange={(e) => editingTask ? setEditingTask({ ...editingTask, category: e.target.value }) : setNewTask({ ...newTask, category: e.target.value })} /></div>
                                <div className="space-y-2"><div className="text-xs font-bold text-zinc-500 uppercase ml-1">Client</div><input className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 w-full" value={editingTask ? editingTask.client : newTask.client} onChange={(e) => editingTask ? setEditingTask({ ...editingTask, client: e.target.value }) : setNewTask({ ...newTask, client: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2 text-xs font-bold text-zinc-500 uppercase ml-1">Status</div>
                            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" value={editingTask ? editingTask.status : newTask.status} onChange={(e) => editingTask ? setEditingTask({ ...editingTask, status: e.target.value }) : setNewTask({ ...newTask, status: e.target.value })}>
                                <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="On Hold">On Hold</option>
                            </select>
                        </div>
                        <div className="p-8 bg-zinc-950/30"><button onClick={saveTask} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer">Save Task</button></div>
                    </div>
                </div>
            )}

            {/* Note Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                    {editingNote ? <Edit2 size={20} /> : <Plus size={20} />}
                                </div>
                                <h3 className="text-xl font-bold text-white">{editingNote ? "Edit Note" : "New Note"}</h3>
                            </div>
                            <button onClick={() => setIsNoteModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Content (Paste images here)</label>
                                <textarea
                                    value={editingNote ? editingNote.content : newNote.content}
                                    onChange={(e) => editingNote ? setEditingNote({ ...editingNote, content: e.target.value }) : setNewNote({ ...newNote, content: e.target.value })}
                                    onPaste={handleNotePaste}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:border-emerald-500/50 transition-all min-h-[150px] resize-none"
                                    placeholder="Type your note here... You can paste images from clipboard!"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={editingNote ? editingNote.tags : newNote.tags}
                                        onChange={(e) => editingNote ? setEditingNote({ ...editingNote, tags: e.target.value }) : setNewNote({ ...newNote, tags: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:border-emerald-500/50 transition-all"
                                        placeholder="e.g. Ideas, Work, Research"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Reference Link</label>
                                    <input
                                        type="text"
                                        value={editingNote ? editingNote.ref_link : newNote.ref_link}
                                        onChange={(e) => editingNote ? setEditingNote({ ...editingNote, ref_link: e.target.value }) : setNewNote({ ...newNote, ref_link: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:border-emerald-500/50 transition-all"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2"><ImageIcon size={12} /> Images ({JSON.parse(editingNote ? editingNote.images : newNote.images).length})</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {JSON.parse(editingNote ? editingNote.images : newNote.images).map((img: string, idx: number) => (
                                        <div key={idx} className="relative group/img rounded-xl overflow-hidden border border-zinc-800 aspect-square">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity"><X size={12} /></button>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl aspect-square text-zinc-700">
                                        <ImageIcon size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-zinc-950/30">
                            <button
                                onClick={saveNote}
                                disabled={loading || !(editingNote ? editingNote.content : newNote.content)}
                                className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                {loading ? "Capturing..." : (editingNote ? "Update Note" : "Create Note Entry")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
