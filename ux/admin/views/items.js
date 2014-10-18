(function () {

  var Items = UX.View.Items = Backbone.View.extend({

    initialize: function (options) {
      this.session = options.session;
      this.items = options.items;

      this.session.on('change', this.render, this);
    },

    render: function () {
      this.$el.html(Tmpl['admin/items']({
        items: this.items,
      }));
      return this;
    },

    show: function () {
      this.$el.removeClass('hidden');
    },

    hide: function () {
      this.$el.addClass('hidden');
    }

  });

}).call(this);

