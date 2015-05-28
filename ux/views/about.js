(function () {

  var About = UX.View.About = Backbone.View.extend({

    initialize: function (options) {
      this.session = options.session;

      this.session.on('change', this.render, this);
    },

    render: function () {
      this.$el.html(Tmpl.about());
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


