import ClubMembersService from "../../services/clubMembers.service";

export const ClubMembersVisitor = {
    visit(context) {
        if (context.docInfo.type === 'clubMembers') {
            this.clubMembersService = new ClubMembersService(context.options);
            return this.createSection(context);
        }
    },
    createSection(context) {
        const elements = [];
        const clubMembers = this.clubMembersService.get({
            totalAmount: context._printData.variables.TOTAL_AMOUNT,
            members: context._printData.collections.MEMBERS
        });

        elements.push(clubMembers);
        return elements;
    }
};
