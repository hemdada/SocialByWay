(function ($) {
  /**
   * @class ShareWidget
   * @namespace ShareWidget
   * @classdesc SocialByWay Share Widget to get the Share count based on the service and gives interaction to Share a page/UI
   * @property {Number} count - The aggregated Share count for all services.
   * @property {Object} options - The options for the widget.
   * @property {Object} serviceCount - An object containing the Share count of each service.
   * @augments JQuery.Widget
   * @alias ShareWidget
   * @constructor
   */
  $.widget("ui.ShareWidget", /** @lends ShareWidget.prototype */  {
    count: 0,
     /**
     * @desc Options for the widget.
     * @inner
     * @type {Object}
     * @property {String} url The url to share.
     * @property {String[]} services Name of the registered services.
     * @property {String} theme The theme for the widget.
     */
    options: {
      url: null,
      services: ['facebook', 'twitter', 'linkedin'],
      theme: 'default'
    },
    /**
     * @method
     * @private
     * @desc Constructor for the widget.
     */
    _create: function () {
      var self = this, serviceShareCountContainer;
      var theme = self.options.theme;
      var containerDiv = $("<div />", {
        'class': 'sbw-widget sbw-share-widget-' + theme
      });
      var serviceDiv = $("<div />", {
        'class': 'service-container'
      });
      var shareButton = $('<span />', {
        'class': 'share-button'
      });
      var shareCountContainer = $("<div />", {
        'class': 'count-container'
      });
      var minAngle = 360 / this.options.services.length;
      $.each(this.options.services, function (index, service) {
        var serviceContainer = self.createServiceElement(service, serviceDiv, (minAngle * index), self);
        SBW.Singletons.serviceFactory.getService(service).getShareCount(self.options.url, function (response) {
          if (response && response.count) {
            self.count += response.count;
            console.log('response is: ', response);
            console.log('Count for service', service, ' is: ', response.count);
            serviceShareCountContainer = $("<div />", {
              'class': 'service-count-container'
            }).text(response.count).appendTo(serviceContainer);
            shareCountContainer.text(self.count);
          }
        });
      });

      $(serviceDiv).append(shareButton, shareCountContainer);
      $(containerDiv).append(serviceDiv);
      $(self.element).append(containerDiv);
      self.hideServices();
      $(containerDiv).hover(self.showServices, self.hideServices);
    },
    /**
     * @method
     * @desc Function to create a service div and place it at the required position in the widget.
     * @param {String} service The social network for which the container is being created.
     * @param {Object} parentContainer The DOM element to which the service container must be added.
     * @param {Number} angle The angle at which the service container has to be placed.
     * @param {Object} context The context for the function call.
     * @return {Object} The DOM element for the service.
     */
    createServiceElement: function (service, parentContainer, angle, context) {
      var serviceContainer = $("<div></div>", {
        'class': service,
        'data-service': service,
        'click': function (event) {
          context.shareForService(event, context);
        },
        'style': '-webkit-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' +
          '-moz-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' +
          '-ms-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' +
          '-o-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' +
          'transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg)'
      }).appendTo(parentContainer);
      return serviceContainer;
    },
    /**
     * @method
     * @desc Function to show services on mouse hover.
     */
    showServices: function () {
      $('.service-container div').show();
      $('.service-container div.count-container').hide();
    },
    /**
     * @method
     * @desc Function to hide services when the widget loses focus.
     */
    hideServices: function () {
      $('.service-container div').hide();
      $('.service-container div.count-container').show();
    },
    /**
     * @method
     * @desc Event handler that allows the user to share the url specified in options.
     * @param {Object} event The Event object.
     * @param {Object} context The scope of the calling function.
     */
    shareForService: function (event, context) {
      var sourceElement = event.srcElement || event.target;
      var service = sourceElement.dataset.service;
      SBW.Singletons.serviceFactory.getService(service).checkUserLoggedIn(function (isLoggedIn) {
        if (isLoggedIn) {
          console.log("Url is: ", context.options.url);
          SBW.Singletons.serviceFactory.getService(service).publishMessage((context.options.url || document.url), function (response) {
            console.log('Post Uploaded Successfully', response);
          }, function (error) {
            console.log('error while posting: ', error);
          });
        } else {
          SBW.Singletons.serviceFactory.getService(service).startActionHandler(function () {
            console.log('User authenticated for service: ', service);
          });
        }
      });
    },
    /**
     * @method
     * @desc Function to destroy the widget.
     * @ignore
     */
    destroy: function () {
      $.Widget.prototype.destroy.call(this, arguments);
    }
  });
})(jQuery);
