(function () {

  var root = this;

  var UX;
  if (typeof exports !== 'undefined') {
    UX = global.UX = exports;
  } else {
    UX = root.UX = {};
  }

  var Backbone = root.Backbone;
  if (!Backbone && (typeof require !== 'undefined')) {
    Backbone = global.Backbone = require('backbone');
  }

  UX.View = {};
  UX.Model = {};
  UX.List = {};


  UX.View.App = Backbone.View.extend({

    initialize: function (options) {
      this.user = new UX.Model.User(options.user);
      this.items = new UX.List.Items;

      if (this.user.id) {
        this.composer = new UX.View.Composer({
          user: this.user,
          items: this.items
        }).render().show();

        this.reader = new UX.View.Reader({
          user: this.user,
          items: this.items
        }).render().show();

        this.items.fetch();
      }

      console.log('initialized main view');
    }

  });

  UX.init = function () {
    UX.app = new UX.View.App(UX.env);
  };

  require([
    'ux/models/user',
    'ux/models/item',
    'ux/views/composer',
    'ux/views/reader'
  ], false, UX.init);

}).call(this);

