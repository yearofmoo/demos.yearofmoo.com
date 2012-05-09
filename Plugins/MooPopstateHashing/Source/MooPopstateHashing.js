(function($) {

  var isIE6or7 = (!window.retrieve('emulate-onhashchange-IE',false)) && Browser.Engine ? (Browser.Engine.trident4 || Browser.Engine.trident5) : (Browser.ie6 || Browser.ie7);
  var lastCalled = false;

  var onChange = function(path,state,title) {
    if(!lastCalled) {
      lastCalled = true;
      (function() {
        lastCalled = false;
      }).delay(window.retrieve('moopopstatehashing-calldelay',50));
      window.fireEvent('addressChange',[path,state || {},title]);
    }
  };

  var getCurrentPath = function() {
    return (document.location.href.toString().match(/^.+?\/\/[^\/]+(\/.*)?$/) || [null,null])[1];
  };

  if(window.history && 'pushState' in window.history) {
    window.onpopstate = function(e) {
      if(!window.retrieve('onpopstate-skip-first',true)) {
        var state = e ? e.state : window.history.state;
        onChange(getCurrentPath(),state);
      }
    }
    window.setAddress = function(url,state,title) {
      window.store('onpopstate-skip-first',false);
      window.history.pushState(state || {},title,url);
      onChange(url,state,title);
    }
    window.replaceAddress = function(url,state,title) {
      window.store('onpopstate-skip-first',false);
      window.history.replaceState(state || {},title,url);
      onChange(url,state,title);
    }
  }
  else if(!isIE6or7) {
    if(Browser.opera || Browser.Engine.presto) {
      history.navigationMode='compatible';
    }
    var onHashChange = function() {
      var path = window.location.hash;
      if(path=='' || path == null) {
        path = getCurrentPath();
      }
      else {
        path = (path[0]!='#' ? '#' : '') + path;
        var re = new RegExp('^#' + (window.retrieve('onhashchange-hashbang',true) ? '!' : '') + '(.+)');
        path = (path.match(re) || [null,null])[1];
      }
      if(path) {
        onChange(path);
      }
    }

    if('onhashchange' in window || 'onhashchange' in document) {
      ('onhashchange' in window ? window : document).onhashchange = onHashChange;
    }
    else {
      var cachedHash = window.location.hash;
      (function() {
        if(window.location.hash!=cachedHash) {
          cachedHash=window.location.hash;
          onHashChange();
        }
      }).periodical(window.retrieve('onhashchange-poll-interval',100),window);
    }

    window.setAddress = function(url,state,title) {
      if(url[0]!='#') {
        url = '#' + url;
      }
      if(window.retrieve('onhashchange-hashbang',true) && url[1]!='!') {
        url = '#!' + url.substr(1);
      }
      onChange(url,state,title);
      window.location.hash = url;
    }
  }
  else {
    window.setAddress = function(url,state,title) {
      window.location = url;
    }
  }
  if(!window.replaceAddress) {
    window.replaceAddress = window.setAddress.bind(window);
  }

})(document.id);
