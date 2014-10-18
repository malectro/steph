(function () {

  var Items = UX.View.Items = Backbone.View.extend({
    events: {
      'click .ux-items-new': '_click_new',
      'submit .ux-item-form': '_submit',
      'change .ux-item-form .input': '_change_input',
      'click .ux-item-delete': '_delete',
    },

    initialize: function (options) {
      this.session = options.session;
      this.items = options.items;

      this.items.on('add', this.render, this);
      this.items.on('remove', this.render, this);
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

  });

}).call(this);

