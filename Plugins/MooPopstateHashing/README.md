# MooPopstateHashing

MooPopstateHashing is a simple wrapper that combines the HTML5 popstate, onhashchange and regular URL-changing techniques all into one.

Depending on which browser is using the tool, the appropriate technique will be used.

A data parameter is provided which can be used to set custom data to be transfered between pages.

## Browser Support

- Chrome, Safari, Opera, IE10+ and Firefox 4+ will use the HTML popstate technique. Only these browsers can see the data hash on back and forth operations.
- IE6 and IE7 and all other browsers that do not support the onhashchange event will use regular page redirects with window.location="..."
- IE8, IE9 and all other browsers will use the hashbang technique.

## Requirements

- MooTools Core 1.3+ (1.2+ works as well)

## Usage

All the functionality is mapped to two functions:

```javascript
window.addEvent('addressChange',function(url,data,title) {
  alert(url); //new URL
});

// url = (string) the PATH of the new page you want the address to change to
// state = (hash) any data you wish to pass into the new URL (this data is only available for a HTML history browser), but if will be accessible the first time even for a hashchange operation since there is on back/forward operation being executed.
// title = (string) the title of the page this will get set to (this will also not work for back and forth operations on a onhashchange browser)
window.setAddress(url,data,title); //set it to the new url
```

## Hashbang support

The hashbang support for onhashchange paths can be turned on and off by changing this value:

```javascript
window.store('onhashchange-hashbang',true); //or false
```

## Other Options

Here are various other properties that can be set:

```javascript
//whether or not to skip the first event call of HTML history (this is called when the page first loads)
window.store('onpopstate-skip-first',true); //defaults to true

//the total amount of milliseconds of delay between when a browser will check for a new hashchange url (this is for really old browsers)
window.store('onhashchange-poll-interval',200); //defaults to 200

//this will allow older browsers like IE6 and IE7 to use a polling onhashchange event (note that there are other issues with this)
window.store('emulate-onhashchange-IE',true); //defaults to false

//the minimum amount of time between allowed setAddress calls
window.store('moopopstatehashing-calldelay',50); //defaults to 50 milliseconds
```
