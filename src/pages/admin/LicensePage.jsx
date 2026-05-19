import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FileText, Mail, Globe } from 'lucide-react';

const LicensePage = () => {
    // Get the current user name and role from localStorage to show in the badge
    const username = localStorage.getItem("user-name") || "User";
    const userRole = localStorage.getItem("role") || "User";

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6 p-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl text-white shadow-md shadow-blue-100">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">License Agreement</h1>
                            <p className="text-sm text-gray-500 font-medium">Software license terms and conditions</p>
                        </div>
                    </div>

                    {/* Role Badge matching top right in image */}
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 text-xs font-bold self-start sm:self-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>{username} ({userRole})</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    {/* Inner Header with doc icon */}
                    <div className="flex items-center gap-2.5 pb-2 border-b border-gray-50">
                        <FileText className="text-blue-600" size={22} />
                        <h2 className="text-lg font-bold text-gray-800">License Terms & Conditions</h2>
                    </div>

                    {/* SOFTWARE LICENSE AGREEMENT Banner Box */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-1">
                        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">SOFTWARE LICENSE AGREEMENT</h3>
                        <p className="text-xs text-blue-600 font-semibold">Checklist & Delegation System</p>
                    </div>

                    {/* Left-Bordered List Items */}
                    <div className="space-y-6">
                        {/* 1. Copyright */}
                        <div className="pl-4 border-l-4 border-amber-500 space-y-1.5">
                            <h4 className="text-sm font-bold text-gray-800">1. Copyright © BOTIVATE SERVICES LLP</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                This software is specially developed by botivate for use by its clients. Unauthorized use & copying of this software will attract penalties. For support contact info is below.
                            </p>
                        </div>

                        {/* 2. Data Protection */}
                        <div className="pl-4 border-l-4 border-green-500 space-y-1.5">
                            <h4 className="text-sm font-bold text-gray-800">2. Data Protection & Privacy</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                We protect your data using secure methods and follow privacy laws. Your information is safe with us.
                            </p>
                        </div>

                        {/* 3. Support & Updates */}
                        <div className="pl-4 border-l-4 border-blue-500 space-y-1.5">
                            <h4 className="text-sm font-bold text-gray-800">3. Support & Updates</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                We offer support during business hours. Software updates and fixes will be provided regularly to improve performance and security.
                            </p>
                        </div>
                    </div>

                    {/* Contact Information purple-bordered box */}
                    <div className="bg-purple-50/30 border border-purple-100 rounded-xl p-5 space-y-3.5">
                        <h4 className="text-sm font-bold text-blue-700">Contact Information</h4>
                        <p className="text-xs text-gray-500 font-medium">
                            For license inquiries or technical support, please contact our support team:
                        </p>
                        <div className="space-y-2.5">
                            <a href="mailto:info@botivate.in" className="flex items-center gap-2.5 text-xs text-blue-600 hover:underline font-semibold w-fit">
                                <Mail size={15} className="text-blue-500" />
                                <span>info@botivate.in</span>
                            </a>
                            <a href="https://www.botivate.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-blue-600 hover:underline font-semibold w-fit">
                                <Globe size={15} className="text-blue-500" />
                                <span>www.botivate.in</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default LicensePage;
