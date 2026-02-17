const GAS_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

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
