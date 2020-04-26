window.DocumentViewer.UserService = (function () {

    let utils;

    function UserService(options) {

        utils = new window.DocumentViewer.Utils();

    }

    function resolveUserName(options) {

        let userId = options.userId;
        let users = options.users;

        let result = 'None';

        if (users && users.length > 0) {
            let user = users.find(c => c._id === userId);
            if (user) {
                return `${user.firstName} ${user.lastName}`;
            }
        }

        return result;
    }

    function resolveUser(options) {

        let userId = options.userId;
        let users = options.users;

        let result;
        if (users && users.length > 0) {
            result = users.find(c => c._id === userId);
        }

        if (result) {
            result.displayName = resolveServerName({ user: result });
        }
        else {
            console.log("missing users");
        }

        return result;
    }

    function resolveServerName(options) {

        let user = options.user;

        let result = "";
        if (user.firstName !== undefined) {
            result += user.firstName;
        }

        if (user.lastName !== undefined) {
            result += ` ${user.lastName[0]}`;
        }

        return result;

    }

    UserService.prototype.resolveUserName = resolveUserName;
    UserService.prototype.resolveUser = resolveUser;

    return UserService;

})();
