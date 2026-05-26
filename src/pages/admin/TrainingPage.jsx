import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Video, Play, Clock, BookOpen, CheckCircle2 } from 'lucide-react';

const TrainingPage = () => {
    // Single Training Video Config
    const trainingVideo = {
        title: 'Checklist & Delegation Complete System Walkthrough',
        description: 'Watch this comprehensive training video to master all the features of Checklist & Delegation. This guide covers task assignment protocols, checklist verification steps, maintenance reporting, delegation workflows, and the admin dashboard settings overview.',
        duration: '12:45',
        youtubeUrl: 'https://www.youtube.com/embed/v2yqJc1CKBA', // Configurable video link
        author: 'Checklist & Delegation Onboarding Team'
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl text-white shadow-md shadow-blue-100">
                            <Video size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Training & Tutorial</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Learn how to manage and perform operations on Checklist & Delegation</p>
                        </div>
                    </div>
                </div>

                {/* Main Video Presentation Card */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Full Size Player Container */}
                    <div className="relative aspect-video bg-black shadow-inner">
                        <iframe
                            className="absolute inset-0 w-full h-full border-0"
                            src={trainingVideo.youtubeUrl}
                            title={trainingVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Video Metadata & Description */}
                    <div className="p-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-3.5 border-b border-gray-100 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                Core Training
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                <Clock size={14} className="text-gray-400" />
                                <span>{trainingVideo.duration} Minutes</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                <BookOpen size={14} className="text-gray-400" />
                                <span>{trainingVideo.author}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">{trainingVideo.title}</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">{trainingVideo.description}</p>
                        </div>

                        {/* Learning Objectives Grid */}
                        <div className="pt-2">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">What You Will Learn</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-start gap-2.5 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                    <CheckCircle2 size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Assigning and managing checklist items & recurring schedules correctly.</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                    <CheckCircle2 size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Uploading compliance evidence (sound tests, audio notes, and photos).</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                    <CheckCircle2 size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Monitoring status logs and reviewing approvals in real-time.</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                    <CheckCircle2 size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Configuring company calendars, custom holidays, and notification rules.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TrainingPage;
