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

  var fakeItems = [
    {src: '/img/hubble.jpg'},
    {src: '/img/hubble.jpg'},
    {src: '/img/hubble.jpg'},
  ];


  UX.View.App = Backbone.View.extend({

    initialize: function (options) {
      // collections
      this.user = new UX.Model.User(options.user);
      this.users = new UX.List.Users(options.users);
      this.items = new UX.List.Items(options.items);

      // TODO: remove
      this.items = new UX.List.Items(fakeItems);

      // views
      this.home = new UX.View.Home({
        media: options.media,
        session: UX.session,
      });
      this.itemsView = new UX.View.Items({
        session: UX.session,
        items: this.items,
      });

      // router
      this.router = new UX.Router();

      UX.session.on('change:medium', this.changeMedium, this)
        .on('change:itemId', this.changeItem, this);

      console.log('initialized main view');
    },

    render: function () {
      // already rendered by server
      this.home.setElement(this.$('.ux-home'));
      this.itemsView.setElement(this.$('.ux-items'));
      this.$el.removeClass('loading');
    },

    changeMedium: function (session, medium) {
      if (!medium) {
        this.home.show();
        this.itemsView.hide();
      } else {
        this.itemsView.show();
        this.home.hide();
      }
    },

  });

  UX.Router = Backbone.Router.extend({
    routes: {
      '': 'home',
      ':medium': 'showMedium',
      ':medium/:id': 'showItem',
    },

    home: function () {
      UX.session.set({
        medium: null,
        itemId: null,
      });
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
    'ux/views/items',
  ], false, UX.init);

}).call(this);

