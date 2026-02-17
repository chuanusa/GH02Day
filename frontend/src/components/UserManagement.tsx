import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.getAllUsers();
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                setMessage({ type: 'error', text: '無法載入使用者資料' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '載入失敗' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser({ ...user });
        setIsCreating(false);
        setMessage(null);
    };

    const handleCreate = () => {
        setEditingUser({
            dept: '',
            name: '',
            account: '',
            email: '',
            role: '填表人',
            managedProjects: [],
            supervisorEmail: ''
        });
        setIsCreating(true);
        setMessage(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setIsCreating(false);
        setMessage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const response = isCreating
                ? await api.addUser(editingUser)
                : await api.updateUser(editingUser);

            if (response.success) {
                setMessage({ type: 'success', text: isCreating ? '新增成功！' : '更新成功！' });
                fetchUsers();
                setEditingUser(null);
                setIsCreating(false);
            } else {
                setMessage({ type: 'error', text: response.message || '操作失敗' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '發生錯誤' });
        }
    };

    const handleDelete = async (rowIndex?: number) => {
        if (!rowIndex || !window.confirm('確定要刪除此使用者嗎？')) return;

        try {
            const response = await api.deleteUser(rowIndex);
            if (response.success) {
                setMessage({ type: 'success', text: '刪除成功！' });
                fetchUsers();
            } else {
                setMessage({ type: 'error', text: response.message || '刪除失敗' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '刪除時發生錯誤' });
        }
    };

    const handleInputChange = (field: keyof User, value: any) => {
        if (editingUser) {
            setEditingUser({ ...editingUser, [field]: value });
        }
    };

    const handleManagedProjectsChange = (val: string) => {
        if (editingUser) {
            const projects = val.split(',').map(p => p.trim());
            setEditingUser({ ...editingUser, managedProjects: projects });
        }
    }

    if (loading) return <div>載入中...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">使用者管理</h2>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    新增使用者
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {editingUser ? (
                <form onSubmit={handleSave} className="space-y-4 bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-xl font-bold mb-4">{isCreating ? '新增使用者' : '編輯使用者'}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">姓名</label>
                            <input
                                type="text"
                                value={editingUser.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">部門</label>
                            <input
                                type="text"
                                value={editingUser.dept}
                                onChange={(e) => handleInputChange('dept', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">帳號</label>
                            <input
                                type="text"
                                value={editingUser.account}
                                onChange={(e) => handleInputChange('account', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                required
                                disabled={!isCreating}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={editingUser.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">密碼 {isCreating ? '(必填)' : '(留空則不修改)'}</label>
                            <input
                                type="password"
                                value={editingUser.password || ''}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                required={isCreating}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">角色</label>
                            <select
                                value={editingUser.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            >
                                <option value="填表人">填表人</option>
                                <option value="聯絡員">聯絡員</option>
                                <option value="管理員">管理員</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">管理工程序號 (逗號分隔)</label>
                            <input
                                type="text"
                                value={editingUser.managedProjects.join(', ')}
                                onChange={(e) => handleManagedProjectsChange(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">主管 Email (接收副本用)</label>
                            <input
                                type="email"
                                value={editingUser.supervisorEmail}
                                onChange={(e) => handleInputChange('supervisorEmail', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">帳號</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部門</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.rowIndex}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.account}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.dept}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.role === '管理員' ? 'bg-purple-100 text-purple-800' :
                                                user.role === '聯絡員' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900">編輯</button>
                                        <button onClick={() => handleDelete(user.rowIndex)} className="text-red-600 hover:text-red-900">刪除</button>
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
