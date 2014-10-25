(function () {

  var Items = UX.View.Items = Backbone.View.extend({
    events: {
      'click .ux-items-new': '_click_new',
      'submit .ux-item-form': '_submit',
      'change .ux-item-form .input': '_change_input',
      'change .input[name="src"]': '_change_src',
      'change input[name="file"]': '_change_file',
      'click .ux-item-delete': '_delete',
      'click .ux-filters a': '_filter',
    },

    initialize: function (options) {
      this.session = options.session;
      this.items = options.items;

      this.session.set('filter', 'all');

      this.items.on('add', this.render, this);
      this.items.on('remove', this.render, this);
      this.session.on('change', this.render, this);
    },

    render: function () {
      var items;
      var filter = this.session.get('filter');

      if (filter !== 'all') {
        items = this.items.where({medium: filter});
      } else {
        items = this.items.slice();
      }

      this.$el.html(Tmpl['admin/items']({
        items: items,
        session: this.session,
      }));

      return this;
    },

    show: function () {
      this.$el.removeClass('hidden');
    },

    hide: function () {
      this.$el.addClass('hidden');
    },

    _click_new: function () {
      this.items.add(new UX.Model.Item({
        user_id: UX.app.user.id
      }));
    },

    _change_input: function (event) {
      var $input = $(event.target);
      var attr = event.target.name;
      var cid = $(event.target.form).data('cid');
      var item = this.items.get(cid);
      item.set(attr, $input.val());
      console.log('changed', attr, item.get(attr));
    },

    _change_src: function (event) {
      var $input = $(event.target);
      var attr = event.target.name;
      var cid = $(event.target.form).data('cid');
      var item = this.items.get(cid);
      console.log('embed');

      if (_.contains(['radio', 'video'], item.get('medium'))) {
        item.embedHtml();
      }
    },

    _change_file: function (event) {
      var $input = $(event.target);
      var attr = event.target.name;
      var cid = $(event.target.form).data('cid');
      var item = this.items.get(cid);
      var file = $input[0].files[0];

      if (file) {
        var reader = new FileReader();

        reader.addEventListener('load', function () {

          var path = 'img/' + item.get('medium') + '/' + (new jsSHA(reader.result, 'TEXT')).getHash('SHA-1', 'HEX') + '.' + file.name.split('.').pop();

          UX.app.bucket.putObject({
            Key: path,
            ContentType: file.type,
            Body: file,
            ACL: 'public-read',
          }, function (error, data) {
            item.set('src', '//stephaniefoo.s3.amazonaws.com/' + path);
          });
        });

        reader.readAsText(file);
      }
    },

    _submit: function (event) {
      event.preventDefault();
      var $form = $(event.target);
      var cid = $form.data('cid');
      var item = this.items.get(cid);

      $form.find('button').prop('disabled', true);

      console.log('saving', item.toJSON());

      item.save({}, {
        success: function () {
          $form.find('button').prop('disabled', false);
        }
      });
    },

    _delete: function (event) {
      event.preventDefault();
      var $form = $(event.target).parent();
      var cid = $form.data('cid');
      var item = this.items.get(cid);
      item.destroy();
    },

    _filter: function (event) {
      var filter = $(event.target).data('filter');
      this.session.set('filter', filter);
    },

  });

}).call(this);

