const GAS_URL = import.meta.env.VITE_API_URL || '';

import type { ApiResponse, LoginResponse, User, CalendarData, TBMKYParams } from '../types';

export const api = {
    get: async <T>(action: string, params: Record<string, string> = {}): Promise<ApiResponse<T>> => {
        try {
            const query = new URLSearchParams({ action, ...params }).toString();
            const response = await fetch(`${GAS_URL}?${query}`);
            return await response.json();
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
    authenticateUser: async (identifier: string, password: string): Promise<LoginResponse> => {
        const params = new URLSearchParams({
            action: 'authenticateUser',
            identifier,
            password
        });

        try {
            const response = await fetch(`${GAS_URL}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: '無法連接伺服器，請檢查網路連線或稍後再試'
            };
        }
    },
    getUnfilledProjectsForTomorrow: async () => {
        return api.get<any>('getUnfilledProjectsForTomorrow');
    },
    getDailySummaryReport: async (dateString: string) => {
        return api.get<any>('getDailySummaryReport', { dateString });
    },
    getAllProjects: async () => {
        return api.get<any>('getAllProjects');
    },
    getAllInspectors: async () => {
        return api.get<any>('getAllInspectors');
    },
    getDisasterTypes: async () => {
        return api.get<any>('getDisasterTypes');
    },
    submitDailyLog: async (data: any) => {
        return api.post<any>('submitDailyLog', data);
    },
    updateProjectInfo: async (data: any) => {
        return api.post<any>('updateProjectInfo', data);
    },
    // User Management
    getAllUsers: async () => {
        return api.post<User[]>('getAllUsers', {});
    },
    addUser: async (userData: User) => {
        return api.post<any>('addUser', userData);
    },
    updateUser: async (userData: User) => {
        return api.post<any>('updateUser', userData);
    },
    deleteUser: async (rowIndex: number) => {
        return api.post<any>('deleteUser', { rowIndex });
    },
    // Holiday & TBM
    getMonthHolidays: async (year: number, month: number) => {
        return api.post<CalendarData>('getMonthHolidays', { year, month });
    },
    batchSubmitHolidayLogs: async (data: any) => {
        return api.post<any>('batchSubmitHolidayLogs', data);
    },
    generateTBMKY: async (params: TBMKYParams) => {
        return api.post<any>('generateTBMKY', params);
    },
    post: async <T>(action: string, payload: any): Promise<ApiResponse<T>> => {
        try {
            const response = await fetch(GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS requires text/plain to avoid CORS preflight issues sometimes
                body: JSON.stringify({ action, ...payload }),
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
};
