(function () {

  var Reader = UX.View.Reader = Backbone.View.extend({

    events: {
      'click item': 'clickItem'
    },

    initialize: function (options) {
      this.user = options.user;
      this.items = options.items;

      this.listenTo(this.items, 'reset', this.render);
      this.listenTo(this.items, 'sync', this.render);
      this.listenTo(UX.session, 'change:itemId', this.changeItem);
    },

    render: function () {
      this.$el.html(Tmpl.reader({
        user: this.user,
        items: this.items
      }));

      return this;
    },

    clickItem: function (event) {
      var target = $(event.currentTarget);
      UX.app.router.navigate('item/' + target.data('id'), {trigger: true});
    },

    changeItem: function (session, id) {
      this.$('item.on').removeClass('on');
      this.$('item[data-id="' + id + '"]').addClass('on');
    }

  });

}).call(this);

