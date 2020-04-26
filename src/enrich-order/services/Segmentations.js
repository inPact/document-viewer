window.DocumentViewer.SegmentationsService = (function () {

    let translateService;
    let userService;

    function SegmentationsService(options) {

        translateService = new window.DocumentViewer.EnrichOrderTranslateService({
            local: options.local
        });

        userService = new window.DocumentViewer.UserService();
    }

    function resolveSegmentationsTimeLine(order, options) {

        let users = options.users;
        let segmentations = order.segmentations;
        let diners = order.diners;

        let result = [];

        if (segmentations.length > 0) {
            segmentations.forEach(segment => {

                if (segment.applied) {
                    result.push({
                        action: translateService.getText('APPLIED_SEGMENTATION'),
                        data: segment.name,
                        at: segment.applied.at,
                        by: userService.resolveUserName({ userId: _.get(segment, 'applied.by'), users: users })
                    });
                }

                if (segment.approved) {
                    result.push({
                        action: translateService.getText('APPROVED_SEGMENTATION'),
                        data: segment.name,
                        at: segment.approved.at,
                        by: userService.resolveUserName({ userId: _.get(segment, 'approved.by'), users: users })
                    });
                }
            });
        }

        if (diners.length > 0) {

            diners.forEach(diner => {

                if (diner.segmentations) {

                    diner.segmentations.forEach(segment => {

                        if (segment.applied) {
                            result.push({
                                action: translateService.getText('APPLIED_SEGMENTATION'),
                                data: segment.name,
                                at: segment.applied.at,
                                by: userService.resolveUserName({ userId: _.get(segment, 'applied.by'), users: users })
                            });
                        }

                        if (segment.approved) {
                            result.push({
                                action: translateService.getText('APPROVED_SEGMENTATION'),
                                data: segment.name,
                                at: segment.approved.at,
                                by: userService.resolveUserName({ userId: _.get(segment, 'approved.by'), users: users })
                            });
                        }

                    });

                }

            });
        }

        return result;
    }

    SegmentationsService.prototype.resolveSegmentationsTimeLine = resolveSegmentationsTimeLine;

    return SegmentationsService;



})();
