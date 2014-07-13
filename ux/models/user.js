(function () {

  var User = UX.Model.User = Backbone.Model.extend({

    idAttribute: '_id',

  });

  var Users = UX.List.Users = Backbone.Collection.extend({

    model: User,
    url: '/users',

  });

}).call(this);

