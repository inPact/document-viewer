
window.DocumentViewer.HistoriesService = (function () {

    let translateService;
    let userService;

    const ActionTypes = {
        kickout: 'kickout',
        resume: 'resume',
        suspend: 'suspend'
    };

    const ResumeSuspend = {
        manual: 'manual',
        manager: 'manager',
        other: 'other',
    }

    let service = {
        getDataOfResumeOrSuspendOrder(historyItem) {

            if (historyItem.action === ActionTypes.suspend) {

                if (historyItem.data.source === ResumeSuspend.manual) {
                    return translateService.getText('SUSPEND_MANUAL')
                }
                if (historyItem.data.source === ResumeSuspend.manager) {
                    return translateService.getText('SUSPEND_MANAGER')

                }
                if (historyItem.data.source === ResumeSuspend.other) {
                    return translateService.getText('SUSPEND_OTHER')
                }

            }

            if (historyItem.action === ActionTypes.resume) {
                return translateService.getText('RESUME');

            }
        },
        getAction(action) {

            if (action === ActionTypes.resume) {
                return translateService.getText('RESUME')
            }

            if (action === ActionTypes.suspend) {
                return translateService.getText('SUSPEND')

            }

        }
    }

    function HistoriesService(options) {

        translateService = new window.DocumentViewer.EnrichOrderTranslateService({
            local: options.local
        });

        userService = new window.DocumentViewer.UserService();

    }

    function resolveHistoriesToTimeLine(order, options) {

        let users = options.users;

        let result = [];

        let histories = order.history;

        if (histories && histories.length > 0) {

            histories.forEach(historyItem => {

                if (historyItem.action === ActionTypes.suspend || historyItem.action === ActionTypes.resume) {
                    result.push({
                        action: service.getAction(historyItem.action),
                        data: service.getDataOfResumeOrSuspendOrder(historyItem),
                        at: historyItem.at,
                        by: userService.resolveUserName({ userId: historyItem.by, users: users })
                    });
                }

                if (historyItem.action === ActionTypes.kickout) {
                    result.push({
                        action: historyItem.action,
                        data: `Device name: ${historyItem.deviceName}`,
                        at: historyItem.at,
                        by: userService.resolveUserName({ userId: historyItem.by, users: users })
                    });
                }

            });
        }

        return result;

    }

    HistoriesService.prototype.resolveHistoriesToTimeLine = resolveHistoriesToTimeLine;

    return HistoriesService;

})();

