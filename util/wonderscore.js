/**
 * Aphorist Utils file.
 * This could be merged with Underscore at some point.
 */

(function () {
  // Default setup taken from Backbone
  var root = this;
  var Underscore = root._;

  var _;
  if (typeof exports !== 'undefined') {
    _ = exports;
  } else {
    _ = root._ = {};
  }

  if (!Underscore && (typeof require !== 'undefined')) {
    Underscore = require('underscore');
  }

  Underscore.extend(_, Underscore);


  /**
   * defaultList
   * useful for allowing parameters to either be lists or single objects.
   * wraps and returns the param in a list if it is not a list itself.
   */
  _.defaultList = function (param) {
    param = param || [];
    return (_.isArray(param)) ? param : [param];
  };


  /**
   * keyBy
   * similar to groupBy, but assumes that the iterator return value is unique.
   * ex. var modelMap = _.keyBy(models, 'id');
   */
  _.keyBy = function (collection, iterator) {
    var ob = {},
        eachFunc;

    if (_.isString(iterator)) {
      eachFunc = function (item) {
        ob[item[iterator]] = item;
      };
    } else {
      eachFunc = function (item) {
        ob[iterator(item)] = item;
      };
    }

    _.each(collection, eachFunc);

    return ob;
  };


  /**
   * capitalize
   * adds extremely naive English capitalization to a string.
   * ex. var properPronoun = _.capitalize('english');
   */
  _.capitalize = function (string) {
    return string[0].toUpperCase() + string.substr(1);
  };


  /**
   * snakeCase
   * returns a snake case version of a string
   * ex. var snakeString = _.snakeCase('MyClass');
   *     snakeString === 'my_class';
   */
  _.snakeCase = function (string) {
    return string.replace(/[A-Z]/g, function (letter) {
      return '_' + letter.toLowerCase();
    }).substr(1);
  };

}).call(this);

