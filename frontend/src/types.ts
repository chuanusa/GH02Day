export interface Project {
    seqNo: string;
    name: string;
    contractor: string;
    status: string;
}

export interface User {
    email: string;
    name: string;
    role: string;
    permissions: string[];
}

export interface DailyLog {
    date: string;
    projectSeqNo: string;
    workItems: string;
    workersCount: number;
}
