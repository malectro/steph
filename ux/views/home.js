(function () {

  var Home = UX.View.Home = Backbone.View.extend({
    events: {
      'click .ux-intro-name': 'clickIntro',
      'click polygon': 'clickMenuItem',
      'mouseenter polygon': 'mouseenterPolygon',
      'mouseleave polygon': 'mouseleavePolygon',
    },

    initialize: function (options) {

    },

    render: function () {
      return this;
    },

    show: function () {
      this.$el.removeClass('hidden');
    },

    hide: function () {
      this.$el.addClass('hidden');
    },

    clickIntro: function (event) {
      this.$('.ux-intro-bg').addClass('hidden');
    },

    clickMenuItem: function (event) {
      var menuType = $(event.target).attr('ux-menu');
      UX.app.router.navigate(menuType, {trigger: true});
    },

    mouseenterPolygon: function (event) {
      var menuType = $(event.target).attr('ux-menu');
      this.$('.ux-menu-item[ux-menu=' + menuType + ']').addClass('hover');
    },

    mouseleavePolygon: function (event) {
      var menuType = $(event.target).attr('ux-menu');
      this.$('.ux-menu-item[ux-menu=' + menuType + ']').removeClass('hover');
    },
  });

}).call(this);

