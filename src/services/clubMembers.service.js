

import HtmlCreator from '../helpers/htmlCreator.service';
import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from '../tlog-docs-template/tlogDocsTranslate';

export default class ClubMembers {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$utils = new Utils();
        this.$translate = new TlogDocsTranslateService({
            realRegion: options.realRegion || 'il',
            locale: options.locale
        });
    }

    get(options) {

        let totalAmount = options.totalAmount;
        let members = options.members;

        let ClubMembersContainer = this.$htmlCreator.create({
            type: 'div',
            id: 'club-members-container',
            classList: [],
            value: undefined
        });

        let ClubMembersAmountSection = this.$htmlCreator.createSection({
            id: 'club-members-amount-section',
            classList: ['tpl-body-div']
        });

        let elementTotalAmountText = this.$htmlCreator.create({
            type: 'div',
            id: 'club-members-amount-text',
            classList: ['total-name'],
            value: this.$translate.getText('TOTAL_AMOUNT')
        });

        let elementTotalAmountValue = this.$htmlCreator.create({
            type: 'div',
            id: 'club-members-amount-value',
            classList: ['total-amount'],
            value: this.$utils.toFixedSafe(totalAmount, 2) || ''
        });

        let elementTotalAmount = this.$htmlCreator.create({
            type: 'div',
            id: 'club-members-amount',
            classList: ['itemDiv', 'bold'],
            value: undefined,
            children: [
                elementTotalAmountText,
                elementTotalAmountValue
            ]
        });

        ClubMembersAmountSection.appendChild(elementTotalAmount);

        let ClubMembersSection = this.$htmlCreator.createSection({
            id: 'club-members-section',
            classList: []
        });

        let elementClubMemberHeaderText = this.$htmlCreator.create({
            type: 'div',
            id: 'club-members-header-text',
            classList: ['total-name'],
            value: this.$translate.getText('clubMembers')
        });

        let elementClubMemberHeader = this.$htmlCreator.create({
            type: 'div',
            id: 'club-members-header',
            classList: ['itemDiv'],
            value: undefined,
            children: [
                elementClubMemberHeaderText
            ]
        });

        ClubMembersSection.appendChild(elementClubMemberHeader);

        members.forEach((member, index) => {

            let elementTotalAmountText = this.$htmlCreator.create({
                type: 'div',
                id: `club-members-text-${index}`,
                classList: ['total-name'],
                value: `${member.FIRST_NAME} ${member.LAST_NAME} ${this.$translate.getText('PHONE')} ${member.ID_VALUE}`
            });

            let elementTotalAmount = this.$htmlCreator.create({
                type: 'div',
                id: `club-members-${index}`,
                classList: ['itemDiv'],
                value: undefined,
                children: [
                    elementTotalAmountText
                ]
            });

            ClubMembersSection.appendChild(elementTotalAmount);


        });

        ClubMembersContainer.appendChild(ClubMembersAmountSection);
        ClubMembersContainer.appendChild(ClubMembersSection);


        return ClubMembersContainer;

    }

}
