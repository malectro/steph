(function () {

  var Item = UX.Model.Item = Backbone.Model.extend({

    idAttribute: '_id',

    url: function () {
      return '/' + this.get('medium') + '/' + this.id
    },

  });

  var Items = UX.List.Items = Backbone.Collection.extend({

    model: Item

  });

}).call(this);

