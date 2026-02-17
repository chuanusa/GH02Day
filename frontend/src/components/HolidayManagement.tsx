import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CalendarData, Project } from '../types';

export const HolidayManagement: React.FC = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [calendarData, setCalendarData] = useState<CalendarData>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Batch Submit State
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [targetDays, setTargetDays] = useState<number[]>([0, 6]); // Default Sat, Sun

    useEffect(() => {
        fetchCalendar();
        fetchProjects();
    }, [year, month]);

    const fetchCalendar = async () => {
        setLoading(true);
        try {
            const response = await api.getMonthHolidays(year, month);
            if (response.success && response.data) {
                setCalendarData(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        const res = await api.getAllProjects();
        if (res.success && res.data) {
            setProjects(res.data.filter((p: Project) => p.projectStatus === '施工中'));
        }
    };

    const handleBatchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (selectedProjects.length === 0) {
            setMessage({ type: 'error', text: '請至少選擇一個工程' });
            return;
        }

        try {
            const response = await api.batchSubmitHolidayLogs({
                startDate,
                endDate,
                targetDays,
                projectSeqNos: selectedProjects
            });

            if (response.success) {
                setMessage({ type: 'success', text: response.message || '批次設定成功' });
            } else {
                setMessage({ type: 'error', text: response.message || '設定失敗' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '發生錯誤' });
        }
    };

    const handleDayToggle = (day: number) => {
        const newDays = targetDays.includes(day)
            ? targetDays.filter(d => d !== day)
            : [...targetDays, day];
        setTargetDays(newDays);
    }

    // Helper to generate days in month
    const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
    const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">假日管理與行事曆</h2>

                <div className="flex gap-4 mb-4 items-center">
                    <button onClick={() => {
                        if (month === 1) { setMonth(12); setYear(y => y - 1); }
                        else { setMonth(m => m - 1); }
                    }} className="px-2 py-1 bg-gray-200 rounded">&lt;</button>
                    <span className="text-lg font-bold">{year} 年 {month} 月</span>
                    <button onClick={() => {
                        if (month === 12) { setMonth(1); setYear(y => y + 1); }
                        else { setMonth(m => m + 1); }
                    }} className="px-2 py-1 bg-gray-200 rounded">&gt;</button>
                    {loading && <span className="text-gray-500 text-sm">載入中...</span>}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                        <div key={d} className="text-center font-bold bg-gray-100 p-2">{d}</div>
                    ))}
                    {/* Simplified calendar rendering logic - alignment omitted for brevity */}
                    {days.map(day => {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const info = calendarData[dateStr];
                        const dateObj = new Date(year, month - 1, day);
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                        return (
                            <div key={day} className={`border p-2 h-24 ${info?.isHoliday ? 'bg-red-50' : 'bg-white'}`}>
                                <div className="font-bold">{day}</div>
                                {info?.isHoliday && <div className="text-xs text-red-500">{info.remark || (isWeekend ? '週末' : '假日')}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">批次設定假日不施工</h2>
                {message && (
                    <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleBatchSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">開始日期</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded border p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">結束日期</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded border p-2" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">每週不施工日</label>
                        <div className="flex gap-4">
                            {[0, 1, 2, 3, 4, 5, 6].map(day => (
                                <label key={day} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={targetDays.includes(day)}
                                        onChange={() => handleDayToggle(day)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm"
                                    />
                                    <span className="ml-2 text-gray-700">{['日', '一', '二', '三', '四', '五', '六'][day]}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">選擇工程 (全選/全不選)</label>
                        <div className="flex gap-2 mb-2">
                            <button type="button" onClick={() => setSelectedProjects(projects.map(p => p.seqNo))} className="text-xs bg-gray-200 px-2 py-1 rounded">全選</button>
                            <button type="button" onClick={() => setSelectedProjects([])} className="text-xs bg-gray-200 px-2 py-1 rounded">清空</button>
                        </div>
                        <select
                            multiple
                            value={selectedProjects}
                            onChange={e => setSelectedProjects(Array.from(e.target.selectedOptions, o => o.value))}
                            className="block w-full rounded border p-2 h-48"
                        >
                            {projects.map(p => (
                                <option key={p.seqNo} value={p.seqNo}>{p.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">確認設定</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
