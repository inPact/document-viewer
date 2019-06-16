// 'use strict'
// let TlogDocsTranslateService = (function () {

export default class TlogDocsTranslateService {


    // TlogDocsTranslateService(options) {
    //     configure(options)
    // }

    constructor(options = {}) {
        this._options = options;

        this.configure(options)

    }

    _translate() {
        return {
            "en-US": {
                "OTH": "OTH",
                "MANUAL_ITEM_DISCOUNT": "MANUAL DISCOUNT",
                "TOTAL_ORDER": "SUBTOTAL",
                "ORDER_DISCOUNT": "ORDER DISCOUNT",
                "ECVLUSIVE_TAX": "EXCLUSIVE TAX",
                "SERVICE_CHARGE": "SERVICE CHARGE",
                "TIP": "TIP",
                "TOTAL_INC_VAT": "CHECK TOTAL",
                "CHANGE": "Change",
                "INCLUSIVE_TAXES": "INCLUSIVE TAXES",
                "EXEMPTED_TAXES": "EXEMPTED TAXES",
                "EXEMPTED_TAX": "TAX EXEMPT",
                "REVERSAL": "REVERSAL",
                "RETURN": "RETURN",
                "REFUND": "REFUND",
                "PRINT_BY_ORDER": "ORDER {{order_number}} on {{order_date}} {{order_time}}",
                "WAITER_DINERS": "SERVER {{waiter}} Guests {{diners}}",
                "TABLE_NUM": "TABLE {{table}}",
                "TA": "TA",
                "DELIVERY": "DELIVERY",
                "INITIATED_DISCOUNT": "INITATED.D",
                "CANCEL": "CANCEL",
                "CUSTOMER_NAME": "NAME",
                "LAST_4": "LAST 4 DIGITS",
                "AMOUNT": "AMOUNT",
                "CHARGE_ACCOUNT": "CHARGE ACCOUNT",
                "CASH": "CASH",
                "GIFT_CARD": "GIFT_CARD",
                "GIFT_CARD_LOAD": "GIFT CARD LOAD",
                "CHEQUE": "CHEQUE",
                "CREDIT": "CREDIT",
                "CHARGE_ACCOUNT_REFUND": "CHARGE ACCOUNT REFUND",
                "CASH_REFUND": "CASH REFUND",
                "CHEQUE_REFUND": "CHEQUE REFUND",
                "CREDIT_REFUND": "CREDIT REFUND",
                "OPEN": "OPEN",
                "ORDER": "ORDER",
                "CLOSE": "CLOSE",
                "PAYMENT": "PAYMENT",
                "OTH_ORDER_APPLIED": "ORDER OTH REQUESTED",
                "OTH_ORDER_APPROVED": "Order OTH APPROVED",
                "OTH_ITEM_APPLIED": "ITEM OTH REQUESTED",
                "OTH_ITEM_APPROVED": "ITEM OTH APPROVED",
                "CANCEL_ITEM_APPLIED": "Cancel ITEM REQUESTED",
                "CANCEL_ITEM_APPROVED": "Cancel ITEM APPROVED",
                "RETURN_ITEM_APPLIED": "RETURN ITEM REQUESTED",
                "RETURN_ITEM_APPROVED": "RETURN ITEM APPROVED",
                "PERCENT_OFF_ORDER": "% OFF ORDER",
                "AMOUNT_OFF_ORDER": " OFF ORDER",
                "PERCENT_OFF_ITEM": "% OFF ITEM",
                "APPLIED_SEGMENTATION": "TAG APPLIED",
                "APPROVED_SEGMENTATION": "TAG APPROVED",
                "ORDER_TYPES_SEATED": "SEATED",
                "ORDER_TYPES_TA": "TA",
                "ORDER_TYPES_DELIVERY": "DELIVERY",
                "ORDER_TYPES_REFUND": "REFUND",
                "ORDER_TYPES_OTC": "OTC",
                "ORDER_TYPES_MEDIAEXCHANGE": "MEDIA EXCHANGE",
                "OTH_TYPE_COMPENSATION": "COMPENSATION",
                "OTH_TYPE_CONSERVATION": "CONSERVATION",
                "OTH_TYPE_ORGANIZATIONAL": "STAFF",
                "CreditSlip": "CREDIT SLIP",
                "GiftCardCreditSlip": "GIFT CARD SLIP",
                "TransactionType": "TRANSACTION TYPE",
                "CardType": "CARD TYPE",
                "CardNumber": "CARD NO.",
                "CardHolder": "CARD HOLDER",
                "Date": "DATE/TIME",
                "Merchant": "MERCHANT CODE",
                "Sequence": "SEQUENCE NO.",
                "Response": "RESPONSE CODE",
                "Approval": "APPROVAL NO.",
                "Entry": "ENTRY METHOD",
                "Amount": "AMOUNT",
                "CheckTotal": "CHECK TOTAL",
                "Tip": "TIP",
                "Total": "TOTAL",
                "Signature": "SIGNATURE",
                "PrintCopy": "PRINT COPY",
                "Check": "CHECK",
                "Server": "SERVER",
                "Table": "TABLE",
                "Purchase": "PURCHASE",
                "CustomerCopy": "CUTOMER COPY",
                "BN_NUMBER": "B.N.",
                "PHONE": "PHONE",
                "INVOICE": "INVOICE",
                "RECEIPT": "RECEIPT",
                "FOR": "FOR",
                "CHARGE_TRANSACTION": "CHARGE TRANSACTION",
                "ALL_ORDER_OTH": "Order OTH",
                "ORDER_TYPE": "ORDER",
                "ORDER_TYPES_SEATED": "SEATED",
                "ORDER_TYPES_TA": "TA",
                "ORDER_TYPES_DELIVERY": "DELIVERY",
                "ORDER_TYPES_REFUND": "REFUND",
                "ORDER_TYPES_OTC": "OTC",
                "ORDER_TYPES_MEDIAEXCHANGE": "Media Exchange",
                "ORDER_TYPES_TAB": "TAB",
                "CHECK": "CHECK",
                "ORDER": "ORDER",
                "title": "ORDERS VIEWER",
                "printer": "Printings",
                "printerName": "Printer",
                "documentType": "Document type",
                "orderState": "Order State",
                "general": "General",
                "tip_behavior": "Tip behavior",
                "amount": "AMOUNT",
                "tip": "TIP",
                "discount": "DISCOUNT",
                "optimization": "OPTIMIZATION",
                "time_line": "Timeline",
                "action": "Action",
                "data": "DATA",
                "at": "At",
                "by": "By",
                "orders": "ITEMS",
                "item": "ITEM",
                "price": "PRICE",
                "no_orders": "NO ITEMS",
                "cancelled_items": "RETURNS & VOIDS",
                "no_cancelled_items": "No RETURNS / VOIDS",
                "unassigned_items": "Unassigned ITEMS",
                "no_unassigned_items": "No Unassigned ITEMS",
                "payments": "PAYMENTS",
                "no_payments": "NO PAYMENTS",
                "tender_type": "PAYMENT TYPE",
                "last_4": "LAST 4 DIGITS",
                "face_value": "Face Value",
                "change": "CHANGE",
                "no_changes": "NO CHANGE",
                "discounts": "DISCOUNTS",
                "discount_type": "DISCOUNT TYPE",
                "reason": "REASON",
                "no_discounts": "NO DISCOUNTS",
                "promotions": "PROMOTIONS",
                "promotion": "PROMOTION",
                "no_promotions": "NO PROMOTIONS",
                "redeem_code": "CODE",
                "return_type": "RETURN TYPE",
                "return": "RETURN",
                "comment": "COMMENT",
                "applied": "REQUESTERD BY",
                "approved": "APPROVED",
                "oth": "OTH",
                "charge_account": "CHARGE ACCOUNT",
                "cash": "CASH",
                "cheque": "CHEQUE",
                "credit": "CREDIT",
                "giftCard": "GIFT CARD",
                "giftCardLoad": "CHARGE GIFT CARD",
                "charge_account_refund": "CHARGE ACCOUNT REFUND",
                "cash_refund": "CASH REFUND",
                "cheque_refund": "CHEQUE REFUND",
                "credit_refund": "CREDIT REFUND",
                "refund": "REFUND",
                "TA": "TA",
                "delivery": "DELIVERY",
                "order": "ORDER",
                "delivery_note": "DELIVERY NOTE",
                "refund_note": "REFUND DELIVERY",
                "invoice": "INVOICE",
                "refund_invoice": "REFUND INVOICE",
                "cancel": "Cancel",
                "return": "RETURN",
                "open": "OPEN",
                "close": "CLOSE",
                "payment": "PAYMENT",
                "cancel_item_applied": "CANCEL ITEM REQUESTED",
                "cancel_item_approved": "CANCEL ITEM APPROVED",
                "return_item_applied": "RETURN ITEM REQUESTED",
                "return_item_approved": "RETURN ITEM APPROVED",
                "oth_item_applied": "ITEM OTH REQUESTED",
                "oth_item_approved": "ITEM OTH APPROVED",
                "oth_order_applied": "ORDER OTH REQUESTED",
                "oth_order_approved": "ORDER OTH APPROVED",
                "percent_off_order": "% OFF ORDER",
                "amount_off_order": " OFF ORDER",
                "percent_off_item": "% OFF ITEM",
                "amount_off_item": " OFF ITEM",
                "delivery_note_number": "DELIVERY DELIVERY ",
                "refund_note_number": "REFUND DELIVERY ",
                "invoice_number": "INVOICE ",
                "credit_invoice_number": "CREDIT INVOICE ",
                "forcedClosed": "FORCED CLOSED",
                "clubMembers": "CLUB MEMBERS",
                "orderer_name": "NAME",
                "orderer_phone": "PHONE",
                "orderer_delivery_summary": "ADDRESS",
                "orderer_delivery_notes": "NOTES",
                "orderer_courier": "DELIVERY PERSON",
                "orderer_floor": "FL",
                "orderer_apartment": "A",
                "total_inc_vat": "CHECK TOTAL",
                "total_order": "SUBTOTAL",
                "payments_print": "PAYMENTS",
                "paid": "PAID",
                "bn-number": "BN",
                "phone": "PHONE",
                "print_date": "PRINTED ON",
                "print_by_order": "Order {{order_number}} on {{order_date}} {{order_time}}",
                "copy": "COPY",
                "order_number": "ORDER",
                "table": "TABLE",
                "waiter_diners": "Server {{waiter}} Diners {{diners}} TABLE {{table}}",
                "oth_print": "OTH",
                "all_order_oth": "ORDER OTH",
                "order_discount": "ORDER Discount",
                "manual_item_discount": "Manual Discount",
                "print_date_document": "{{document_type}} created on {{order_date}} time {{order_time}}",
                "print_date_deliveryNote": "Delivery note created on {{order_date}} time {{order_time}}",
                "print_date_invoice": "Invoice created on {{order_date}} time {{order_time}}",
                "diner": "DINER",
                "paid_by": "PAID USING",
                "refunded_by": "REFUND USING",
                "charge_account_name": "CHARGE ACCOUNT NAME",
                "company": "COMPANY",
                "customer_id": "CUSTOMER ID",
                "customer_name": "NAME",
                "card_number": "CARD NUMBER",
                "order_search_comment": "Search is by order closing time",
                "from": "FROM",
                "to": "TO",
                "appliedSegmentation": "TAG APPLIED",
                "approvedSegmentation": "TAG APPROVED",
                "exclusive_tax": "EXCLUSIVE TAX",
                "inclusive_tax": "INCLUSIVE TAX",
                "inclusive_taxes": "INCLUSIVE TAXES",
                "exempted_tax": "TAX EXEMPT",
                "exempted_taxes": "EXEMPTED TAXES",
                "total_sales_amount": "TOTAL SALES",
                "included": "INCLUDED",
                "Owner": "OWNER",
                "reversal": "REVERSAL",
                "kickout": "KICKOUT",
                "Kicked_out": "KICKED OUT",
                "service_charge": "SERVICE CHARGE",
                "type": "TYPE",
                "waiter": " WAITER",
                "Diners": "GUESTS",
                "RETURN_TRANSACTION": "RETURN TRANSACTION",
                "BUSINESS_MEAL": "BUSINES MEAL",
                "BEFORE_VAT": "BEFORE VAT",
                "INCLUDE_VAT": "INCLUED VAT",
                "VAT": "VAT",
                "RETURND_IN_CHARCHACCOUNT_FROM": "RETURNED IN CHARGE ACCOUNT FROM",
                "RETURNED_IN_CREDIT_FROM": "RETURNED IN CREDIT FROM",
                "PAID_IN_CREDIT_FROM": "PAID IN CREDIT FROM",
                "TRANSACTION_TIME": "TRANSACTION TIME",
                "TRANSACTION_NO": "TRANSACTION NO.",
                "APPROVAL_NO": "APPROVAL NO.",
                "TOTAL_AMOUNT": "TOTAL AMOUNT",
                "PAID_IN_CHARCHACCOUNT_FROM": "PAID IN CHARGE ACCOUNT FROM",
                "CHARGE_ACCOUNT_NAME": "CHARGE ACCOUNT NAME",
                "PAID_GIFTCARD": "PAID BY GIFT CARD",
                "CARD_NO": "CARD NUMBER",
                "PAID_CASH": "PAID IN CASH",
                "RETURNED_CASH": "RETURNED IN CASH",
                "TOTAL_CASHBACK": "CHANGE",
                "CHANGE_TIP": "TIP CHANGE",
                "PAID_CHEQUE": "PAID BY CHEQUE",
                "RETURNED_CHEQUE": "RETURNED IN CHEQUE",
                "chargeAccountRefundInvoice": "REFUND INVOICE",
                "transactTimeText": "DATE/TIME",
                "weight": "WEIGHT",
                "ilsToKg": "ILS to kg",
                "gram": "gram",
                "kg": "kg",
                "dlrPerlb": "Dollars per lb",
                "Balance": "Bal Due",
                "uid": "IDENTIFICATION NUMBER",
                "rrn": "UNIQUE TRANSACTION ID",
                "lb": 'lb'
            },
            "he-IL": {
                "OTH": "על חשבון הבית",
                "MANUAL_ITEM_DISCOUNT": "הנחה יזומה",
                "TOTAL_ORDER": "סה\"כ הזמנה",
                "ORDER_DISCOUNT": "הנחת חשבון",
                "ECVLUSIVE_TAX": "מס שנוסף להזמנה",
                "SERVICE_CHARGE": "Service Charge",
                "TIP": "תשר",
                "TOTAL_INC_VAT": "סה\"כ לתשלום",
                "CHANGE": "עודף",
                "INCLUSIVE_TAXES": "Inclusive Taxes",
                "EXEMPTED_TAXES": "Exempted Taxes",
                "EXEMPTED_TAX": "TAX EXEMPT",
                "REVERSAL": "ביטול",
                "RETURN": "החזרה",
                "REFUND": "החזר",
                "Server": "מלצר",
                "PRINT_BY_ORDER": "לפי הזמנה מס' {{order_number}} בתאריך {{order_date}} בשעה {{order_time}}",
                "WAITER_DINERS": "מלצר {{waiter}} סועדים {{diners}}",
                "TABLE_NUM": "שולחן {{table}}",
                "TA": "TA",
                "DELIVERY": "משלוחים",
                "INITIATED_DISCOUNT": "הנחה יזומה",
                "CANCEL": "ביטול",
                "CUSTOMER_NAME": "שם",
                "LAST_4": "4 ספרות",
                "AMOUNT": "סכום",
                "CHARGE_ACCOUNT": "הקפה",
                "CASH": "מזומן",
                "GIFT_CARD": "כרטיס תשלום",
                "GIFT_CARD_LOAD": "טעינת כרטיס תשלום",
                "CHEQUE": "המחאה",
                "CREDIT": "אשראי",
                "CHARGE_ACCOUNT_REFUND": "החזר הקפה",
                "CASH_REFUND": "החזר מזומן",
                "CHEQUE_REFUND": "החזר המחאה",
                "CREDIT_REFUND": "החזר אשראי",
                "OPEN": "פתיחה",
                "ORDER": "הזמנה",
                "CLOSE": "סגירה",
                "PAYMENT": "תשלום",
                "OTH_ORDER_APPLIED": "בקשה ל-OTH חשבון",
                "OTH_ORDER_APPROVED": "אישור OTH חשבון",
                "OTH_ITEM_APPLIED": "בקשה ל-OTH פריט",
                "OTH_ITEM_APPROVED": "אישור OTH פריט",
                "CANCEL_ITEM_APPLIED": "בקשה לביטול פריט",
                "CANCEL_ITEM_APPROVED": "אישור ביטול פריט",
                "RETURN_ITEM_APPLIED": "בקשה להחזרת פריט",
                "RETURN_ITEM_APPROVED": "אישור החזרת פריט",
                "PERCENT_OFF_ORDER": "% הנחת הזמנה",
                "AMOUNT_OFF_ORDER": " הנחת סכום הזמנה",
                "PERCENT_OFF_ITEM": "% הנחת פריט",
                "APPLIED_SEGMENTATION": "בקשה לתיוג",
                "APPROVED_SEGMENTATION": "אישור תיוג",
                "ORDER_TYPE": "הזמנת",
                "ORDER_TYPES_SEATED": "ישיבה",
                "ORDER_TYPES_TA": " TA",
                "ORDER_TYPES_DELIVERY": "משלוח",
                "ORDER_TYPES_REFUND": "החזר",
                "ORDER_TYPES_OTC": "דלפק (OTC)",
                "ORDER_TYPES_MEDIAEXCHANGE": "טעינת כרטיס",
                "OTH_TYPE_COMPENSATION": "פיצוי לקוחות",
                "OTH_TYPE_CONSERVATION": "שימור לקוחות",
                "OTH_TYPE_ORGANIZATIONAL": "עובדים",
                "BN_NUMBER": "ח.פ.",
                "PHONE": "טל'",
                "INVOICE": "חשבונית מס",
                "RECEIPT": "קבלה",
                "FOR": "עבור",
                "BN_OR_SN": "ח.פ / ת.ז",
                "ALL_ORDER_OTH": "הזמנה על חשבון הבית",
                "CHARGE_TRANSACTION": "עסקת חיוב הקפה",
                "ORDER_TYPES_SEATED": "ישיבה",
                "ORDER_TYPES_TA": " TA",
                "ORDER_TYPES_DELIVERY": "משלוח",
                "ORDER_TYPES_REFUND": "החזר",
                "ORDER_TYPES_OTC": "דלפק (OTC)",
                "ORDER_TYPES_MEDIAEXCHANGE": "טעינת כרטיס",
                "ORDER_TYPES_TAB": "חשבון",
                "CHECK": "חשבון",
                "title": "איתור הזמנה",
                "orderState": "מצב הזמנה",
                "general": "כללי",
                "tip_behavior": "סוג טיפ",
                "printerName": "מדפסת",
                "documentType": "סוג הדפסה",
                "printer": "הדפסות",
                "amount": "סכום",
                "tip": "תשר",
                "discount": "הנחה",
                "optimization": "אופטימיזציה",
                "time_line": "ציר זמן",
                "action": "פעולה",
                "data": "מידע",
                "at": "זמן",
                "by": "ע\"י",
                "orders": "מנות",
                "item": "פריט",
                "price": "מחיר",
                "no_orders": "אין מנות",
                "cancelled_items": "ביטולים והחזרות",
                "no_cancelled_items": "אין ביטולים והחזרות",
                "unassigned_items": "פריטים לא משוייכים",
                "no_unassigned_items": "אין פריטים לא משוייכים",
                "payments": "תשלומים",
                "no_payments": "אין תשלומים",
                "tender_type": "סוג תשלום",
                "last_4": "4 ספרות",
                "face_value": "ערך נקוב",
                "change": "עודף",
                "no_changes": "אין תשלומים",
                "discounts": "הנחות",
                "discount_type": "סוג הנחה",
                "reason": "סיבה",
                "no_discounts": "אין הנחות",
                "promotions": "מבצעים",
                "promotion": "מבצע",
                "no_promotions": "אין מבצעים",
                "redeem_code": "קוד",
                "return_type": "סוג ביטול",
                "return": "ביטול",
                "comment": "הערה",
                "applied": "בקשה ע\"י",
                "approved": "אישור ע\"י",
                "oth": "OTH",
                "charge_account": "הקפה",
                "cash": "מזומן",
                "cheque": "המחאה",
                "credit": "אשראי",
                "giftCard": "כרטיס תשלום",
                "giftCardLoad": "טעינת כרטיס תשלום",
                "charge_account_refund": "החזר הקפה",
                "cash_refund": "החזר מזומן",
                "cheque_refund": "החזר המחאה",
                "credit_refund": "החזר אשראי",
                "refund": "החזר",
                "TA": "TA",
                "delivery": "משלוח",
                "order": "הזמנה",
                "delivery_note": "תעודת משלוח",
                "refund_note": "תעודת החזר",
                "invoice": "חשבונית",
                "refund_invoice": "חשבונית החזר",
                "cancel": "ביטול",
                "return": "החזרה",
                "open": "פתיחה",
                "close": "סגירה",
                "payment": "תשלום",
                "cancel_item_applied": "בקשה לביטול פריט",
                "cancel_item_approved": "אישור ביטול פריט",
                "return_item_applied": "בקשה להחזרת פריט",
                "return_item_approved": "אישור החזרת פריט",
                "oth_item_applied": "בקשה ל-OTH פריט",
                "oth_item_approved": "אישור OTH פריט",
                "oth_order_applied": "בקשה ל-OTH חשבון",
                "oth_order_approved": "אישור OTH חשבון",
                "percent_off_order": "% הנחת הזמנה",
                "amount_off_order": " הנחת סכום הזמנה",
                "percent_off_item": "% הנחת פריט",
                "amount_off_item": " הנחת סכום פריט",
                "delivery_note_number": "תעודת משלוח מס ",
                "refund_note_number": "תעודת זיכוי מס ",
                "invoice_number": "חשבונית מס קבלה מס ",
                "credit_invoice_number": "חשבונית זיכוי מס ",
                "forcedClosed": "Forced Closed",
                "clubMembers": "חברי מועדון",
                "orderer_name": "שם",
                "orderer_phone": "טלפון",
                "orderer_delivery_summary": "כתובת",
                "orderer_delivery_notes": "הערות כתובת",
                "orderer_courier": "שליח",
                "orderer_floor": "ק",
                "orderer_apartment": "ד",
                "total_inc_vat": "סה\"כ לתשלום",
                "total_order": "סה\"כ הזמנה",
                "payments_print": "התקבל",
                "bn-number": "ח.פ.",
                "phone": "טל'",
                "print_date": "הודפס בתאריך",
                "print_by_order": "לפי הזמנה מס' {{order_number}} בתאריך {{order_date}} בשעה {{order_time}}",
                "copy": "העתק",
                "order_number": "הזמנה מס'",
                "table": "שולחן",
                "waiter_diners": "מלצר {{waiter}} סועדים {{diners}} שולחן {{table}}",
                "oth_print": "על חשבון הבית",
                "all_order_oth": "הזמנה על חשבון הבית",
                "order_discount": "הנחת חשבון",
                "manual_item_discount": "הנחה יזומה",
                "print_date_document": "{{document_type}} הופקה בתאריך {{order_date}} בשעה {{order_time}}",
                "print_date_deliveryNote": "תעודת משלוח הופקה בתאריך {{order_date}} בשעה {{order_time}}",
                "print_date_invoice": "חשבונית הופקה בתאריך {{order_date}} בשעה {{order_time}}",
                "diner": "אירוח",
                "paid_by": "התקבל ב",
                "refunded_by": "הוחזר ב",
                "charge_account_name": "חשבון הקפה",
                "company": "חברה",
                "customer_id": "ח.פ / ת.ז",
                "customer_name": "שם",
                "card_number": "מספר כרטיס",
                "order_search_comment": "חיפוש ההזמנה הינו לפי שעת סגירתה",
                "from": "מ-",
                "to": "עד",
                "appliedSegmentation": "בקשה לתיוג",
                "approvedSegmentation": "אישור תיוג",
                "exclusive_tax": "מס שנוסף להזמנה",
                "inclusive_tax": "מס כלול",
                "inclusive_taxes": "מסים כלולים",
                "total_sales_amount": "סה\"כ הזמנה",
                "included": "כלול",
                "Owner": "Owner",
                "reversal": "ביטול",
                "kickout": "Kickout",
                "Kicked_out": "Kicked out",
                "service_charge": "Service Charge",
                "type": "סוג",
                "waiter": " מלצר/ית",
                "Diners": "סועדים",
                "RETURN_TRANSACTION": "החזרת עסקה",
                "BUSINESS_MEAL": "ארוחה עסקית",
                "BEFORE_VAT": "חייב במע\"מ",
                "INCLUDE_VAT": "כולל מע\"מ",
                "VAT": "מע\"מ",
                "RETURND_IN_CHARCHACCOUNT_FROM": "הוחזר בהקפה מ ",
                "RETURNED_IN_CREDIT_FROM": "הוחזר באשראי מ",
                "PAID_IN_CREDIT_FROM": "שולם באשראי מ",
                "TRANSACTION_TIME": "זמן העסקה",
                "TRANSACTION_NO": "מספר עסקה",
                "APPROVAL_NO": "Approval no.",
                "APPROVAL_NO": "מספר אישור",
                "TOTAL_AMOUNT": "סה\"כ לתשלום",
                "PAID_IN_CHARCHACCOUNT_FROM": "התקבל בהקפה מ ",
                "CHARGE_ACCOUNT_NAME": "חשבון הקפה",
                "PAID_GIFTCARD": "התקבל בכרטיס מתנה",
                "CARD_NO": "מספר כרטיס",
                "PAID_CASH": "התקבל במזומן",
                "RETURNED_CASH": "הוחזר במזומן",
                "TOTAL_CASHBACK": "עודף",
                "CHANGE_TIP": "עודף טיפ",
                "PAID_CHEQUE": "התקבל בהמחאה",
                "RETURNED_CHEQUE": "הוחזר בהמחאה",
                "chargeAccountRefundInvoice": "חשבונית זיכוי",
                "weight": "משקל",
                "ilsToKg": "ש\"ח לק\"ג",
                "gram": "גרם",
                "kg": "ק\"ג",
                "dlrPerlb": "דולרים לליברה",
                "Balance": "יתרה לתשלום",
                "uid": "מספר מזהה",
                "rrn": "מזהה עסקה ייחודי"

            }
        }
    }

    configure(options) {
        if (options.locale) this._options.locale = options.locale;
    }

    getText(key, keys, values) {
        if (key !== undefined) {


            let text = this._translate()[this._options.locale][key];
            if (text !== undefined) {

                if ((keys !== undefined && values !== undefined) && keys.length > 0 && values.length > 0) {
                    keys.forEach((itemKey, index) => {
                        text = text.replace("{{" + itemKey + "}}", values[index]);
                    });
                }

                return text;
            }
            else {
                return `[${key}]`;
            }
        }
        else {
            return "Missing Key";
        }
    }
}

