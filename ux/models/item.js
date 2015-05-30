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

    mediumText: function () {
      return {
        video: 'watch',
        radio: 'listen',
        photo: 'see',
      }[this.get('medium')];
    },

    linkUrl: function () {
      return this.mediumText() + '/' + this.id
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

        var youtube = /youtube\.com\/watch\?v=(\w+)/.exec(this.get('src'));
        if (youtube) {
          var data = {
            html:
                '<iframe width="480" height="270" src="//www.youtube.com/embed/' +
                youtube[1] +
                '?feature=oembed" frameborder="0" allowfullscreen></iframe>',
            height: 270,
            type: 'video',
            thumbnail_width: 480,
            provider_url: 'http://www.youtube.com',
            thumbnail_height: 360,
            version: '1.0',
            width: 480,
            provider_name: 'YouTube',
            thumbnail_url: '//i.ytimg.com/vi/' + youtube[1] + '/hqdefault.jpg'
          };

          this.set('embed', data);
          this.set('embedHtml', data.html);
          this.set('thumb', data.thumbnail_url);
          $('#' + id).replaceWith(data.html);

        } else {
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

