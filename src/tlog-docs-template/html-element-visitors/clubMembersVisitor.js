import ClubMembersService from "../../services/clubMembers.service";

export const ClubMembersVisitor = {
    visit(context) {
        if(context.docInfo.type === 'clubMembers'){
            return this.createSection(context);
        }
    },
    createSection(context){
        const clubMembersService = new ClubMembersService(context.options);
        const elements = [];
        const clubMembers =  clubMembersService.get({
            totalAmount: context._printData.variables.TOTAL_AMOUNT,
            members: context._printData.collections.MEMBERS
        });
        elements.push(clubMembers);
        return elements;
    }
}
