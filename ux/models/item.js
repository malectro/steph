(function () {

  var Item = UX.Model.Item = Backbone.Model.extend({

    idAttribute: '_id',

    author: function () {
      return UX.app.users.get(this.get('user'));
    },

    author_name: function () {
      var author = this.author();
      return (author) ? author.get('username') : 'unknown';
    }

  });

  var Items = UX.List.Items = Backbone.Collection.extend({

    model: Item,
    url: '/items'

  });

}).call(this);

