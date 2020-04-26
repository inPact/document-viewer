window.DocumentViewer.CoursesService = (function () {

    let userService;

    const CourseActions = [
        'notified',
        'fired',
        'served',
        'prepared',
        'taken'
    ];

    function CoursesService() {

        userService = new window.DocumentViewer.UserService();

    }

    function resolveCourses(order, options) {

        let users = options.users;

        let courses = order.courses;
        let orderedItems = order.orderedItems;
        let cancelledOffers = order.cancelledOffers;

        if (courses && courses.length) {

            courses.forEach(course => {

                CourseActions.forEach(action => {

                    if (course[action]) {
                        course[action].waiter = userService.resolveUserName({ userId: course[action].by, users: users });
                    }

                    if (course.orderedItems && course.orderedItems.length > 0) {

                        course.enrichItems = [];
                        course.orderedItems.forEach(item => {
                            let _orderedItem = orderedItems.find(c => c._id === item);
                            if (_orderedItem) {
                                course.enrichItems.push(_orderedItem);
                            }

                            let _cancelItem = cancelledOffers.find(c => c._id === item);
                            if (_cancelItem) {
                                course.enrichItems.push(_cancelItem);
                            }
                        })
                    }
                });
            })
        }

        return courses;

    }

    CoursesService.prototype.resolveCourses = resolveCourses;

    return CoursesService;

})();
