export interface Project {
    seqNo: string;
    name: string;
    shortName: string;
    fullName: string;
    contractor: string;
    status: string;
    dept: string;
    address: string;
    gps: string;
    resp: string;
    respPhone: string;
    safetyOfficer: string;
    safetyPhone: string;
    safetyLicense: string;
    siteDirector: string;
    directorPhone: string;
    defaultInspectors: string[];
    projectStatus: string;
    remark: string;
}

export interface User {
    rowIndex?: number;
    dept: string;
    name: string;
    account: string;
    email: string;
    role: string;
    password?: string;
    managedProjects: string[];
    supervisorEmail: string;
    permissions?: string[];
}

export interface Holiday {
    date: string;
    isHoliday: boolean;
    remark: string;
    weekday?: string;
}

export interface TBMKYParams {
    dateString: string;
    projectSeqNo: string;
    mode: 'merged' | 'separate';
}

export interface CalendarData {
    [date: string]: {
        isHoliday: boolean;
        remark: string;
    }
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user?: User;
}

export interface DailyLog {
    date: string;
    projectSeqNo: string;
    workItems: string;
    workersCount: number;
}

export interface UnfilledProject {
    projectSeqNo: string;
    projectName: string;
    contractor: string;
}

export interface DashboardData {
    unfilledProjects: UnfilledProject[];
    statistics: {
        totalProjects: number;
        filledCount: number;
        unfilledCount: number;
    };
}

export interface Inspector {
    id: string;
    name: string;
    title: string;
}

export interface DisasterType {
    category: string;
    types: string[];
}

export interface LogWorkItem {
    workItem: string;
    disasterTypes: string[];
    countermeasures: string;
    workLocation: string;
}

export interface DailyLogSubmission {
    logDate: string;
    projectSeqNo: string;
    projectShortName?: string;
    isHolidayNoWork: boolean;
    isHolidayWork: boolean;
    inspectorIds?: string[];
    workersCount?: number;
    workItems?: LogWorkItem[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}
