import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { ShieldCheck, Calendar, Cpu, FileText, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

const LicensePage = () => {
    // Premium License Data - easily configurable
    const licenseDetails = {
        organization: 'RBP / Bharat Radiators Private Limited (BRPL)',
        licenseKey: 'TD-ENTERPRISE-RBP-BRPL-2026-9842A',
        status: 'Active / Verified',
        registeredDate: 'April 10, 2025',
        renewalDate: 'April 09, 2027',
        plan: 'Enterprise Unlimited HODs',
        version: 'v2.4.0 (Stable)',
        developer: 'Botivate Technologies'
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl text-white shadow-md shadow-blue-100">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">System & License Info</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Manage software license parameters and EULA terms</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs font-black uppercase tracking-wider">
                        <CheckCircle2 size={14} className="animate-pulse" />
                        <span>Verified Genuine</span>
                    </div>
                </div>

                {/* License Certificate Panel */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Registered Organization</span>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">{licenseDetails.organization}</h2>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Level</span>
                            <p className="text-sm font-extrabold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-xl mt-0.5 inline-block">{licenseDetails.plan}</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <Key size={13} className="text-gray-400" />
                                <span>License Key</span>
                            </div>
                            <code className="text-xs font-mono font-bold text-gray-800 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg block truncate">{licenseDetails.licenseKey}</code>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <Calendar size={13} className="text-gray-400" />
                                <span>Validity Period</span>
                            </div>
                            <p className="text-xs font-bold text-gray-700">
                                {licenseDetails.registeredDate} <span className="text-gray-400 font-normal">—</span> {licenseDetails.renewalDate}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <Cpu size={13} className="text-gray-400" />
                                <span>Software Core</span>
                            </div>
                            <p className="text-xs font-bold text-gray-700">
                                {licenseDetails.version} <span className="text-gray-400 font-normal">by</span> <span className="text-purple-600 font-black">{licenseDetails.developer}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* EULA Legal Copy */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <FileText size={18} className="text-purple-600" />
                        <h3 className="text-md font-extrabold text-gray-900 tracking-tight">End User License Agreement (EULA)</h3>
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-4 pr-2 text-xs text-gray-500 leading-relaxed scrollbar-thin">
                        <section className="space-y-1.5">
                            <h4 className="font-extrabold text-gray-800 uppercase tracking-wide">1. Grant of License</h4>
                            <p>
                                Subject to the terms and conditions of this Agreement, Botivate Technologies hereby grants the Licensee a limited, non-exclusive, non-transferable license to deploy, execute, and utilize the TaskDesk software system solely for internal operational workflows, task scheduling, checklist maintenance, and performance compliance auditing.
                            </p>
                        </section>

                        <section className="space-y-1.5">
                            <h4 className="font-extrabold text-gray-800 uppercase tracking-wide">2. Ownership and Intellectual Property</h4>
                            <p>
                                The software, all source code, assets, UI components, structural paradigms, database schemas, and documentation are the exclusive intellectual property of Botivate Technologies. All title, ownership rights, copyright, and patent privileges remain entirely with the original developers.
                            </p>
                        </section>

                        <section className="space-y-1.5">
                            <h4 className="font-extrabold text-gray-800 uppercase tracking-wide">3. Permitted Usage & Scope</h4>
                            <p>
                                Under the Enterprise Plan issued to RBP / Bharat Radiators Private Limited, Licensee is permitted to host the software on dedicated database environments, register an unlimited number of departments, HODs, and operator accounts, and store data backups in dedicated Supabase buckets. Reverse-engineering, redistribution, sub-licensing, or resale of any system component is strictly prohibited.
                            </p>
                        </section>

                        <section className="space-y-1.5">
                            <h4 className="font-extrabold text-gray-800 uppercase tracking-wide">4. Limitation of Liability</h4>
                            <p>
                                TaskDesk is provided "AS IS" without warranty of any kind. Botivate Technologies shall not be liable for any operational losses, scheduling discrepancies, WhatsApp gateway delays, or third-party storage costs arising from client-specific network conditions or database modifications.
                            </p>
                        </section>

                        <section className="space-y-1.5">
                            <h4 className="font-extrabold text-gray-800 uppercase tracking-wide">5. Support & Renewal Terms</h4>
                            <p>
                                Standard technical maintenance and database schema synchronization are provided for the active duration of the license subscription. Annual compliance checks and key validation are performed automatically. Next verification query is scheduled for April 2027.
                            </p>
                        </section>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-3 text-blue-700 text-xs mt-2">
                        <AlertTriangle size={16} className="flex-shrink-0 self-start mt-0.5" />
                        <div>
                            <span className="font-bold uppercase tracking-wider block mb-0.5">License Compliance Notice</span>
                            <span>This installation is registered to {licenseDetails.organization}. Modification of system core variables or unlicensed reproduction of these UI blueprints will void warranty and standard WhatsApp delivery support.</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default LicensePage;
