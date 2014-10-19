(function () {

  var Item = UX.Model.Item = Backbone.Model.extend({

    idAttribute: '_id',
    urlRoot: '/items',

    defaults: {
      medium: 'photo',
    },

    initialize: function (attributes) {
      this.attributes.createdAt = this.attributes.createdAt || new Date() - 0;
      if (this.attributes.embed) {
        this.attributes.embedHtml = this.attributes.embed.html;
        this.attributes.thumb = this.attributes.embed.thumbnail_url;
      }
    },

    linkUrl: function () {
      return this.get('medium') + '/' + this.id
    },

    thumbSrc: function () {
      return this.get('thumb') || this.get('src');
    },

    embedUrl: function () {
      var medium = this.get('medium');
      var urls = {
        radio: 'http://soundcloud.com/oembed',
        video: 'http://vimeo.com/api/oembed.json',
      };
      return urls[medium];
    },

    embedHtml: function () {
      var html;

      if (this.has('embedHtml')) {
        html = this.get('embedHtml');

      } else {
        var id = _.uniqueId('embed');
        html = '<span id="' + id + '" class="ux-oembed"></span>';

        $.ajax({
          url: this.embedUrl(),
          dataType: 'jsonp',
          data: {
            url: this.get('src'),
            format: 'js'
          },
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
    url: '/items',

    comparator: function (item) {
      return new Date(item.get('createdAt')) * -1;
    },

  });

}).call(this);

