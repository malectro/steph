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
    {_id: 1, src: '/img/hubble.jpg', medium: 'photo', createdAt: 0},
    {_id: 2, src: '/img/hubble2.jpg', medium: 'photo', createdAt: 0},
    {_id: 3, src: '/img/hubble3.jpg', medium: 'photo', createdAt: 0},
    {_id: 4, src: 'https://soundcloud.com/malectro/surf-air', medium: 'radio', title: 'Surf Air', writeup: 'This is a writeup.', createdAt: 0},
  ];


  UX.View.App = Backbone.View.extend({

    events: {
      'click a[href]': 'route',
    },

    initialize: function (options) {
      // collections
      this.user = new UX.Model.User(options.user);
      this.users = new UX.List.Users(options.users);
      this.items = new UX.List.Items(options.items);

      // TODO: remove
      //this.items = new UX.List.Items(fakeItems);

      // views
      this.itemsView = new UX.View.Items({
        session: UX.session,
        items: this.items,
      });

      // router
      this.router = new UX.Router();

      // aws
      AWS.config.credentials = new AWS.Credentials(options.AWS_KEY, options.AWS_SECRET);
      AWS.config.region = 'us-east-1';
      this.bucket = new AWS.S3({params: {Bucket: 'stephaniefoo'}});

      //UX.session.on('change:medium', this.changeMedium, this);

      console.log('initialized main view');
    },

    render: function () {
      // already rendered by server
      this.itemsView.setElement(this.$('.ux-items')).render();
      this.$el.removeClass('loading');
    },

    route: function (event) {
      var url = $(event.currentTarget).attr('href');
      if (url.charAt(0) === '/') {
        event.preventDefault();
        this.router.navigate(url.slice(1), {trigger: true});
      }
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

    showItem: function (medium, itemId) {
      UX.session.set({
        medium: medium,
        itemId: itemId,
      });
    }
  });

  UX.init = function () {
    UX.session = new Backbone.Model();
    UX.app = new UX.View.App(UX.env);
    UX.app.render();
    Backbone.history.start({pushState: true});
  };

  require([
    '/ux/models/user',
    '/ux/models/item',
    '/ux/admin/views/items',
  ], false, UX.init);

}).call(this);


