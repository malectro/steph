(function () {

  var Item = UX.Model.Item = Backbone.Model.extend({

    idAttribute: '_id'

  });

  var Items = UX.List.Items = Backbone.Collection.extend({

    model: Item,
    url: '/items'

  });

}).call(this);

