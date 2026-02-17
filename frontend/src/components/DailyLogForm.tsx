import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Project, Inspector, DisasterType, LogWorkItem, User } from '../types';

// interface DailyLogFormProps {
//     user: User;
// }

export const DailyLogForm: React.FC<{ user: User }> = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [inspectors, setInspectors] = useState<Inspector[]>([]);
    const [disasterTypes, setDisasterTypes] = useState<DisasterType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedProject, setSelectedProject] = useState('');
    const [isHolidayNoWork, setIsHolidayNoWork] = useState(false);
    const [isHolidayWork, setIsHolidayWork] = useState(false);
    const [selectedInspectors, setSelectedInspectors] = useState<string[]>([]);
    const [workersCount, setWorkersCount] = useState<number>(0);
    const [workItems, setWorkItems] = useState<LogWorkItem[]>([{ workItem: '', disasterTypes: [], countermeasures: '', workLocation: '' }]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [projectsRes, inspectorsRes, disasterTypesRes] = await Promise.all([
                    api.getAllProjects(),
                    api.getAllInspectors(),
                    api.getDisasterTypes()
                ]);

                if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
                if (inspectorsRes.success && inspectorsRes.data) setInspectors(inspectorsRes.data);
                if (disasterTypesRes.success && disasterTypesRes.data) setDisasterTypes(disasterTypesRes.data);
            } catch (error) {
                console.error('Failed to load metadata', error);
                setMessage({ type: 'error', text: '無法載入表單選項，請重整頁面' });
            } finally {
                setLoading(false);
            }
        };
        fetchMetadata();
    }, []);

    const handleWorkItemChange = (index: number, field: keyof LogWorkItem, value: any) => {
        const newItems = [...workItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setWorkItems(newItems);
    };

    const addWorkItem = () => {
        setWorkItems([...workItems, { workItem: '', disasterTypes: [], countermeasures: '', workLocation: '' }]);
    };

    const removeWorkItem = (index: number) => {
        setWorkItems(workItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        const payload = {
            logDate,
            projectSeqNo: selectedProject,
            isHolidayNoWork,
            isHolidayWork,
            inspectorIds: selectedInspectors,
            workersCount,
            workItems: isHolidayNoWork ? [] : workItems
        };

        try {
            const response = await api.submitDailyLog(payload);
            if (response.success) {
                setMessage({ type: 'success', text: response.message || '提交成功！' });
                // Reset form or redirect
            } else {
                setMessage({ type: 'error', text: response.message || '提交失敗' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '提交時發生錯誤' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>載入中...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">工程日誌填報</h2>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">日期</label>
                        <input
                            type="date"
                            value={logDate}
                            onChange={(e) => setLogDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">工程</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                        >
                            <option value="">請選擇工程</option>
                            {projects.map(p => (
                                <option key={p.seqNo} value={p.seqNo}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isHolidayNoWork}
                            onChange={(e) => setIsHolidayNoWork(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-gray-700">假日不施工</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isHolidayWork}
                            onChange={(e) => setIsHolidayWork(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-gray-700">假日施工</span>
                    </label>
                </div>

                {!isHolidayNoWork && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">檢驗員 (可多選)</label>
                            <select
                                multiple
                                value={selectedInspectors}
                                onChange={(e) => setSelectedInspectors(Array.from(e.target.selectedOptions, option => option.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-32"
                            >
                                {inspectors.map(i => (
                                    <option key={i.id} value={i.id}>{i.name} ({i.title})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">施工人數</label>
                            <input
                                type="number"
                                value={workersCount}
                                onChange={(e) => setWorkersCount(parseInt(e.target.value) || 0)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                min="0"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">施工項目</h3>
                            {workItems.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                                    <button
                                        type="button"
                                        onClick={() => removeWorkItem(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                        刪除
                                    </button>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input
                                            type="text"
                                            placeholder="施工項目"
                                            value={item.workItem}
                                            onChange={(e) => handleWorkItemChange(index, 'workItem', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        />
                                        <input
                                            type="text"
                                            placeholder="施工地點"
                                            value={item.workLocation}
                                            onChange={(e) => handleWorkItemChange(index, 'workLocation', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">災害類型 (可多選)</label>
                                            <select
                                                multiple
                                                value={item.disasterTypes}
                                                onChange={(e) => handleWorkItemChange(index, 'disasterTypes', Array.from(e.target.selectedOptions, option => option.value))}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-24"
                                            >
                                                {disasterTypes.flatMap(dt =>
                                                    dt.types.map(t => (
                                                        <option key={`${dt.category}-${t}`} value={t}>{dt.category} - {t}</option>
                                                    ))
                                                )}
                                            </select>
                                        </div>

                                        <textarea
                                            placeholder="處置措施"
                                            value={item.countermeasures}
                                            onChange={(e) => handleWorkItemChange(index, 'countermeasures', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addWorkItem}
                                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                            >
                                + 新增項目
                            </button>
                        </div>
                    </>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? '提交中...' : '提交日誌'}
                    </button>
                </div>
            </form>
        </div>
    );
};
