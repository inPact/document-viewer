window.DocumentViewer.Utils = (function () {

  function Utils() {

  }

  function _toFixedSafe(value, num) {
    if (value !== undefined && value !== null) {
      return value.toFixed(num);
    }
    return "--";
  }

  function _currencyFraction(val, showZero) {
    if (showZero && (!val || isNaN(val))) val = 0;
    if (!isNaN(val)) {
      var num = val / 100;
      var fixnum = _toFixedSafe(num, 2);
      return parseFloat(fixnum);
    }
  }

  function _groupBy(collection, key) {
    return collection.reduce(function (rv, item) {
      (rv[item[key]] = rv[item[key]] || []).push(item);
      return rv;
    }, {});
  };

  function _uniqBy(collection, key) {

    let result = [];

    collection.forEach(item => {

      if (key && item[key] !== undefined) {
        let found = result.find(c => c[key] === item[key]);
        if (found === undefined) {
          item.qty = 1;
          result.push(item);
        }
        else {
          found.qty++;
        }
      }

    });

    return result;
  }

  Utils.prototype.toFixedSafe = _toFixedSafe;
  Utils.prototype.currencyFraction = _currencyFraction;
  Utils.prototype.groupBy = _groupBy;
  Utils.prototype.uniqBy = _uniqBy;

  return Utils;

}());
