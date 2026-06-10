'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function searchboxDrawerWrapper(nav, istats) {
  var scopeWhiteList = ['', null, 'all', 'all:learning', 'iplayer:tv', 'iplayer_cbbc', 'iplayer_cbeebies', 'iplayer:radio'];

  var suppressedPaths = ['/education', '/iwonder', '/iwondercommunity', '/guides', '/timelines', '/arts', '/earth', '/history', '/science', '/religion', '/makeitdigital', '/dishup', '/ulsterscots', '/aboutthebbc', '/annualreport', '/bbcfilms', '/bbctrust', '/branding', '/broadcastinghouse', '/careers', '/charityappeals', '/pudsey', '/climateasia', '/commissioning', '/copyright', '/developer', '/diversity', '/fmguidelines', '/foi', '/helpandfeedback', '/historyofthebbc', '/informationandarchives', '/mediaaction', '/mediacentre', '/mypension', '/partnersandsuppliers', '/performingartsfund', '/privacy', '/production', '/reception', '/responsibility', '/safety', '/social', '/supplying', '/terms', '/writerslicence', '/writersroom', '/newsbeat'];

  // Setting focus on the pre-rendered input means that the
  // react component doesn't appear to bind until the focus is lost, at
  // which point the events are bound. To fix this we need to blur the input
  // once the app has loaded and re-focus. This will allow React to bind to the input.
  function focusInput(drawerInput) {
    drawerInput.blur();
    drawerInput.focus();
  }

  var searchboxDrawer = {
    app: null,
    conf: null,
    searchScope: null,
    loadedSearchbox: false,
    loadingSearchbox: false,
    intervalId: 0,
    resizeId: 0,
    resizeThrottleMs: 200,
    DRAWER_NAME: 'drawer-search',
    run: function _run(conf) {
      var _this = this;

      this.conf = conf;
      var path = window.location.pathname;
      this.searchScope = conf.searchScope;
      if (!this.hideOnVariant(conf.variant, this.searchScope) && this.isInWhiteList(this.searchScope, this.scopeWhiteList) && !this.isSuppressedPath(path)) {
        this.loadSearchboxCss(conf, function () {
          _this.cssLoaded(conf);
        });
        this.setEventListeners();
        this.applyScopeClasses(this.searchScope);
        this.applyTouchClasses();
      }
    }
  };

  searchboxDrawer.applyTouchClasses = function _applyTouchClasses() {
    if (this.touchEnabled()) {
      document.documentElement.className += ' se-touch';
    } else {
      document.documentElement.className += ' se-no-touch';
    }
  };

  searchboxDrawer.applyScopeClasses = function _applyScopeClasses(scope) {
    var classes = '';
    var rexp = new RegExp('(iplayer):?(radio)?', 'ig');
    var output = rexp.exec(scope);
    if (output) {
      if (output[2]) {
        classes = ' se-iplayer-radio-theme';
      } else if (output[1]) {
        classes = ' se-iplayer-theme';
      }

      document.documentElement.className += classes;
    }
  };

  searchboxDrawer.touchEnabled = function _touchEnabled() {
    if ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch || window.hasOwnProperty && (window.hasOwnProperty('ontouchstart') || window.DocumentTouch && document instanceof window.DocumentTouch || navigator.msMaxTouchPoints)) {
      return true;
    }
    // Fallback for certain samsung devices that fail above but pass below... :/
    if ('ontouchstart' in window) {
      return true;
    }
    return false;
  };

  searchboxDrawer.scopeWhiteList = scopeWhiteList;

  searchboxDrawer.isInWhiteList = function _isInWhiteList(searchScope, whiteList) {
    var flag = false;
    if (typeof whiteList.indexOf === 'function') {
      flag = whiteList.indexOf(searchScope) !== -1;
    } else {
      // ie8 fix, indexOf don't exists in ie8
      for (var i = 0; i < whiteList.length; i++) {
        if (whiteList[i] === searchScope) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  };

  searchboxDrawer.isSuppressedPath = function _issuppressedpath(path) {
    for (var i = 0; i < suppressedPaths.length; i++) {
      var pattern = '^' + suppressedPaths[i];
      var exp = new RegExp(pattern, 'i');
      if (exp.test(path)) {
        return true;
      }
    }
    return false;
  };

  searchboxDrawer.hideOnVariant = function _hideonvariant(variant, scope) {
    if (['cbeebies', 'cbbc'].join(' ').indexOf(variant) > -1) {
      var allow = ['iplayer_cbbc', 'iplayer_cbeebies'];
      return !this.isInWhiteList(scope, allow);
    }

    return false;
  };

  searchboxDrawer.viewAllResults = function _viewAllResults() {
    function createHiddenInput(name, value) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      return input;
    }

    var form = document.getElementById('searchboxDrawerForm');
    if (form) {
      form.appendChild(createHiddenInput('search_suggestion_type', 'serp'));
      form.appendChild(createHiddenInput('action_name', 'search'));
      form.appendChild(createHiddenInput('action_type', 'view-all-results'));
      form.submit();
    }
  };

  searchboxDrawer.isOrbSearchVisible = function _isNavInputVisible() {
    var formElm = document.getElementById('orb-search-form');
    var style = formElm.currentStyle ? formElm.currentStyle.display : getComputedStyle(formElm, null).display;
    return style !== 'none';
  };

  searchboxDrawer.loadSearchboxCss = function _loadSearchboxCss(conf, cb) {
    if (window.searchboxIEVersion && window.searchboxIEVersion === 8) {
      nav.loadCss(conf.searchboxAppStaticPrefix + '/style/fixed.css', cb);
    } else {
      nav.loadCss(conf.searchboxAppStaticPrefix + '/style/enhanced.css', cb);
    }
  };

  searchboxDrawer.cssLoaded = function _cssLoaded(conf) {
    nav.addDrawer(this.DRAWER_NAME, document.createElement('div'), this.createContent(conf));
  };

  searchboxDrawer.loadSearchboxDrawer = function _loadSearchbox(moduleLoaded) {
    this.loadingSearchbox = true;
    require.config({
      paths: {
        'bbc-search/searchbox-app': this.conf.searchboxAppStaticPrefix + '/app.min'
      }
    });

    require(['bbc-search/searchbox-app'], moduleLoaded);
  };

  searchboxDrawer.createContent = function _createContent(conf) {
    var content = document.createElement('div');
    content.setAttribute('class', 'orb-panel se-searchbox-app');
    content.setAttribute('id', 'se-searchbox-app');
    content.innerHTML = conf.searchFormHtml;
    return content;
  };

  searchboxDrawer.watchInput = function _watchInput(input) {
    var oldval = input.value;
    var ref = this;
    function watch() {
      if (input.value !== oldval) {
        oldval = input.value;
        clearInterval(ref.intervalId);
        ref.handleInput(input);
      }
    }
    this.intervalId = setInterval(watch, 100);
  };

  searchboxDrawer.orbSearchClick = function _orbSearchClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.handleInput(document.getElementById('orb-search-q'));
  };

  searchboxDrawer.handleWindowResize = function _handleWindowResize(fn) {
    var node = document.querySelector('.orb-nav-search');
    if (!this.isOrbSearchVisible()) {
      node.addEventListener('click', fn, true);
    } else {
      node.removeEventListener('click', fn, true);
    }
  };

  searchboxDrawer.setEventListeners = function _setInputControl() {
    var _this2 = this;

    var inputElm = document.getElementById('orb-search-q');
    var drawerPanel = document.getElementById('orb-panels');
    var onDrawerPanelScroll = function onDrawerPanelScroll() {
      drawerPanel.scrollTop = 0;
    };

    if (document.addEventListener) {
      (function () {
        inputElm.addEventListener('focus', function () {
          _this2.watchInput(inputElm);
        });
        inputElm.addEventListener('blur', function () {
          clearInterval(_this2.intervalId);
        });

        var orbButtonHandler = _this2.orbSearchClick.bind(_this2);

        window.addEventListener('resize', function () {
          clearTimeout(_this2.resizeId);
          _this2.resizeId = setTimeout(function () {
            _this2.handleWindowResize(orbButtonHandler);
          }, _this2.resizeThrottleMs);
        });
        _this2.handleWindowResize(orbButtonHandler);

        drawerPanel.addEventListener('scroll', onDrawerPanelScroll);
      })();
    } else {
      inputElm.attachEvent('onfocus', function (e) {
        e.srcElement.value = '';
        _this2.watchInput(inputElm);
      });
      inputElm.attachEvent('onblur', function () {
        clearInterval(_this2.intervalId);
      });
    }
  };

  searchboxDrawer.handleInput = function _handleInput(target) {
    var _this3 = this;

    var selectorString = 'se-searchbox-input-field';
    var input = target;
    var drawerInput = document.getElementById(selectorString);
    var drawerState = nav.getDrawerState(this.DRAWER_NAME);

    if (drawerState === 'hidden') {
      // Set navMode to mouse to animate drawer opening.
      // If IE8/9 we don't want animation due to race conditions.
      if (!window.searchboxIEVersion) document.getElementById('orb-header').navMode = 'mouse';
      this.addDrawerStyles();
      nav.getMastheadDrawer().showPanel(this.DRAWER_NAME);
    }

    // we (possibly) don't have the app yet - so access the input field directly.
    drawerInput.focus();
    drawerInput.value = input.value;
    input.value = '';

    if (!this.loadingSearchbox && !this.loadedSearchbox) {
      this.loadSearchboxDrawer(function (SearchboxApp) {
        var updateHandler = nav.updateDrawerHeight.bind(_this3, _this3.DRAWER_NAME);
        var closeHandler = _this3.closeSearchboxDrawer.bind(_this3);
        var viewResults = _this3.viewAllResults.bind(_this3);
        var configs = {
          istats: istats,
          changeHandler: updateHandler,
          closeHandler: closeHandler,
          viewResults: viewResults,
          searchScope: _this3.searchScope,
          isSearchPage: window.SEARCHBOX.searchPage || false
        };
        _this3.app = new SearchboxApp(configs);
        focusInput(drawerInput);
      });
    } else {
      this.app.setQuery(drawerInput.value);
      focusInput(drawerInput);
    }
  };

  searchboxDrawer.closeSearchboxDrawer = function _closeSearchboxDrawer() {
    var inputElm = document.getElementById('orb-search-q');
    nav.getMastheadDrawer().hidePanel();
    this.removeDrawerStyles();
    inputElm.focus();
  };

  searchboxDrawer.addDrawerStyles = function _addDrawerStyles() {
    var drawerPanel = document.getElementById('orb-panels');
    this.cssUtils.addClass(drawerPanel, 'se-panel-active');
  };

  searchboxDrawer.removeDrawerStyles = function _removeDrawerStyles() {
    var drawerPanel = document.getElementById('orb-panels');
    this.cssUtils.removeClass(drawerPanel, 'se-panel-active');
  };

  searchboxDrawer.cssUtils = {
    addClass: function _addClass(element, className) {
      if (!this.hasClass(element, className)) {
        element.className += ' ' + className;
      }
    },

    removeClass: function _removeClass(element, className) {
      if (this.hasClass(element, className)) {
        element.className = element.className.replace(this.classRegex(className), '');
      }
    },

    hasClass: function _hasClass(element, className) {
      return !!element.className.match(this.classRegex(className));
    },

    classRegex: function _classRegex(className) {
      return new RegExp('(\\s|^)' + className + '(\\s|$)');
    }
  };

  return searchboxDrawer;
}

// RequireJS
if (typeof define === 'function' && define.amd) {
  define(['orb/nav', 'istats-1'], searchboxDrawerWrapper);
}

// CommonJS
if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
  module.exports = searchboxDrawerWrapper;
}
//# sourceMappingURL=searchboxDrawer.js.map
