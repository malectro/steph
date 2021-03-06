(function () {

  var mediaToText = {
    photo: 'see',
    video: 'watch',
    radio: 'listen',
  };

  var Items = UX.View.Items = Backbone.View.extend({

    initialize: function (options) {
      this.session = options.session;
      this.items = options.items;

      this.session.on('change', this.render, this);
      this.items.on('change:embed', this.render, this);
    },

    render: function () {
      var mainItem,
          medium = this.session.get('medium'),
          itemId = this.session.get('itemId'),
          items = this.items.where({medium: medium});

      if (itemId) {
        mainItem = this.items.get(itemId);
      } else {
        mainItem = items[0];
      }

      this.$el.html(Tmpl.items({
        medium: medium,
        mainItem: mainItem,
        items: items,
        mediumText: mediaToText[medium],
      }));

      if (medium === 'video') {
        var $iframe = this.$('iframe');
        var width = this.$('.ux-item-current').width();
        $iframe.css({
          width: width,
          height: Math.round($iframe.prop('height') * width / $iframe.prop('width'))
        });
      }
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

