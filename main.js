/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  // Center window on screen.
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var width = 500;
  var height = 400;

  chrome.app.window.create('index.html', {
    id: "helloWorldID",
    outerBounds: {
      width: width,
      height: height,
      left: Math.round((screenWidth-width)/2),
      top: Math.round((screenHeight-height)/2),
      minHeight: height,
      minWidth: width
    }
  });
});

var parserGezitter = require('modules/parsers/gezitter.org');

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message === 'Parse.Start') {
    console.log('Sender!', sender);
    console.log('We have a order!', sendResponse);

    parserGezitter.parse(function(response) {
      console.log('BG RESPONSE: ', response);
      sendResponse(response);
    });
  }
  return true;
});