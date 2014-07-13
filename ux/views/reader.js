(function () {

  var Reader = UX.View.Reader = Backbone.View.extend({

    events: {
    },

    initialize: function (options) {
      this.user = options.user;
      this.items = options.items;

      this.listenTo(this.items, 'reset', this.render);
      this.listenTo(this.items, 'sync', this.render);
    },

    render: function () {
      this.$el.html(Tmpl.reader({
        user: this.user,
        items: this.items
      }));

      return this;
    }

  });

}).call(this);

