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
      // collections
      this.user = new UX.Model.User(options.user);
      this.users = new UX.List.Users(options.users);
      this.items = new UX.List.Items(options.items);

      // views
      this.home = new UX.View.Home({
        media: options.media
      });

      // router
      this.router = new UX.Router();

      console.log('initialized main view');
    },

    render: function () {
      // already rendered by server
      this.home.setElement(this.$('.ux-home'));
      this.$el.removeClass('loading');
    }

  });

  UX.Router = Backbone.Router.extend({
    routes: {
      '': 'home',
      ':medium': 'showMediums',
      ':medium/:id': 'showItem',
    },

    home: function () {

    },

    showMedium: function (medium) {
      UX.session.set({
        medium: medium,
        itemId: null,
      });
    },

    showItem: function (medium, id) {
      UX.session.set('itemId', id);
    }
  });

  UX.init = function () {
    UX.session = new Backbone.Model();
    UX.app = new UX.View.App(UX.env);
    UX.app.render();
    Backbone.history.start({});
  };

  require([
    'ux/models/user',
    'ux/models/item',
    'ux/views/home',
  ], false, UX.init);

}).call(this);

