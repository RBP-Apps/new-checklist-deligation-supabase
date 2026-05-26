import { useRef, useEffect, useState, useMemo } from "react";
import { Users, Phone, Calendar, FileText, CheckCircle, Clock, AlertCircle, ArrowUpRight, TrendingUp, UserCheck, PieChart, Play, Pause, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AudioPlayer from "../../../../components/AudioPlayer";
import supabase from "../../../../SupabaseClient";

const isAudioUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('http') && (
        url.includes('audio-recordings') ||
        url.includes('voice-notes') ||
        url.match(/\.(mp3|wav|ogg|webm|m4a|aac)(\?.*)?$/i)
    );
};



const EaStatsRow = ({ title, subtitle, stats, theme, scope = "overview" }) => {
    const navigate = useNavigate();

    const handleCardClick = (filterType, showHistoryValue = false) => {
        navigate('/dashboard/task', {
            state: {
                filter: filterType,
                tab: 'ea',
                showHistory: showHistoryValue,
                scope: scope
            }
        });
    };

    const themes = {
        indigo: { bg: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-700', gradient: 'from-indigo-500 to-blue-600' },
        emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-500 to-teal-500' },
        amber: { bg: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-700', gradient: 'from-amber-500 to-orange-500' },
    };
    const t = themes[theme] || themes.indigo;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-black text-gray-800 tracking-tight">{title}</h2>
                    {subtitle && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{subtitle}</p>}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.bg} ${t.text} ${t.border} border`}>
                    EA Analytics
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div 
                    onClick={() => handleCardClick('all', false)}
                    className={`cursor-pointer hover:-translate-y-1 transition-transform relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${t.gradient} text-white shadow-sm flex flex-col justify-between`}
                >
                    <div className="relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Tasks</span>
                        <div className="text-3xl font-black mt-1">{stats.total}</div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
                </div>

                <div 
                    onClick={() => handleCardClick('all', true)}
                    className="cursor-pointer rounded-xl p-4 bg-gray-50/80 border border-gray-100 flex flex-col justify-between group hover:bg-emerald-50/80 hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-emerald-700 transition-colors">Completed</span>
                    </div>
                    <div className="text-2xl font-black text-gray-800 mt-3 group-hover:text-emerald-700 transition-colors">{stats.completed}</div>
                </div>

                <div 
                    onClick={() => handleCardClick('today', false)}
                    className="cursor-pointer rounded-xl p-4 bg-gray-50/80 border border-gray-100 flex flex-col justify-between group hover:bg-indigo-50/80 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-indigo-700 transition-colors">Pending</span>
                    </div>
                    <div className="text-2xl font-black text-gray-800 mt-3 group-hover:text-indigo-700 transition-colors">{stats.pending}</div>
                </div>

                <div 
                    onClick={() => handleCardClick('all', false)}
                    className="cursor-pointer rounded-xl p-4 bg-gray-50/80 border border-gray-100 flex flex-col justify-between group hover:bg-amber-50/80 hover:border-amber-100 hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-amber-700 transition-colors">Extended</span>
                    </div>
                    <div className="text-2xl font-black text-gray-800 mt-3 group-hover:text-amber-700 transition-colors">{stats.extended}</div>
                </div>

                <div 
                    onClick={() => handleCardClick('overdue', false)}
                    className="cursor-pointer rounded-xl p-4 bg-gray-50/80 border border-gray-100 flex flex-col justify-between group hover:bg-rose-50/80 hover:border-rose-100 hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-rose-700 transition-colors">Overdue</span>
                    </div>
                    <div className="text-2xl font-black text-gray-800 mt-3 group-hover:text-rose-700 transition-colors">{stats.overdue}</div>
                </div>
            </div>
        </div>
    );
};

export default function EAView() {
    const userRole = (localStorage.getItem('role') || "").toLowerCase();
    const [eaTasks, setEATasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        overdue: 0,
        extended: 0,
        doersCount: 0
    });
    const [myTaskStats, setMyTaskStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0, extended: 0 });
    const [assignedByMeStats, setAssignedByMeStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0, extended: 0 });
    const [doerStats, setDoerStats] = useState([]);

    // Editing State
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const handleEditClick = (task) => {
        setEditingTaskId(task.task_id);
        setEditFormData({
            ...task,
            // ensure date is formatted for input
            planned_date: task.planned_date ? new Date(task.planned_date).toISOString().split('T')[0] : ''
        });
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditFormData({});
    };

    const handleInputChange = (field, value) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('new_ea_tasks')
                .update({
                    doer_name: editFormData.doer_name,
                    phone_number: editFormData.phone_number,
                    task_description: editFormData.task_description,
                    planned_date: editFormData.planned_date,
                    remarks: editFormData.remarks,
                    status: editFormData.status
                })
                .eq('task_id', editingTaskId);

            if (error) throw error;

            await fetchEATasks();
            setEditingTaskId(null);
        } catch (err) {
            console.error("Failed to update EA task:", err);
            alert("Failed to update task");
        } finally {
            setIsSaving(false);
        }
    };

    // Admin approval function
    const handleApproveTask = async (taskId) => {
        try {
            const { error } = await supabase
                .from('new_ea_tasks')
                .update({ status: 'approved' })
                .eq('task_id', taskId);

            if (error) throw error;

            await fetchEATasks();
        } catch (err) {
            console.error("Failed to approve task:", err);
            alert("Failed to approve task");
        }
    };

    const [view, setView] = useState('active'); // 'active', 'upcoming', or 'completed'

    useEffect(() => {
        fetchEATasks();
    }, []);

    const fetchEATasks = async () => {
        try {
            setLoading(true);
            const userRole = localStorage.getItem('role');
            const username = localStorage.getItem('user-name');

            let query = supabase
                .from('new_ea_tasks')
                .select('*')
                .order('planned_date', { ascending: true });

            const { data, error } = await query;
            if (error) throw error;

            let tasks = data || [];

            // Filter for non-admin users
            if (userRole !== 'admin' && username) {
                tasks = tasks.filter(t =>
                    (t.doer_name && t.doer_name.toLowerCase() === username.toLowerCase()) ||
                    (t.given_by && t.given_by.toLowerCase() === username.toLowerCase())
                );
            }

            setEATasks(tasks);
            calculateStats(tasks);
        } catch (err) {
            console.error('Error fetching EA tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const tableTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (view === 'active') {
            return eaTasks.filter(t => {
                const isApproved = (t.status?.toLowerCase() === 'approved') || (t.status?.toLowerCase() === 'done' && t.admin_done);
                if (isApproved) return false;

                const referenceDate = t.task_start_date || t.planned_date;
                if (!referenceDate) return true;

                const taskDate = new Date(referenceDate);
                taskDate.setHours(0, 0, 0, 0);

                // For active, show tasks that are for today or in the past
                return taskDate <= today || t.status?.toLowerCase() === 'extended' || t.status?.toLowerCase() === 'extend';
            });
        } else if (view === 'upcoming') {
            return eaTasks.filter(t => {
                const isApproved = (t.status?.toLowerCase() === 'approved') || (t.status?.toLowerCase() === 'done' && t.admin_done);
                if (isApproved) return false;

                const referenceDate = t.task_start_date || t.planned_date;
                if (!referenceDate) return false;

                const taskDate = new Date(referenceDate);
                taskDate.setHours(0, 0, 0, 0);

                // For upcoming, show tasks that are for tomorrow or later
                return taskDate > today && t.status?.toLowerCase() !== 'extended' && t.status?.toLowerCase() !== 'extend';
            });
        } else {
            // Completed view: show all approved/admin_done tasks
            return eaTasks.filter(t => (t.status?.toLowerCase() === 'approved') || (t.status?.toLowerCase() === 'done' && t.admin_done));
        }
    }, [eaTasks, view]);

    const calculateStats = (tasks) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const calcForTasks = (taskList) => {
            const activeOrDoneTasks = taskList.filter(t => {
                const isCompleted = (t.status?.toLowerCase() === 'done' && t.admin_done) || t.status?.toLowerCase() === 'approved';
                if (isCompleted) return true;

                const referenceDate = t.task_start_date || t.planned_date;
                if (!referenceDate) return true;

                const taskDate = new Date(referenceDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate <= today || t.status?.toLowerCase() === 'extended' || t.status?.toLowerCase() === 'extend';
            });

            const total = activeOrDoneTasks.length;

            const pending = activeOrDoneTasks.filter(t =>
                (t.status?.toLowerCase() === 'pending' || (t.status?.toLowerCase() === 'done' && !t.admin_done))
            ).length;

            const completed = activeOrDoneTasks.filter(t =>
                (t.status?.toLowerCase() === 'done' && t.admin_done) || t.status?.toLowerCase() === 'approved'
            ).length;

            const extended = activeOrDoneTasks.filter(t => t.status?.toLowerCase() === 'extended').length;

            const overdue = activeOrDoneTasks.filter(t => {
                if (!t.planned_date) return false;
                const plannedStr = new Date(t.planned_date).toISOString().split('T')[0];
                return (t.status?.toLowerCase() === 'pending' || t.status?.toLowerCase() === 'extended') && plannedStr < todayStr;
            }).length;

            return { total, pending, completed, extended, overdue };
        };

        const overallStats = calcForTasks(tasks);

        const username = (localStorage.getItem('user-name') || '').toLowerCase();
        
        const myTasks = tasks.filter(t => (t.doer_name || '').toLowerCase() === username);
        const myStats = calcForTasks(myTasks);

        const assignedByMeTasks = tasks.filter(t => (t.given_by || '').toLowerCase() === username);
        const assignedByMeStats = calcForTasks(assignedByMeTasks);

        // Calculate doer statistics based on the same filtered set for overall tasks
        const doerMap = {};
        tasks.filter(t => {
            const isCompleted = (t.status?.toLowerCase() === 'done' && t.admin_done) || t.status?.toLowerCase() === 'approved';
            if (isCompleted) return true;
            const referenceDate = t.task_start_date || t.planned_date;
            if (!referenceDate) return true;
            const taskDate = new Date(referenceDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate <= today || t.status?.toLowerCase() === 'extended' || t.status?.toLowerCase() === 'extend';
        }).forEach(t => {
            const name = t.doer_name || 'Unknown';
            if (!doerMap[name]) {
                doerMap[name] = { total: 0, completed: 0, pending: 0 };
            }
            doerMap[name].total++;
            if ((t.status?.toLowerCase() === 'done' && t.admin_done) || t.status?.toLowerCase() === 'approved') {
                doerMap[name].completed++;
            } else {
                doerMap[name].pending++;
            }
        });

        const doerList = Object.entries(doerMap)
            .map(([name, statsObj]) => ({ name, ...statsObj }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        setStats({ ...overallStats, doersCount: Object.keys(doerMap).length });
        setMyTaskStats(myStats);
        setAssignedByMeStats(assignedByMeStats);
        setDoerStats(doerList);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getStatusStyles = (status, plannedDate, adminDone, taskStartDate) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const plannedStr = plannedDate ? new Date(plannedDate).toISOString().split('T')[0] : '';
        const startStr = taskStartDate ? new Date(taskStartDate).toISOString().split('T')[0] : plannedStr;

        // If it's extended, we follow the new planned date for overdue check
        const isOverdue = (status === 'pending' || status === 'extended' || status === 'extend') && plannedStr && plannedStr < todayStr;

        if (isOverdue) return {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-100',
            label: 'Overdue'
        };

        // Check admin_done for approval status
        if (status?.toLowerCase() === 'done' && adminDone) {
            return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'Approved' };
        }

        switch (status?.toLowerCase()) {
            case 'done':
                return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', label: 'Pending Approval' };
            case 'extended':
                return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', label: 'Extended' };
            default:
                return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', label: 'Pending' };
        }
    };

    const calculatePercentage = (value, total) => {
        if (!total) return 0;
        return Math.round((value / total) * 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="text-center">
                    <div className="relative h-16 w-16 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-500 font-bold tracking-tight uppercase text-xs">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500">
            {userRole !== 'user' && (
                <EaStatsRow 
                    title="Department Overview" 
                    subtitle="All tasks across the executive department"
                    stats={stats} 
                    theme="indigo" 
                    scope="overview"
                />
            )}

            <EaStatsRow 
                title="My Tasks" 
                subtitle="Tasks assigned directly to you"
                stats={myTaskStats} 
                theme="emerald" 
                scope="my_tasks"
            />

            <EaStatsRow 
                title="Tasks Assigned By Me" 
                subtitle="Tasks you have delegated to others"
                stats={assignedByMeStats} 
                theme="amber" 
                scope="assigned_by_me"
            />

            {/* Task Console */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setView('active')}
                            className={`pb-4 pt-1 text-xs font-black uppercase tracking-widest relative transition-all ${view === 'active' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Active Console
                            {view === 'active' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setView('upcoming')}
                            className={`pb-4 pt-1 text-xs font-black uppercase tracking-widest relative transition-all ${view === 'upcoming' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Upcoming Plan
                            {view === 'upcoming' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setView('completed')}
                            className={`pb-4 pt-1 text-xs font-black uppercase tracking-widest relative transition-all ${view === 'completed' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Completed Archive
                            {view === 'completed' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse delay-75"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse delay-150"></div>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-sm">
                            <tr className="bg-gray-50/30">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Target Task</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Planned Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Remarks Data</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tableTasks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">
                                        No intelligence data found in this view
                                    </td>
                                </tr>
                            ) : (
                                tableTasks.map((task) => {
                                    const styles = getStatusStyles(task.status, task.planned_date, task.admin_done, task.task_start_date);
                                    return (
                                        <tr
                                            key={task.task_id}
                                            className="hover:bg-gray-50/50 group transition-colors cursor-pointer"
                                            onDoubleClick={() => handleEditClick(task)}
                                        >
                                            <td className="px-6 py-4">
                                                {editingTaskId === task.task_id ? (
                                                    <input
                                                        type="text"
                                                        value={editFormData.doer_name || ''}
                                                        onChange={(e) => handleInputChange('doer_name', e.target.value)}
                                                        className="w-full text-xs p-1 border rounded"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-[10px] uppercase border border-gray-200 shadow-sm group-hover:bg-white transition-colors">
                                                            {task.doer_name ? task.doer_name.slice(0, 2) : 'EA'}
                                                        </div>
                                                        <div className="text-xs font-black text-gray-800 uppercase leading-none">{task.doer_name || 'Unknown'}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingTaskId === task.task_id ? (
                                                    <input
                                                        type="text"
                                                        value={editFormData.phone_number || ''}
                                                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                                        className="w-full text-xs p-1 border rounded"
                                                    />
                                                ) : (
                                                    <div className="text-[10px] text-gray-600 font-bold flex items-center gap-1">
                                                        <Phone size={10} className="text-indigo-400" /> {task.phone_number || 'HIDDEN'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingTaskId === task.task_id ? (
                                                    <textarea
                                                        value={editFormData.task_description || ''}
                                                        onChange={(e) => handleInputChange('task_description', e.target.value)}
                                                        className="w-full text-xs p-1 border rounded"
                                                        rows={2}
                                                    />
                                                ) : (
                                                    <div className="max-w-xs group-hover:max-w-sm transition-all duration-300 space-y-2">
                                                        {task.task_description && !isAudioUrl(task.task_description) && (
                                                            <p className="text-xs font-medium text-gray-600 line-clamp-3 leading-relaxed italic border-l-2 border-indigo-100 pl-3">
                                                                "{task.task_description}"
                                                            </p>
                                                        )}
                                                        {(task.audio_url || isAudioUrl(task.task_description)) && (
                                                            <AudioPlayer url={task.audio_url || task.task_description} />
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-gray-400" />
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                                        {formatDate(task.task_start_date || task.planned_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingTaskId === task.task_id ? (
                                                    <input
                                                        type="date"
                                                        value={editFormData.planned_date || ''}
                                                        onChange={(e) => handleInputChange('planned_date', e.target.value)}
                                                        className="w-full text-xs p-1 border rounded"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={12} className="text-indigo-400" />
                                                        <span className={`text-[11px] font-black uppercase tracking-tight ${styles.label === 'Overdue' ? 'text-rose-600 animate-pulse' : 'text-gray-800'}`}>
                                                            {formatDate(task.planned_date)}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingTaskId === task.task_id ? (
                                                    <input
                                                        type="text"
                                                        value={editFormData.remarks || ''}
                                                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                                                        className="w-full text-xs p-1 border rounded"
                                                    />
                                                ) : (
                                                    <div className="text-xs text-gray-600 font-medium">
                                                        {task.remarks || '—'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {editingTaskId === task.task_id ? (
                                                    <div className="flex flex-col gap-2">
                                                        <select
                                                            value={editFormData.status || 'pending'}
                                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                                            className="text-xs p-1 border rounded mb-1"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="done">Done</option>
                                                            <option value="approved">Approved</option>
                                                            <option value="extended">Extended</option>
                                                        </select>
                                                        <div className="flex gap-1 justify-center">
                                                            <button onClick={handleSaveEdit} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                                                                <Save size={12} />
                                                            </button>
                                                            <button onClick={handleCancelEdit} className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles.bg} ${styles.text} ${styles.border} shadow-sm group-hover:shadow transition-all`}>
                                                        {styles.label}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Full archive button removed as all tasks are shown */}
            </div>
        </div>
    );
}
