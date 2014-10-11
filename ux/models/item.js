(function () {

  var Item = UX.Model.Item = Backbone.Model.extend({

    idAttribute: '_id',

    url: function () {
      return this.get('medium') + '/' + this.id
    },

    embedHtml: function () {
      var html;

      if (this.has('embed')) {
        html = this.get('embed');

      } else {
        var id = _.uniqueId('embed');
        html = '<span id="' + id + '" class="ux-embed-soundcloud"></span>';

        $.ajax({
          url: 'http://soundcloud.com/oembed',
          dataType: 'jsonp',
          data: {url: this.get('src'), format: 'js'},
          success: _.bind(function (data) {
            this.set('embed', data.html);
            $('#' + id).replaceWith(data.html);
          }, this)
        });
      }

      return html;
    }

  });

  var Items = UX.List.Items = Backbone.Collection.extend({

    model: Item

  });

}).call(this);

