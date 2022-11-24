import {VersionVisitor} from './versionVisitor';
import {HeaderVisitor} from './headerVisitor';
import { ClubMembersVisitor } from './clubMembersVisitor';
import { RefundDeliveryNoteVisitor } from './refundDeliveryNoteVisitor';
import { MediaExchangeVisitor } from './mediaExchangeVisitor';

export default [
    VersionVisitor, HeaderVisitor, ClubMembersVisitor, RefundDeliveryNoteVisitor, MediaExchangeVisitor
];

