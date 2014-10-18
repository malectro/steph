(function () {

  var Item = UX.Model.Item = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function () {
      this.attributes.createdAt = this.attributes.createdAt || new Date() - 0;
    },

    url: function () {
      return this.get('medium') + '/' + this.id
    },

    thumbSrc: function () {
      return this.get('thumb') || this.get('src');
    },

    embedHtml: function () {
      var html;

      if (this.has('embedHtml')) {
        html = this.get('embedHtml');

      } else {
        var id = _.uniqueId('embed');
        html = '<span id="' + id + '" class="ux-embed-soundcloud"></span>';

        $.ajax({
          url: 'http://soundcloud.com/oembed',
          dataType: 'jsonp',
          data: {url: this.get('src'), format: 'js'},
          success: _.bind(function (data) {
            this.set('embed', data);
            this.set('embedHtml', data.html);
            this.set('thumb', data.thumbnail_url);
            $('#' + id).replaceWith(data.html);
          }, this)
        });
      }

      return html;
    }

  });

  var Items = UX.List.Items = Backbone.Collection.extend({

    model: Item,

    comparator: function (item) {
      return -item.get('createdAt');
    },

  });

}).call(this);

