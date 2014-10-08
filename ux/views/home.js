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

    clickIntro: function (event) {
      this.$('.ux-intro-bg').addClass('hidden');
    },

    clickMenuItem: function (event) {
      var menuType = $(event.target).attr('ux-menu');
      console.log('click');
      this.$('.ux-menu-item[ux-menu=' + menuType + ']').click();
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

