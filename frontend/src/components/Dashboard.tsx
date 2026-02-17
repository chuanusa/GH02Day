import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { UnfilledProject } from '../types';

export const Dashboard: React.FC = () => {
    const [unfilledProjects, setUnfilledProjects] = useState<UnfilledProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data for tomorrow's unfilled projects
                // Note: The API name is 'getUnfilledProjectsForTomorrow'
                const response = await api.getUnfilledProjectsForTomorrow();
                if (response.success && response.data) {
                    // Adjust based on actual API response structure. 
                    // Assuming response.data is the array or contains it.
                    // If the GAS function returns an array directly, api.get wraps it in { success: true, data: ... }
                    // If GAS returns { unfilledProjects: [...] }, then response.data.unfilledProjects

                    // Based on code.js getUnfilledProjectsForTomorrow, it returns { success: true, data: [...] } or { success: false ... }
                    // So here response.data should be the array.
                    setUnfilledProjects(response.data as UnfilledProject[]);
                } else {
                    setError(response.message || '無法載入資料');
                }
            } catch (err) {
                setError('載入資料時發生錯誤');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">載入中...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">明日未填寫工程 ({unfilledProjects.length})</h3>
                {unfilledProjects.length === 0 ? (
                    <p className="text-gray-500">所有工程皆已填寫。</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工程序號</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工程名稱</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">承攬廠商</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {unfilledProjects.map((project) => (
                                    <tr key={project.projectSeqNo}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.projectSeqNo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.projectName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.contractor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
