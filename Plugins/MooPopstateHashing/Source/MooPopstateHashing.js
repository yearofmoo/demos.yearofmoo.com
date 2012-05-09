(function($) {

  var isIE6or7 = (!window.retrieve('emulate-onhashchange-IE',false)) && Browser.Engine ? (Browser.Engine.trident4 || Browser.Engine.trident5) : (Browser.ie6 || Browser.ie7);
  var lastCalled = false;

  var hashbangKey = 'onhashchange-hashbang';
  var changeDelayKey = 'moopopstatehashing-calldelay';
  var popstateSkipFirstKey = 'onpopstate-skip-first';
  var hashchangePollInterval = 'onhashchange-poll-interval';

  var onChange = function(path,state,title) {
    if(!lastCalled) {
      lastCalled = true;
      (function() {
        lastCalled = false;
      }).delay(window.retrieve(changeDelayKey,50));
      window.fireEvent('addressChange',[path,state || {},title]);
    }
  };

  var getCurrentPath = function() {
    return (document.location.href.toString().match(/^.+?\/\/[^\/]+(\/.*)?$/) || [null,null])[1];
  };

  if(window.history && 'pushState' in window.history) {
    window.onpopstate = function(e) {
      if(!window.retrieve(popstateSkipFirstKey,true)) {
        var state = e ? e.state : window.history.state;
        onChange(getCurrentPath(),state);
      }
    }
    window.setAddress = function(url,state,title) {
      window.store(popstateSkipFirstKey,false);
      window.history.pushState(state || {},title,url);
      onChange(url,state,title);
    }
    window.replaceAddress = function(url,state,title) {
      window.store(popstateSkipFirstKey,false);
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
        path = (path.charAt(0)!='#' ? '#' : '') + path;
        var re = new RegExp('^#' + (window.retrieve(hashbangKey,true) ? '!' : '') + '(.+)');
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
      }).periodical(window.retrieve(hashchangePollInterval,100),window);
    }

    window.setAddress = function(url,state,title) {
      onChange(url,state,title);
      if(url.charAt(0)!='#') {
        url = '#' + url;
      }
      if(window.retrieve(hashbangKey,true) && url.charAt(1)!='!') {
        url = '#!' + url.substr(1);
      }
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
