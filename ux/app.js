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
      this.users = new UX.List.Users(options.users);
      this.items = new UX.List.Items(options.items);

      if (this.user.id) {
        this.composer = new UX.View.Composer({
          user: this.user,
          items: this.items
        });
      }

      this.reader = new UX.View.Reader({
        user: this.user,
        items: this.items
      });

      this.router = new UX.Router();

      var items = {};
      _.each($('.ux-menu-item'), function (item) {
        items[$(item).attr('ux-menu')] = $(item);
      });

      $('polygon').on('click', function () {
        var menuType = $(this).attr('ux-menu');
        console.log('click');
        $('.ux-menu-item[ux-menu=' + menuType + ']').click();
      }).on('mouseover', function () {
        var menuType = $(this).attr('ux-menu');
        items[menuType].addClass('hover');
      }).on('mouseout', function () {
        var menuType = $(this).attr('ux-menu');
        items[menuType].removeClass('hover');
      });

      console.log('initialized main view');
    },

    render: function () {
      if (this.composer) {
        this.composer.setElement(this.$('.ux-composer')).render().show();
      }
      this.reader.setElement(this.$('.ux-reader')).render();

      this.$el.removeClass('loading');
    }

  });

  UX.Router = Backbone.Router.extend({
    routes: {
      'item/:id': 'showItem'
    },

    showItem: function (id) {
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
    'ux/views/composer',
    'ux/views/reader'
  ], false, UX.init);

}).call(this);

