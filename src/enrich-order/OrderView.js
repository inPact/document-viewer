
window.DocumentViewer.OrderViewService = (function () {

  function OrderViewService(options) {
    _configure(options);
  }

  let translateService;
  let utils;
  let moment;
  let discountsService;
  let promotionsService;
  let timeLineService;
  let userService;
  let othService;
  let paymentsService;
  let tableService;
  let coursesService;
  let dishesService;
  let itemsService;

  let isUS = false;
  const _options = {};

  function _configure(options) {
    if (options.locale) _options.local = options.locale;
    if (options.isUS !== undefined) {
      _options.isUS = options.isUS;
      isUS = options.isUS;
    };

    if (options.moment) {
      moment = options.moment;
    }
    else {
      moment = window.moment;
    }

    translateService = new window.DocumentViewer.EnrichOrderTranslateService({
      local: _options.local
    });

    utils = new window.DocumentViewer.Utils();

    discountsService = new window.DocumentViewer.DiscountsService({
      local: _options.local
    });

    promotionsService = new window.DocumentViewer.PromotionsService();

    timeLineService = new window.DocumentViewer.TimeLineService({
      local: _options.local
    });

    userService = new window.DocumentViewer.UserService();

    othService = new window.DocumentViewer.OthService({
      local: _options.local
    });

    tableService = new window.DocumentViewer.TableService({
      local: _options.local
    });

    paymentsService = new window.DocumentViewer.PaymentsService({
      local: _options.local
    });

    coursesService = new window.DocumentViewer.CoursesService();

    dishesService = new window.DocumentViewer.DishesService();

    itemsService = new window.DocumentViewer.ItemsService({
      local: _options.local
    });
  }

  // Enums
  const Enums = {
    PaymentTypes: {
      OTH: 'OTH',
      CreditCardPayment: 'CreditCardPayment',
      ChargeAccountPayment: 'ChargeAccountPayment',
      CashPayment: 'CashPayment',
      ChequePayment: 'ChequePayment',
      CreditCardPayment: 'CreditCardPayment',
      ChargeAccountRefund: 'ChargeAccountRefund',
      CashRefund: 'CashRefund',
      ChequeRefund: 'ChequeRefund',
      CreditCardRefund: 'CreditCardRefund',
    },
    OrderTypes: {
      Refund: "Refund",
      TA: "TA",
      Delivery: "Delivery",
      Seated: "Seated",
      OTC: "OTC"
    },
    ReturnTypes: {
      Cancellation: 'cancellation',
      TransactionBased: "TRANSACTION BASED"
    },
    DiscountTypes: {
      OTH: "OTH",
    },
    OfferTypes: {
      Simple: "Simple",
      Combo: 'Combo',
      ComplexOne: 'Complex-One'
    },
    TransTypes: {
      Reversal: "Reversal",
      Return: "Return"
    },
    Sources: {
      TabitPay: "tabitPay"
    },
    ActionTypes: {
      kickout: 'kickout',
      resume: 'resume',
      suspend: 'suspend'
    },
    Resume_Suspend: {
      manual: 'manual',
      manager: 'manager',
      other: 'other',
    }
  }


  let billService = {
    filterOmittedPayments: function (payments) {

      let omittedOrders = [];

      let filteredItems = payments.forEach(p => {
        if (p.PROVIDER_TRANS_STATUS === 'omitted') {
          if (p.CANCELED) {

            let findRefundPayment = payments.find(r => {
              return !r.CANCELED && r.PAYMENT_TYPE === "REFUND" && r.P_AMOUNT === p.P_AMOUNT && r.PROVIDER_TRANS_STATUS === 'omitted';
            })

            if (findRefundPayment) {
              omittedOrders.push(p)
              omittedOrders.push(findRefundPayment)
            }

          }
        }
      })

      if (omittedOrders.length > 0) {
        omittedOrders.forEach(i => {
          let findPayment = payments.findIndex(p => {
            return p.P_ID === i.P_ID;
          })
          if (findPayment !== -1) {
            payments.splice(findPayment, 1)
          }
        })
      }

      return payments;

    },

    resolveItems: function (variables, collections) {

      let isReturnOrder = false;
      if (variables.RETURN_TYPE === Enums.ReturnTypes.TransactionBased) {
        isReturnOrder = true;
      }

      let offersList = collections.ORDERED_OFFERS_LIST;
      if (isReturnOrder) {
        offersList = collections.RETURNED_OFFERS_LIST;
      }

      let isTaxExempt = false;
      if ((collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && isUS)) {
        isTaxExempt = true;
      }

      let items = [];
      let oth = [];

      if (offersList && offersList.length > 0) {
        offersList.forEach(offer => {

          let offerQyt = 0;
          if (offer.SPLIT_DENOMINATOR && offer.SPLIT_NUMERATOR && offer.SPLIT_DENOMINATOR !== 100 && offer.SPLIT_NUMERATOR !== 100) {
            offerQyt = `${offer.SPLIT_NUMERATOR}/${offer.SPLIT_DENOMINATOR}`;
          } else {
            offerQyt = offer.OFFER_QTY
          }

          if (offer.OFFER_TYPE == Enums.OfferTypes.Simple) {
            let item = {
              isOffer: true,
              name: offer.OFFER_NAME,
              qty: offerQyt
            };

            if (offer.ON_THE_HOUSE) {
              item.amount = translateService.getText('OTH');
              oth.push(item)
            } else {

              if (isReturnOrder) {
                item.amount = utils.toFixedSafe(offer.OFFER_AMOUNT, 2)
                items.push(item);
              } else if (offer.OFFER_CALC_AMT !== 0 && offer.OFFER_CALC_AMT !== null) { // if the offer amount is 0 not need to show
                item.amount = utils.toFixedSafe(offer.OFFER_CALC_AMT, 2)
                items.push(item);
              }

              if (offer.OPEN_PRICE) {
                item.amount = utils.toFixedSafe(offer.OFFER_AMOUNT, 2)
                items.push(item);
              }
            }

            if (offer.ORDERED_OFFER_DISCOUNTS && offer.ORDERED_OFFER_DISCOUNTS.length > 0) {
              offer.ORDERED_OFFER_DISCOUNTS.forEach(discount => {
                items.push({
                  isOfferDiscount: true,
                  name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : translateService.getText('MANUAL_ITEM_DISCOUNT'),
                  qty: null,
                  amount: utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                })
              });
            }

            if (offer.EXTRA_CHARGE_LIST && offer.EXTRA_CHARGE_LIST.length > 0) {
              offer.EXTRA_CHARGE_LIST.forEach(extraCharge => {

                if (extraCharge.EXTRA_CHARGE_MODIFIERS_LIST && extraCharge.EXTRA_CHARGE_MODIFIERS_LIST.length > 0) {
                  extraCharge.EXTRA_CHARGE_MODIFIERS_LIST.forEach(modifier => {
                    items.push({
                      isItem: true,
                      name: modifier.MODIFIER_NAME,
                      qty: null,
                      amount: item.ON_THE_HOUSE ? translateService.getText('OTH') : utils.toFixedSafe(modifier.MODIFIER_PRICE, 2)
                    });

                    if (modifier.MODIFIER_DISCOUNTS && modifier.MODIFIER_DISCOUNTS.length > 0) {
                      modifier.MODIFIER_DISCOUNTS.forEach(discount => {
                        items.push({
                          isItem: true,
                          name: discount.DISCOUNT_NAME,
                          qty: null,
                          amount: item.ON_THE_HOUSE ? translateService.getText('OTH') : utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                        });
                      });
                    }

                  })
                }
                if (extraCharge.ITEM_DISCOUNTS && extraCharge.ITEM_DISCOUNTS.length > 0) {
                  extraCharge.ITEM_DISCOUNTS.forEach(discount => {
                    items.push({
                      isItem: true,
                      name: discount.DISCOUNT_NAME,
                      qty: null,
                      amount: utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                    })
                  })
                }

              });
            }

          }

          if ([Enums.OfferTypes.ComplexOne, Enums.OfferTypes.Combo].indexOf(offer.OFFER_TYPE) > -1) {

            items.push({
              isOffer: true,
              name: offer.OFFER_NAME,
              qty: offerQyt,
              amount: offer.ON_THE_HOUSE ? translateService.getText('OTH') : utils.toFixedSafe(isReturnOrder ? offer.OFFER_AMOUNT : offer.OFFER_CALC_AMT, 2)
            });

            if (!isReturnOrder) {
              if (offer.ORDERED_ITEMS_LIST && offer.ORDERED_ITEMS_LIST.length > 0)
                offer.ORDERED_ITEMS_LIST.forEach(item => {
                  items.push({
                    isItem: true,
                    name: item.ITEM_NAME,
                    qty: null,
                    amount: null
                  })
                });
            }

            if (!isReturnOrder) {

              if (offer.EXTRA_CHARGE_LIST && offer.EXTRA_CHARGE_LIST.length > 0) {
                offer.EXTRA_CHARGE_LIST.forEach(item => {

                  if (item.EXTRA_CHARGE_MODIFIERS_LIST && item.EXTRA_CHARGE_MODIFIERS_LIST.length > 0) {
                    item.EXTRA_CHARGE_MODIFIERS_LIST.forEach(modifier => {
                      items.push({
                        isItem: true,
                        name: modifier.MODIFIER_NAME,
                        qty: null,
                        amount: item.ON_THE_HOUSE ? translateService.getText('OTH') : utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                      })
                    })
                  }
                  else if (item.ITEM_DISCOUNTS && item.ITEM_DISCOUNTS.length > 0) {

                    items.push({
                      isItem: true,
                      name: item.ITEM_NAME,
                      qty: null,
                      amount: utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                    })

                    if (item.ITEM_DISCOUNTS && item.ITEM_DISCOUNTS.length > 0) {
                      item.ITEM_DISCOUNTS.forEach(discount => {
                        items.push({
                          isItem: true,
                          name: discount.DISCOUNT_NAME,
                          qty: null,
                          amount: utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                        })
                      })
                    }
                  }
                  else {
                    items.push({
                      isItem: true,
                      name: item.ITEM_NAME,
                      qty: null,
                      amount: item.ON_THE_HOUSE ? translateService.getText('OTH') : utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                    })
                  }

                });
              }
            }

            if (offer.ORDERED_OFFER_DISCOUNTS && offer.ORDERED_OFFER_DISCOUNTS.length > 0) {
              offer.ORDERED_OFFER_DISCOUNTS.forEach(discount => {
                items.push({
                  isOfferDiscount: true,
                  name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : translateService.getText('MANUAL_ITEM_DISCOUNT'),
                  qty: null,
                  amount: utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                })
              })
            }
          }
        });
      }

      return {
        items: items,
        oth: oth,
        isReturnOrder: isReturnOrder,
        isTaxExempt: isTaxExempt
      };

    },
    resolveTotals: function (order, collections, isCheck) {
      let totals = [];

      if (order.TOTAL_SALES_AMOUNT !== undefined && ((collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) ||
        order.TOTAL_TIPS !== undefined ||
        (isUS && collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0))) {
        totals.push({
          name: translateService.getText('TOTAL_ORDER'),
          amount: utils.toFixedSafe(order.TOTAL_SALES_AMOUNT, 2)
        })
      }

      if (collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) {
        collections.ORDER_DISCOUNTS_LIST.forEach(discount => {
          totals.push({
            name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : translateService.getText('ORDER_DISCOUNT'),
            amount: utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
          })
        })
      }
      if (collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0 && isUS) {
        collections.EXCLUSIVE_TAXES.forEach(tax => {
          totals.push({
            type: 'exclusive_tax',
            name: tax.NAME ? tax.NAME : translateService.getText('ECVLUSIVE_TAX'),
            amount: utils.toFixedSafe(tax.AMOUNT, 2),
            rate: tax.RATE
          })
        })
      }

      if (collections.TIPS) {

        let autoGratuityTips = collections.TIPS.filter(c => c.SCOPE === "order");
        if (autoGratuityTips && autoGratuityTips.length > 0) {

          //Service charge
          if (autoGratuityTips && autoGratuityTips.length > 0 && isUS) {
            autoGratuityTips.forEach(tip => {

              let _name = tip.NAME ? tip.NAME : translateService.getText('SERVICE_CHARGE')
              let _percent = tip.PERCENT;
              if (_percent !== undefined) {
                _name = tip.NAME ? `${tip.NAME} ${_percent}%` : `${translateService.getText('SERVICE_CHARGE')} ${_percent}%`;
              }

              if (tip.AMOUNT !== 0) {
                totals.push({
                  type: 'service_charge',
                  name: _name,
                  amount: utils.toFixedSafe(tip.AMOUNT, 2)
                })

              }

            })
          }
        }

      }

      if (order.TOTAL_TIPS_ON_PAYMENTS !== undefined || order.TOTAL_TIPS !== undefined) {

        let tipAmount = 0;
        if (order.TOTAL_TIPS_ON_PAYMENTS !== undefined && order.TOTAL_TIPS_ON_PAYMENTS !== 0) { tipAmount = order.TOTAL_TIPS_ON_PAYMENTS; }
        else if (order.TOTAL_TIPS !== undefined && order.TOTAL_TIPS !== 0) { tipAmount = order.TOTAL_TIPS; }

        if (tipAmount > 0) {
          totals.push({
            type: 'tips',
            name: translateService.getText('TIP'),
            amount: utils.toFixedSafe(tipAmount, 2)
          })
        }
        //if it is a returned order, the tip is negative and needs to be presented
        if (collections.PAYMENT_LIST[0].TRANS_TYPE === Enums.TransTypes.Return) {
          if (collections.PAYMENT_LIST[0].TIP_AMOUNT !== 0) {
            totals.push({
              type: 'tips',
              name: translateService.getText('TIP'),
              amount: utils.toFixedSafe(-1 * collections.PAYMENT_LIST[0].TIP_AMOUNT, 2)
            })
          }
        }
      }

      if (!isUS) {
        totals.push({
          name: translateService.getText('TOTAL_INC_VAT'),
          amount: utils.toFixedSafe(order.TOTAL_IN_VAT || 0, 2)
        })
      }

      if (isUS) {
        totals.push({
          name: translateService.getText('TOTAL_INC_VAT'),
          amount: utils.toFixedSafe(order.TOTAL_AMOUNT || 0, 2)
        })
      }

      return totals;
    },
    resolvePayments: function (order, collections, isCheck) {

      let filteredPyaments = billService.filterOmittedPayments(collections.PAYMENT_LIST);
      let payments = [];

      filteredPyaments.forEach(payment => {
        payments.push({
          name: billService.resolvePaymentName(payment),
          amount: payment.PAYMENT_TYPE ? utils.toFixedSafe(payment.P_AMOUNT * -1, 2) : utils.toFixedSafe(payment.P_AMOUNT, 2),
          holderName: payment.CUSTOMER_NAME !== undefined ? payment.CUSTOMER_NAME : '',
          md: {
            payment: payment
          }
        });
      });

      payments.push({
        type: 'change',
        name: translateService.getText('CHANGE'),
        amount: utils.toFixedSafe(order.CHANGE, 2)
      });

      return payments;
    },
    resolveTaxes: function (variables, collections, isCheck) {

      let taxes = {
        InclusiveTaxes: [],
        ExemptedTaxes: [],
        ExemptedTaxData: []
      };

      if (collections.INCLUSIVE_TAXES && collections.INCLUSIVE_TAXES.length > 0 && isUS) {

        taxes.InclusiveTaxes.push({
          type: 'title',
          name: `${translateService.getText('INCLUSIVE_TAXES')}:`,
          amount: undefined
        })

        collections.INCLUSIVE_TAXES.forEach(tax => {
          taxes.InclusiveTaxes.push({
            type: 'inclusive_tax',
            name: tax.NAME ? tax.NAME : translateService.getText('INCLUSIVE_TAXES'),
            amount: utils.toFixedSafe(tax.AMOUNT, 2)
          })
        })
      }

      if (collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && isUS) {

        taxes.ExemptedTaxes.push({
          type: 'title',
          name: `${translateService.getText('EXEMPTED_TAXES')}:`,
          amount: undefined
        })

        collections.EXEMPTED_TAXES.forEach(tax => {
          taxes.ExemptedTaxes.push({
            type: 'exempted_tax',
            name: tax.NAME ? tax.NAME : translateService.getText('EXEMPTED_TAX'),
            amount: utils.toFixedSafe(tax.AMOUNT, 2)
          })
        });
      }

      return taxes;

    },
    resolvePaymentName: function (payment) {
      let refund = '';
      let paymentName = '';

      if (payment.PAYMENT_TYPE === 'REFUND') {

        if (payment.TRANS_TYPE === Enums.TransTypes.Reversal) {
          refund = translateService.getText('REVERSAL');
        }
        else if (payment.TRANS_TYPE === Enums.TransTypes.Return) {
          refund = translateService.getText('RETURN');
        }
        else {
          refund = translateService.getText('REFUND');
        }

      }

      if (payment.P_TENDER_TYPE === 'creditCard' || payment.P_TENDER_TYPE === 'gidtCard') {
        paymentName = refund !== '' ? `${refund} (${payment.CARD_TYPE} ${payment.LAST_4})` : `${payment.CARD_TYPE} ${payment.LAST_4}`;
      } else {
        paymentName = `${refund} ${payment.P_NAME}`;
      }

      return paymentName;

    },
    resolvePrintByOrder: function (variables) {

      return translateService.getText('PRINT_BY_ORDER',
        ["order_number", "order_date", "order_time"],
        [variables.ORDER_NO, isUS ? moment(variables.CREATED_AT).format('MM/DD/YYYY') : moment(variables.CREATED_AT).format('DD/MM/YYYY'),
          isUS ? moment(variables.CREATED_AT).format('h:mm:ss A') : moment(variables.CREATED_AT).format('HH:mm:ss')]
      );
    },
    resolveWaiterDiners: function (variables) {

      let DISPLAY_NAME = "";
      if (variables.F_NAME !== undefined) {
        DISPLAY_NAME += variables.F_NAME;
      }

      if (variables.L_NAME !== undefined) {
        DISPLAY_NAME += ` ${variables.L_NAME[0]}`;
      }

      let TABLE_NO = "";
      if (variables.TABLE_NO !== undefined) {
        TABLE_NO = variables.TABLE_NO;
      }

      let RESULT_TEXT = "";

      let _TEXT_WAITER_N_DINERS = translateService.getText('WAITER_DINERS',
        ["waiter", "diners"],
        [`${DISPLAY_NAME}`, variables.NUMBER_OF_GUESTS]
      );

      RESULT_TEXT += _TEXT_WAITER_N_DINERS;

      // if (TABLE_NO !== "") {
      //     let _TEXT_TABLE = translateService.getText('TABLE_NUM',
      //         ["table"],
      //         [TABLE_NO]
      //     );

      //     RESULT_TEXT += ` ${_TEXT_TABLE}`;
      // }

      return RESULT_TEXT;
    }
  }

  function _enrichOrder(options) {
    let tlogId = options.tlogId;
    let tlog = options.tlog;
    let status = options.status;
    let tables = options.tables;
    let items = options.items;
    let users = options.users;
    let promotions = options.promotions;
    let modifierGroups = options.modifierGroups;
    let offers = options.offers;

    let ResultOrder = {};

    //  Tlog data.
    let _tlogId = tlogId;
    let _tlog = tlog;
    let _status = status;

    //  Resources.
    let Resources = {
      Tables: tables,
      Items: items,
      Users: users,
      Offers: offers,
      Promotions: promotions,
      AllModifiers: modifierGroups
    }


    /**
     * resolve object Order / Tlog.
     * @param { Object } tlog
     */
    function _resolveObject(tlog) {
      let _result;
      if (tlog.order === undefined) {
        _result = tlog;
      }
      else {
        _result = tlog.order[0];
      }
      return _result;
    }

    function _resolveId(tlog) {
      return tlog.id || tlog._id;
    }

    /**
     * resolve total cashback
     * @param { Object } ResultOrder
     */
    function _resolveTotalCashback(payments) {

      let _totalCashback = 0;
      payments.forEach(payment => {
        _totalCashback += _.has(payment, 'auxAmount') ? payment.auxAmount : 0;
      });

      return _totalCashback ? _totalCashback / 100 : 0;;
    }

    function _resolveDinersNum(diners) {
      return diners.length;
    }

    function _resolveTotalAmount(totalAmount) {
      return totalAmount / 100;
    }

    function _resolveClosedDate(closed) {
      return closed;
    }

    function _resolveHasQuantitySale(order) {

      let hasQuantitySale = false;

      let orderedOffers = order.orderedOffers;

      orderedOffers.forEach(offer => {
        if (offer.quantitySaleId) {
          hasQuantitySale = true;
        }
      });

      return hasQuantitySale;

    }

    function _resolveCourier(order) {
      return userService.resolveUser({ userId: order.courier, users: Resources.Users });
    }

    function _resolveDeliveryNotes(deliveryNotes, tlogId) {
      if (deliveryNotes) {
        deliveryNotes.forEach(item => {
          item.tlogId = tlogId;
          if (item.payments) {
            item.cardNum = item.payments[0].cardNum;
            item.providerTransactionId = item.payments[0].providerTransactionId === undefined ? '' : item.payments[0].providerTransactionId;
            if (item.payments[0].providerResponse) {
              item.companyName = item.payments[0].providerResponse.companyName === undefined ? '' : item.payments[0].providerResponse.companyName;
            }
          }
        });
      }

      return deliveryNotes;
    }

    function _resolveInvoices(invoices, tlogId) {
      if (invoices) {
        invoices.forEach(item => {
          item.tlogId = tlogId;
          if (item.payments && item.payments[0]._type === Enums.PaymentTypes.CreditCardPayment) {
            item.confirmationNum = item.payments[0].confirmationNum === undefined ? '' : item.payments[0].confirmationNum;
            item.issuerName = _.get(item, 'payments[0].issuer.name') ? item.payments[0].issuer.name : '';
            if (item.payments[0].providerResponse) {
              item.last4 = item.payments[0].providerResponse.Last4;
              item.CCType = item.payments[0].providerResponse.CCType;
              item.transId = item.payments[0].providerResponse.TransID;
            }
          }
        });
      }

      return invoices;
    }


    function _resolveClubMembers(order) {
      let _clubMembers = [];

      if (order.diners.length) {
        _clubMembers = _.chain(order.diners)
          .filter(diner => {
            if (diner.member) return diner;
          }).map(diner => {
            return {
              firstName: diner.member.firstName,
              lastName: diner.member.lastName,
              phone: diner.member.phone
            }
          }).value();
      }

      return _clubMembers;
    }



    function _resolveOrderedOffer(offerId) {
      return Resources.Offers.find(offer => offer._id === offerId)
    }

    function _resolveOrderedOferModifiers(modifiers) {

      let _modifiers = [];
      modifiers.forEach(modifierItem => {
        _modifiers.push(modifierItem);
      });

      return _modifiers;
    }

    function _resolveItemsByOrderedOffers(order) {


      let _orderedOffers = order.orderedOffers;
      let _orderedItems = order.orderedItems;

      let _discounts = order.orderedDiscounts;



      let items = [];

      if (_orderedOffers) {
        _orderedOffers.forEach(itemOrderedOffer => {

          if (!itemOrderedOffer.cancellation) {
            let _item = { name: itemOrderedOffer.name, price: itemOrderedOffer.price, _id: itemOrderedOffer._id };

            if (itemOrderedOffer.onTheHouse) {
              _item.onTheHouse = translateService.getText('OTH')
            }


            items.push(_item);

            itemOrderedOffer.orderedItems.forEach(orderedItem => {

              let _orderedItem = _orderedItems.find(item => item._id === orderedItem);

              let _discount = _discounts.find(c => c.target === orderedItem._id);


              if (_discount) {
                _orderedItem.discount = _discount;
              }

              if (!_orderedItem.price) {
                _orderedItem.price = 0;
              }

              _orderedItem.item = Resources.Items.find(c => c._id === _orderedItem.item);

              if (_orderedItem.item) {
                _orderedItem.item.price = _orderedItem.price;
                items.push(_orderedItem.item);
              }


              _orderedItem.selectedModifiers = _resolveOrderedOferModifiers(_orderedItem.selectedModifiers);
              if (_orderedItem.selectedModifiers) {
                _orderedItem.selectedModifiers.forEach(selectedModifierItem => {

                  let _discount = _discounts.find(c => c.target === orderedItem._id);
                  if (_discount) {
                    selectedModifierItem.discount = _discount;
                  }

                  items.push({
                    name: selectedModifierItem.name,
                    price: selectedModifierItem.price,
                    type: 'modifier',
                    _id: selectedModifierItem._id

                  });
                });

                let _notDefaultSelectedModifiers = [];
                if (_orderedItem.selectedModifiers) {
                  _orderedItem.selectedModifiers.forEach(selectedModifier => {
                    _notDefaultSelectedModifiers.push(selectedModifier);
                  });
                }

                itemOrderedOffer.notDefaultSelectedModifiers = _notDefaultSelectedModifiers;

                let _allRemovedModifiers = [];
                if (_orderedItem.removedModifiers) {
                  _orderedItem.removedModifiers.forEach(removedModifier => {
                    _allRemovedModifiers.push(removedModifier);
                  });
                }
                itemOrderedOffer.allRemovedModifiers = _allRemovedModifiers;
              }

            });
            //}

            itemOrderedOffer.offer = _resolveOrderedOffer(itemOrderedOffer.offer);
          }

        });
      }

      return {
        items: items,
        orderedOffers: _orderedOffers
      };
    }





    function _resolveOrderTypeDisplayText(orderType) {
      return translateService.getText('ORDER_TYPES_' + orderType.toUpperCase());
    }


    function _resolvePaymentsTimeLine(order) {

      let PaymentRecord = function (payment) {
        this.methodName = payment.methodName;
        this.creditCardBrand = payment.creditCardBrand;
        this.customerName = payment.customerDetails ? payment.customerDetails.name : '';
        this.last4 = payment.last4 !== 'xxxx' ? payment.last4 : ''
        this.amount = payment.amount;
        this.faceValue = payment.faceValue;
        this.quantity = payment.auxIntent ? payment.auxIntent.quantity : ''; //auxIntent.quantity
        this.creditAccountName = payment.accountName;


        if (isUS) {
          this.tipAmount = payment.change ? payment.change.amount : '';
          this.quantity = payment.auxIntent ? payment.auxIntent.quantity : '';
        }
        else {
          if ([Enums.PaymentTypes.CreditCardPayment, Enums.PaymentTypes.ChequePayment].indexOf(payment._type) > -1) {
            this.tipAmount = payment.cashback ? payment.cashback.amount : '';
          }
          else {
            this.tipAmount = payment.change ? payment.change.amount : ''; //auxIntent.quantity
          }
        }


        if (payment.source === Enums.Sources.TabitPay) {
          this.source = "(Tabit Pay)";
        }
      }

      let result = [];
      order.payments.forEach(payment => {
        result.push(new PaymentRecord(payment));
      });
      return result;
    }


    function _checkCahngeOfBD(_tlog, businessDateToDisplay) {

      if (_.get(_tlog, 'order[0]')) {
        if (moment(_.get(_tlog, 'order[0].businessDate')).valueOf() !== moment(businessDateToDisplay).valueOf()) {
          return true
        }

        return false;
      }

      return false


    }

    function _getTlogBD(_tlog) {
      if (_.get(_tlog, 'order[0]')) {
        return _tlog.businessDate;
      }
      else {
        return _tlog.businessDate
      }
    }

    ResultOrder = _resolveObject(_tlog);
    ResultOrder.tlogId = _resolveId(_tlog);
    ResultOrder.totalCashback = _resolveTotalCashback(ResultOrder.payments);
    ResultOrder.dinersNum = _resolveDinersNum(ResultOrder.diners);
    ResultOrder.totalAmount = _resolveTotalAmount(_tlog.totalAmount);
    ResultOrder.closed = _resolveClosedDate(ResultOrder.closed);
    ResultOrder.hasQuantitySale = _resolveHasQuantitySale(ResultOrder);
    ResultOrder.courier = _resolveCourier(ResultOrder);
    ResultOrder.businessDateToDisplay = _getTlogBD(_tlog);
    ResultOrder.changeOfBD = _checkCahngeOfBD(_tlog, ResultOrder.businessDateToDisplay);


    ResultOrder.deliveryNotes = _resolveDeliveryNotes(ResultOrder.deliveryNotes, ResultOrder.tlogId);
    ResultOrder.invoices = _resolveInvoices(ResultOrder.invoices, ResultOrder.tlogId);

    ResultOrder.waiter = userService.resolveUserName({ userId: ResultOrder.openedBy, users: Resources.Users });
    ResultOrder.owner = userService.resolveUser({ userId: ResultOrder.owner, users: Resources.Users });
    ResultOrder.openedBy = userService.resolveUser({ userId: ResultOrder.openedBy, users: Resources.Users });
    ResultOrder.lockedBy = userService.resolveUser({ userId: ResultOrder.lockedBy, users: Resources.Users });


    ResultOrder.clubMembers = _resolveClubMembers(ResultOrder);
    ResultOrder.orderTypeDisplayText = _resolveOrderTypeDisplayText(ResultOrder.orderType);

    let ItemsByOrderedOffersResult = _resolveItemsByOrderedOffers(ResultOrder);  // merge function #1
    ResultOrder.orderedOffers = ItemsByOrderedOffersResult.orderedOffers;
    ResultOrder.items = ItemsByOrderedOffersResult.items;

    // Resolve Payment Names && Payments.
    ResultOrder.paymentName = paymentsService.resolvePaymentNames(ResultOrder);
    ResultOrder.payments = paymentsService.resolvePaymentsAmount(ResultOrder);

    // Resolve Table.
    ResultOrder.table = tableService.resolveTable(ResultOrder, { tables: Resources.Tables });

    // Resolve Total Discount.
    let TotalDiscountResult = discountsService.resolveTotalDiscount(ResultOrder);
    ResultOrder.totalDiscount = TotalDiscountResult.totalDiscount;
    ResultOrder.totalDiscountName = TotalDiscountResult.totalDiscountName;

    // Resolve Promotions From Rewards.
    ResultOrder.promotions = promotionsService.resolvePromotions(ResultOrder, { promotions: Resources.Promotions });
    ResultOrder.promotionsCollection = promotionsService.resolvePromotionsCollection(ResultOrder.promotions, ResultOrder.orderedPromotions);

    // Resolve Discounts From Rewards.
    ResultOrder.discounts = discountsService.resolveDiscounts(ResultOrder);
    ResultOrder.discountsCollection = discountsService.resolveDiscountsCollection(ResultOrder.discounts);

    // Resolve Dishes.
    ResultOrder.dishes = dishesService.resolveDishes(ResultOrder);

    // Resolve Courses.
    ResultOrder.courses = coursesService.resolveCourses(ResultOrder, { users: Resources.Users });

    // Resolve Cencelled Items.
    ResultOrder.cencelledItems = itemsService.resolveCencelledItems(ResultOrder, { users: Resources.Users });

    // Resolve Unasigned Items.
    ResultOrder.unasignedItems = itemsService.resolveUnasignedItems(ResultOrder, { users: Resources.Users });



    // Resolve Time Line
    ResultOrder.timeline = timeLineService.resolveTimeLine(ResultOrder, { users: users });

    let PaymentsTimeLine = _resolvePaymentsTimeLine(ResultOrder);
    ResultOrder.PaymentsTimeLine = PaymentsTimeLine;

    return ResultOrder;

  }

  function _resolveBillCheck(printCheck) {

    let CheckBill = function (collections, variables, data, printByOrder, waiterDiners) {
      this.collections = collections;
      this.variables = variables;
      this.data = data;
      this.print_by_order = printByOrder;
      this.waiter_diners = waiterDiners;
    }

    let collections = printCheck.printData.collections;
    let variables = printCheck.printData.variables;

    if (collections.PAYMENT_LIST.length === 0) {
      return;
    }

    let data = {};

    let _details = billService.resolveItems(variables, collections);

    data.items = _details.items;
    data.oth = _details.oth;
    data.isReturnOrder = _details.isReturnOrder;
    data.isTaxExempt = _details.isTaxExempt;

    let _totals = billService.resolveTotals(variables, collections, true)
    data.totals = _totals;

    let _payments = billService.resolvePayments(variables, collections, true);
    data.payments = _payments;

    let _taxes = billService.resolveTaxes(variables, collections, true);
    data.taxes = _taxes;

    let printByOrder = billService.resolvePrintByOrder(variables);
    let waiterDiners = billService.resolveWaiterDiners(variables);

    let checkBill = new CheckBill(collections, variables, data, printByOrder, waiterDiners);
    return checkBill;
  }

  function _resolveBillData(printBill, isUS) {
    let DataBill = function (collections, variables, data, printByOrder, waiterDiners) {
      this.collections = collections;
      this.variables = variables;
      this.data = data;
      this.print_by_order = printByOrder;
      this.waiter_diners = waiterDiners;
    }

    let collections = printBill.printData.collections;
    let variables = printBill.printData.variables;

    let data = {};

    let _details = billService.resolveItems(variables, collections);

    data.items = _details.items;
    data.oth = _details.oth;
    data.isReturnOrder = _details.isReturnOrder;
    data.isTaxExempt = _details.isTaxExempt;

    let _totals = billService.resolveTotals(variables, collections, true)
    data.totals = _totals;

    let _payments = billService.resolvePayments(variables, collections, true);
    data.payments = _payments;

    let _taxes = billService.resolveTaxes(variables, collections, true);
    data.taxes = _taxes;

    data.isUS = isUS;

    let printByOrder = billService.resolvePrintByOrder(variables);
    let waiterDiners = billService.resolveWaiterDiners(variables);


    return new DataBill(collections, variables, data, printByOrder, waiterDiners);
  }

  OrderViewService.prototype.TimeLine = { enrichOrder: _enrichOrder };

  OrderViewService.prototype.Bill = {
    resolveBillCheck: _resolveBillCheck,
    resolveBillData: _resolveBillData
  };

  return OrderViewService;


}());




