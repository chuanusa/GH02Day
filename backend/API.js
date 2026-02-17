function doGet(e) {
    if (e.parameter.api === 'true' || e.parameter.type === 'json') {
        return handleApiRequest(e);
    }
    return _original_doGet();
}

function doPost(e) {
    return handleApiRequest(e);
}

function handleApiRequest(e) {
    var lock = LockService.getScriptLock();
    // Wait for up to 30 seconds for other processes to finish.
    lock.tryLock(30000);

    try {
        var params = e.parameter;
        // Handle POST body
        if (e.postData && e.postData.contents) {
            try {
                var postData = JSON.parse(e.postData.contents);
                for (var key in postData) {
                    params[key] = postData[key];
                }
            } catch (e) {
                // Ignore JSON parse error if body is not JSON
            }
        }

        var action = params.action;
        var result = { success: false, message: 'Invalid action' };

        switch (action) {
            // User & Auth
            case 'authenticateUser':
                result = authenticateUser(params.identifier, params.password);
                break;
            case 'changeUserPassword':
                result = changeUserPassword(params.account, params.oldPassword, params.newPassword);
                break;
            case 'getCurrentSession':
                result = getCurrentSession();
                break;
            case 'logoutUser':
                result = logoutUser();
                break;
            case 'getAllUsers':
                result = getAllUsers();
                break;
            case 'getUserByAccount':
                result = getUserByAccount(params.account);
                break;
            case 'addUser':
                result = addUser(params.userData ? JSON.parse(params.userData) : params);
                break;
            case 'updateUser':
                result = updateUser(params.userData ? JSON.parse(params.userData) : params);
                break;
            case 'deleteUser':
                result = deleteUser(params.rowIndex);
                break;
            case 'sendTemporaryPassword':
                result = sendTemporaryPassword(params.input);
                break;

            // Projects
            case 'getAllProjects':
                result = getAllProjects();
                break;
            case 'getActiveProjects':
                result = getActiveProjects();
                break;
            case 'updateProjectInfo':
                result = updateProjectInfo(params);
                break;
            case 'getUnfilledProjectsForTomorrow':
                result = getUnfilledProjectsForTomorrow();
                break;

            // Logs
            case 'submitDailyLog':
                result = submitDailyLog(params);
                break;
            case 'getLastLogForProject':
                result = getLastLogForProject(params.projectSeqNo);
                break;
            case 'getDailySummaryReport':
                result = getDailySummaryReport(
                    params.dateString,
                    params.filterStatus,
                    params.filterDept,
                    params.filterInspector,
                    params.isGuestMode === 'true',
                    params.userInfo ? JSON.parse(params.userInfo) : null
                );
                break;
            case 'updateDailySummaryLog':
                result = updateDailySummaryLog(params);
                break;
            case 'getPreviousDayLog':
                result = getPreviousDayLog(params.projectSeqNo, params.currentDate);
                break;
            case 'getUnfilledCount':
                result = getUnfilledCount();
                break;
            case 'getFilledDates':
                result = getFilledDates();
                break;
            case 'getDailyLogStatus':
                result = getDailyLogStatus();
                break;
            case 'getFillerReminders':
                result = getFillerReminders(params.managedProjectsStr);
                break;

            // Inspectors
            case 'getAllInspectors':
                result = getAllInspectors();
                break;
            case 'addInspector':
                result = addInspector(params);
                break;
            case 'updateInspector':
                result = updateInspector(params);
                break;

            // Calendar & Holiday
            case 'checkHolidayFilledStatus':
                result = checkHolidayFilledStatus(params.dateString, params.projects ? JSON.parse(params.projects) : []);
                break;
            case 'batchSubmitHolidayLogs':
                result = batchSubmitHolidayLogs(
                    params.startDate,
                    params.endDate,
                    params.targetDays ? JSON.parse(params.targetDays) : [],
                    params.projectSeqNos ? JSON.parse(params.projectSeqNos) : []
                );
                break;
            case 'checkHoliday':
                result = checkHoliday(params.dateString);
                break;
            case 'getMonthHolidays':
                result = getMonthHolidays(params.year, params.month);
                break;

            // Others
            case 'getAllDepartments':
                result = getAllDepartments();
                break;
            case 'getDisasterTypes':
                result = getDisasterTypes();
                break;
            case 'saveCustomDisasterType':
                result = saveCustomDisasterType(params.customType);
                break;
            case 'generateTBMKY':
                result = generateTBMKY(params);
                break;
            case 'testTBMKYPermissions':
                result = testTBMKYPermissions();
                break;
            case 'logModification':
                result = logModification(params.type, params.projectSeqNo, params.oldData, params.newData, params.reason, params.actionType);
                break;

            default:
                result = { success: false, message: 'Unknown action: ' + action };
        }

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: error.toString(),
            stack: error.stack
        })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}
