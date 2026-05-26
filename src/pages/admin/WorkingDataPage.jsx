import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Calendar, Clock, RefreshCw, Search, Send, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import supabase from '../../SupabaseClient';

const WorkingDataPage = () => {
    const [activeTab, setActiveTab] = useState('working-date'); // 'working-date' or 'history'
    const [workingLogs, setWorkingLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [personFilter, setPersonFilter] = useState('all');
    const [usingFallback, setUsingFallback] = useState(false);

    // Live Clock State
    const [liveTime, setLiveTime] = useState(new Date());

    // Date Details Editor State
    const [dateDetails, setDateDetails] = useState({
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) // HH:MM
    });

    // Schedule Time Slots Definition (13 slots)
    const timeSlots = [
        '09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM',
        '02:30 PM', '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM',
        '07:30 PM', '08:30 PM', '09:30 PM'
    ];

    // Daily Schedule Inputs State
    const [scheduleInputs, setScheduleInputs] = useState(
        timeSlots.reduce((acc, slot) => {
            acc[slot] = { working_details: '', qty: '' };
            return acc;
        }, {})
    );

    // Running clock effect
    useEffect(() => {
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchWorkingLogs();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await supabase
                .from('new_users')
                .select('user_name, reported_by')
                .order('user_name', { ascending: true });
            if (data) {
                setUsers(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchWorkingLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('new_workingdate')
                .select('*')
                .order('date', { ascending: false })
                .order('time', { ascending: false });

            if (error) {
                if (error.code === '42P01') {
                    setUsingFallback(true);
                    const localData = localStorage.getItem('new_workingdate');
                    setWorkingLogs(localData ? JSON.parse(localData) : []);
                } else {
                    throw error;
                }
            } else {
                setWorkingLogs(data || []);
                setUsingFallback(false);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
            setUsingFallback(true);
            const localData = localStorage.getItem('new_workingdate');
            setWorkingLogs(localData ? JSON.parse(localData) : []);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format Live Time in "Saturday, 16 May 2026" & "10:55:33 am" format
    const formatLiveDate = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatLiveTime = (date) => {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        return `${hours}:${minutes}:${seconds} ${ampm}`;
    };

    // Clear all inputs helper
    const handleClearAll = () => {
        if (window.confirm('Clear all schedule slots?')) {
            setScheduleInputs(
                timeSlots.reduce((acc, slot) => {
                    acc[slot] = { working_details: '', qty: '' };
                    return acc;
                }, {})
            );
        }
    };

    // Convert AM/PM Slot to database compatible HH:MM:SS format
    const convertSlotToTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') {
            hours = modifier === 'AM' ? '00' : '12';
        } else if (modifier === 'PM') {
            hours = String(parseInt(hours, 10) + 12);
        }
        
        return `${hours.padStart(2, '0')}:${minutes}:00`;
    };

    // Submit Working Details logic
    const handleSubmitWorkingDetails = async () => {
        const loggedInUser = localStorage.getItem('user-name') || 'Maheshwar Lal';
        
        // Filter slots that have any text typed in working_details
        const activeSubmissions = timeSlots
            .filter(slot => scheduleInputs[slot].working_details.trim() !== '')
            .map(slot => {
                const randomUniqueSuffix = Math.floor(100 + Math.random() * 900); // e.g. 854
                return {
                    date: dateDetails.date,
                    time: convertSlotToTime(slot),
                    unique_number: `W${randomUniqueSuffix}`,
                    name_of_person: loggedInUser,
                    working_details: scheduleInputs[slot].working_details,
                    qty: scheduleInputs[slot].qty || '-',
                    timestamp: new Date(new Date().getTime() + (330 * 60000)).toISOString().replace('Z', '+05:30')
                };
            });

        if (activeSubmissions.length === 0) {
            alert('Please add working details for at least one time slot before submitting.');
            return;
        }

        try {
            setIsSubmitting(true);

            if (usingFallback) {
                const localData = localStorage.getItem('new_workingdate');
                const existing = localData ? JSON.parse(localData) : [];
                const preparedList = [
                    ...activeSubmissions.map((sub, index) => ({
                        id: 'local_' + (Date.now() + index),
                        ...sub
                    })),
                    ...existing
                ];
                localStorage.setItem('new_workingdate', JSON.stringify(preparedList));
                setWorkingLogs(preparedList);
                alert(`Successfully logged ${activeSubmissions.length} schedule entries (Sandbox Mode)!`);
            } else {
                const { error } = await supabase
                    .from('new_workingdate')
                    .insert(activeSubmissions);

                if (error) throw error;
                fetchWorkingLogs();
                alert(`Successfully saved ${activeSubmissions.length} schedule entries to database!`);
            }

            // Reset only the submitted slots
            setScheduleInputs(prev => {
                const updated = { ...prev };
                activeSubmissions.forEach(sub => {
                    // Match back sub.time to slot string
                    const matchedSlot = timeSlots.find(s => convertSlotToTime(s) === sub.time);
                    if (matchedSlot) {
                        updated[matchedSlot] = { working_details: '', qty: '' };
                    }
                });
                return updated;
            });
        } catch (err) {
            console.error('Error saving schedule entries:', err);
            alert(`Error: ${err.message || 'Unknown error occurred.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLog = async (log) => {
        const me = (localStorage.getItem('user-name') || '').toLowerCase();
        const role = (localStorage.getItem('role') || '').toLowerCase();
        const isOwner = (log.name_of_person || '').toLowerCase() === me;
        const isAdmin = role === 'admin' || role === 'superadmin';

        if (!isAdmin && !isOwner) {
            alert('You do not have permission to delete this log entry.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this log entry?')) return;

        try {
            if (usingFallback) {
                const updatedList = workingLogs.filter(l => l.id !== log.id);
                localStorage.setItem('new_workingdate', JSON.stringify(updatedList));
                setWorkingLogs(updatedList);
            } else {
                const { error } = await supabase
                    .from('new_workingdate')
                    .delete()
                    .eq('id', log.id);

                if (error) throw error;
                fetchWorkingLogs();
            }
        } catch (err) {
            console.error('Error deleting record:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const loggedInUser = localStorage.getItem('user-name') || 'Maheshwar Lal';
    const userRole = (localStorage.getItem('role') || 'user').toLowerCase();

    // Filter logs based on user access control rules
    const allowedLogs = workingLogs.filter(log => {
        const nameOfPerson = (log.name_of_person || '').toLowerCase();
        const me = loggedInUser.toLowerCase();

        if (userRole === 'user') {
            // Regular user: can ONLY see their own records
            return nameOfPerson === me;
        } else if (userRole === 'hod') {
            // HOD: can ONLY see themselves and users reported to them
            const reportingUsersLower = users
                .filter(u => (u.reported_by || '').toLowerCase() === me)
                .map(u => (u.user_name || '').toLowerCase());
            
            const isReport = reportingUsersLower.includes(nameOfPerson);
            const isMe = nameOfPerson === me;
            return isMe || isReport;
        }
        // Admin, Superadmin, COO, Directors, etc.: can see all logs
        return true;
    });

    // Filtered lists logic
    const filteredLogs = allowedLogs.filter(log => {
        const matchesSearch = searchTerm === '' ||
            (log.name_of_person || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.unique_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.working_details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.qty || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPerson = personFilter === 'all' || log.name_of_person === personFilter;

        return matchesSearch && matchesPerson;
    });

    // Populate distinct person names for dropdown filter (only showing allowed names to prevent confusion)
    const uniquePersons = Array.from(new Set(allowedLogs.map(l => l.name_of_person))).sort();

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Modern Navigation Tabs */}
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setActiveTab('working-date')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                            activeTab === 'working-date'
                                ? 'bg-white text-gray-900 border border-gray-200/80 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Calendar size={16} className={activeTab === 'working-date' ? 'text-blue-600' : 'text-gray-400'} />
                        Daily Timesheet
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                            activeTab === 'history'
                                ? 'bg-white text-gray-900 border border-gray-200/80 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Clock size={16} className={activeTab === 'history' ? 'text-blue-600' : 'text-gray-400'} />
                        History
                    </button>
                </div>

                {/* Tab 1: Working Date Form Panel */}
                {activeTab === 'working-date' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 relative">
                        
                        {/* Sandbox Notice */}
                        {usingFallback && (
                            <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-md">
                                Offline Sandbox Mode Active
                            </div>
                        )}

                        {/* Top Info Row */}
                        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                            {/* Live Date & Time Widget */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 w-full lg:w-80 flex flex-col justify-between shadow-lg shadow-blue-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-200">
                                        <Calendar size={13} />
                                        <span>Current Date & Time</span>
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        Live
                                    </span>
                                </div>
                                <div className="mt-4 space-y-1">
                                    <p className="text-sm font-bold text-blue-100">{formatLiveDate(liveTime)}</p>
                                    <h2 className="text-3xl font-black tracking-tight">{formatLiveTime(liveTime)}</h2>
                                </div>
                            </div>

                            {/* Date Details Form Editor */}
                            <div className="flex-grow border border-gray-100/80 rounded-2xl p-5 bg-gray-50/30 flex flex-col justify-between relative">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Date Details</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                        Editable
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateDetails.date}
                                                onChange={(e) => setDateDetails({ ...dateDetails, date: e.target.value })}
                                                className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                                            />
                                            <Calendar size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Time</label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={dateDetails.time}
                                                onChange={(e) => setDateDetails({ ...dateDetails, time: e.target.value })}
                                                className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                                            />
                                            <Clock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[11px] text-gray-400 font-medium mt-3 italic">
                                    Select the date and time for your daily submission
                                </p>
                            </div>
                        </div>

                        {/* Daily Schedule Slots */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Daily Schedule</h3>
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Time Slots Form Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-2">Time Slot</div>
                                <div className="col-span-6">Working Details</div>
                                <div className="col-span-4">Quantity</div>
                            </div>

                            {/* Slot Rows */}
                            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                                {timeSlots.map((slot) => (
                                    <div
                                        key={slot}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center p-3 md:p-1 hover:bg-gray-50/50 rounded-xl transition-all border border-gray-100 md:border-0"
                                    >
                                        {/* Time Slot label */}
                                        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                <Clock size={14} />
                                            </div>
                                            <span className="text-sm font-extrabold text-gray-800">{slot}</span>
                                        </div>

                                        {/* Working Details input */}
                                        <div className="col-span-1 md:col-span-6">
                                            <input
                                                type="text"
                                                placeholder="Add notes for this slot..."
                                                value={scheduleInputs[slot].working_details}
                                                onChange={(e) =>
                                                    setScheduleInputs({
                                                        ...scheduleInputs,
                                                        [slot]: { ...scheduleInputs[slot], working_details: e.target.value }
                                                    })
                                                }
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
                                            />
                                        </div>

                                        {/* Quantity input */}
                                        <div className="col-span-1 md:col-span-4">
                                            <input
                                                type="text"
                                                placeholder="PLEASE QUANTIFY THE YOUR WORK U HAVE DONE FOR EXAMPLE IF YOU M..."
                                                value={scheduleInputs[slot].qty}
                                                onChange={(e) =>
                                                    setScheduleInputs({
                                                        ...scheduleInputs,
                                                        [slot]: { ...scheduleInputs[slot], qty: e.target.value }
                                                    })
                                                }
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 placeholder-gray-400 text-ellipsis truncate"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button Bar */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSubmitWorkingDetails}
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all flex items-center gap-2"
                            >
                                <Send size={14} />
                                Submit Working Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab 2: Submission History Panel */}
                {activeTab === 'history' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                        
                        {/* Title Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight">Submission History</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">View previous Daily Timesheet submissions</p>
                            </div>

                            {/* Control Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Person Filter Dropdown */}
                                <select
                                    value={personFilter}
                                    onChange={(e) => setPersonFilter(e.target.value)}
                                    className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="all">All Persons</option>
                                    {uniquePersons.map((p, i) => (
                                        <option key={i} value={p}>{p}</option>
                                    ))}
                                </select>

                                {/* Search Details input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search details..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white w-48 sm:w-56"
                                    />
                                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>

                                {/* Refresh Button */}
                                <button
                                    onClick={fetchWorkingLogs}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* History Logs Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Time</th>
                                        <th className="px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Person Name</th>
                                        <th className="px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Working Details</th>
                                        <th className="px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Quantity</th>
                                        <th className="px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Submitted</th>
                                        <th className="px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-12 text-center text-gray-400 italic">
                                                <RefreshCw size={20} className="animate-spin mx-auto text-blue-600 mb-2" />
                                                Loading submissions...
                                            </td>
                                        </tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-12 text-center text-gray-400 font-bold">
                                                NO PREVIOUS SUBMISSIONS FOUND
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* Date */}
                                                <td className="px-4 py-3.5 font-bold text-gray-900">
                                                    {log.date}
                                                </td>
                                                {/* Time Slot */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1 text-blue-600 font-bold text-xs bg-blue-50/60 px-2 py-0.5 rounded-lg border border-blue-100/50 w-max">
                                                        <Clock size={12} />
                                                        {log.time}
                                                    </div>
                                                </td>
                                                {/* Unique ID Badge */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                        {log.unique_number || `W${log.id}`}
                                                    </span>
                                                </td>
                                                {/* Person Name */}
                                                <td className="px-4 py-3.5 font-extrabold text-gray-800">
                                                    {log.name_of_person}
                                                </td>
                                                {/* Working Details */}
                                                <td className="px-4 py-3.5 max-w-sm">
                                                    <p className="text-xs text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">
                                                        {log.working_details}
                                                    </p>
                                                </td>
                                                {/* Quantity */}
                                                <td className="px-4 py-3.5 font-bold text-gray-800">
                                                    {log.qty || '-'}
                                                </td>
                                                {/* Submission Timestamp */}
                                                <td className="px-4 py-3.5 text-xs text-gray-400 font-medium">
                                                    {log.timestamp
                                                        ? new Date(log.timestamp).toLocaleString('en-GB', {
                                                              day: '2-digit',
                                                              month: '2-digit',
                                                              year: 'numeric',
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                              hour12: true
                                                          }).toUpperCase()
                                                        : '—'}
                                                </td>
                                                {/* Delete trigger */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <button
                                                        onClick={() => handleDeleteLog(log)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default WorkingDataPage;
