import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Project, Inspector } from '../types';

export const ProjectManagement: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [inspectors, setInspectors] = useState<Inspector[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, inspectorsRes] = await Promise.all([
                    api.getAllProjects(),
                    api.getAllInspectors()
                ]);

                if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
                if (inspectorsRes.success && inspectorsRes.data) setInspectors(inspectorsRes.data);
            } catch (error) {
                console.error('Failed to load data', error);
                setMessage({ type: 'error', text: '無法載入專案列表' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEdit = (project: Project) => {
        setEditingProject({ ...project });
        setMessage(null);
    };

    const handleCancelEdit = () => {
        setEditingProject(null);
        setMessage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;

        const payload = {
            projectSeqNo: editingProject.seqNo,
            resp: editingProject.resp,
            respPhone: editingProject.respPhone,
            safetyOfficer: editingProject.safetyOfficer,
            safetyPhone: editingProject.safetyPhone,
            safetyLicense: editingProject.safetyLicense,
            projectStatus: editingProject.projectStatus,
            statusRemark: editingProject.remark, // Map remark to statusRemark as expected by backend
            defaultInspectors: editingProject.defaultInspectors,
            reason: '管理員修改' // Default reason
        };

        try {
            const response = await api.updateProjectInfo(payload);
            if (response.success) {
                setMessage({ type: 'success', text: '更新成功！' });
                // Update local list
                setProjects(projects.map(p => p.seqNo === editingProject.seqNo ? editingProject : p));
                setEditingProject(null);
            } else {
                setMessage({ type: 'error', text: response.message || '更新失敗' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '更新時發生錯誤' });
        }
    };

    const handleInputChange = (field: keyof Project, value: any) => {
        if (editingProject) {
            setEditingProject({ ...editingProject, [field]: value });
        }
    };

    const handleInspectorChange = (selectedOptions: HTMLCollectionOf<HTMLOptionElement>) => {
        if (editingProject) {
            const values = Array.from(selectedOptions, option => option.value);
            setEditingProject({ ...editingProject, defaultInspectors: values });
        }
    }

    if (loading) return <div>載入中...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">工程管理</h2>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {editingProject ? (
                <form onSubmit={handleSave} className="space-y-4 bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-xl font-bold mb-4">編輯工程: {editingProject.fullName}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">工地負責人</label>
                            <input
                                type="text"
                                value={editingProject.resp}
                                onChange={(e) => handleInputChange('resp', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">負責人電話</label>
                            <input
                                type="text"
                                value={editingProject.respPhone}
                                onChange={(e) => handleInputChange('respPhone', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">職安人員</label>
                            <input
                                type="text"
                                value={editingProject.safetyOfficer}
                                onChange={(e) => handleInputChange('safetyOfficer', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">職安電話</label>
                            <input
                                type="text"
                                value={editingProject.safetyPhone}
                                onChange={(e) => handleInputChange('safetyPhone', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">工程狀態</label>
                            <select
                                value={editingProject.projectStatus}
                                onChange={(e) => handleInputChange('projectStatus', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            >
                                <option value="施工中">施工中</option>
                                <option value="停工">停工</option>
                                <option value="完工">完工</option>
                                <option value="解除列管">解除列管</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">狀態備註</label>
                            <input
                                type="text"
                                value={editingProject.remark}
                                onChange={(e) => handleInputChange('remark', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                placeholder="非施工中狀態必填"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">預設檢驗員</label>
                        <select
                            multiple
                            value={editingProject.defaultInspectors}
                            onChange={(e) => handleInspectorChange(e.target.selectedOptions)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-32"
                        >
                            {inspectors.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.title})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 mt-4">
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            儲存變更
                        </button>
                    </div>
                </form>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工程序號</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工程名稱</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">承攬廠商</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.map((project) => (
                                <tr key={project.seqNo}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.seqNo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.contractor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.projectStatus === '施工中' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {project.projectStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleEdit(project)} className="text-indigo-600 hover:text-indigo-900">編輯</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
