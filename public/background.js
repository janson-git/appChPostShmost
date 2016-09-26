/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/public/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Listens for the app launching then creates the window
	 *
	 * @see http://developer.chrome.com/apps/app.runtime.html
	 * @see http://developer.chrome.com/apps/app.window.html
	 */
	chrome.app.runtime.onLaunched.addListener(function () {
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
	      left: Math.round((screenWidth - width) / 2),
	      top: Math.round((screenHeight - height) / 2),
	      minHeight: height,
	      minWidth: width
	    }
	  });
	});
	
	var parserGezitter = __webpack_require__(1);
	
	chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	  if (message === 'Parse.Start') {
	    console.log('Sender!', sender);
	    console.log('We have a order!', sendResponse);
	
	    parserGezitter.parse(function (response) {
	      console.log('BG RESPONSE: ', response);
	      sendResponse(response);
	    });
	  }
	  return true;
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var $http = __webpack_require__(2);
	
	var storage = chrome.storage.local;
	
	var parserGezitterOrg = function () {
	  var self = this;
	  var url = 'http://www.gezitter.org/rss/all/';
	
	  return {
	    parse: function (sendResponse) {
	      // var parsed = [];
	      // storage.get('parsed', function(items) {
	      //   console.log('PARSED: ', items.parsed);
	      //   parsed = items.parsed || [];
	      //   if (parsed.length > 1) {
	      //     storage.remove('parsed', function() {
	      //       console.log('parsed list in storage cleared');
	      //     });
	      //   }
	      // });
	      var matchedItems = [];
	      var items;
	
	      // ключевые слова
	      var keywords;
	      storage.get('keywords', function (items) {
	        keywords = items.keywords.split(';') || [];
	      });
	
	      $.get(url, function (data, status) {
	        // список статей
	        items = $('item', data);
	
	        // FIXME: упростим отладку - оставим только парочку
	        items = items.slice(0, 20);
	      }).always(function () {
	        var all = [];
	        var errors = [];
	
	        $.each(items, function (index, item) {
	          var $this = $(item);
	          var title = $this.find('title').text();
	          var link = $this.find('link').text();
	          var pubDate = $this.find('pubDate').text();
	          var guid = $this.find('guid').text();
	          var description = $this.find('description').text();
	
	          function checkCount() {
	            // if (parsed.indexOf(guid) === -1) {
	            //   parsed.push(guid);
	            //   storage.set({parsed: parsed});
	            // }
	
	            console.log('items: ', items.length);
	            console.log('all: ', all.length, 'errors: ', errors.length);
	            // если обработаны все запросы (с ошибкой или без) - отправляем ответ в интерфейс
	            if (items.length === all.length + errors.length) {
	              sendResponse(matchedItems);
	            }
	          }
	
	          var callback = {
	            success: function (data) {
	              console.log(1, 'success');
	              all.push(data);
	
	              // TODO: вырезать все img теги перед созданием $data
	              data = data.replace(/<img .*?>/g, '');
	              var $data = $(data);
	              var articleText = $data.find('#newText').text();
	
	              if (articleText.length > 0) {
	                var hasKeywords = false;
	                for (i = 0; i < keywords.length; i++) {
	                  if (hasKeywords) {
	                    continue;
	                  }
	                  if (articleText.indexOf(keywords[i]) !== -1) {
	                    hasKeywords = true;
	                  }
	                }
	
	                if (hasKeywords) {
	                  console.log('MATCH FOR "' + keywords + '" in ' + title);
	                  matchedItems.push({
	                    title: title,
	                    link: link,
	                    pubDate: pubDate,
	                    guid: guid,
	                    description: description
	                  });
	                }
	              }
	              checkCount();
	            },
	            error: function (data) {
	              console.log(2, 'error');
	              errors.push(data);
	              checkCount();
	            }
	          };
	
	          // if (parsed.indexOf(guid) === -1) {
	          $http(link).get().then(callback.success, callback.error).catch(callback.error);
	          // }
	        }); // each items end
	      });
	    }
	  };
	}();
	
	module.exports = parserGezitterOrg;

/***/ },
/* 2 */
/***/ function(module, exports) {

	// A-> $http function is implemented in order to follow the standard Adapter pattern
	var $http = function (url) {
	
	  // A small example of object
	  var core = {
	
	    // Method that performs the ajax request
	    ajax: function (method, url, args) {
	
	      // Creating a promise
	      var promise = new Promise(function (resolve, reject) {
	
	        // Instantiates the XMLHttpRequest
	        var client = new XMLHttpRequest();
	        var uri = url;
	
	        if (args && (method === 'POST' || method === 'PUT')) {
	          uri += '?';
	          var argcount = 0;
	          for (var key in args) {
	            if (args.hasOwnProperty(key)) {
	              if (argcount++) {
	                uri += '&';
	              }
	              uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
	            }
	          }
	        }
	
	        client.timeout = 5000;
	        client.open(method, uri, true);
	        client.send();
	
	        client.onload = function () {
	          if (this.status >= 200 && this.status < 300) {
	            // Performs the function "resolve" when this.status is equal to 2xx
	            resolve(this.response);
	          } else {
	            // Performs the function "reject" when this.status is different than 2xx
	            reject(this.statusText);
	          }
	        };
	        client.onerror = function () {
	          reject(this.statusText);
	        };
	      });
	
	      // Return the promise
	      return promise;
	    }
	  };
	
	  // Adapter pattern
	  return {
	    'get': function (args) {
	      return core.ajax('GET', url, args);
	    },
	    'post': function (args) {
	      return core.ajax('POST', url, args);
	    },
	    'put': function (args) {
	      return core.ajax('PUT', url, args);
	    },
	    'delete': function (args) {
	      return core.ajax('DELETE', url, args);
	    }
	  };
	};
	// End A
	
	module.exports = $http;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDVmZDhiZmQ5MzdlOGUxMmYxNDgiLCJ3ZWJwYWNrOi8vLy4vbWFpbi5qcyIsIndlYnBhY2s6Ly8vLi9qcy9tb2R1bGVzL3BhcnNlcnMvZ2V6aXR0ZXIub3JnLmpzIiwid2VicGFjazovLy8uL2pzL21vZHVsZXMvSHR0cC5qcyJdLCJuYW1lcyI6WyJjaHJvbWUiLCJhcHAiLCJydW50aW1lIiwib25MYXVuY2hlZCIsImFkZExpc3RlbmVyIiwic2NyZWVuV2lkdGgiLCJzY3JlZW4iLCJhdmFpbFdpZHRoIiwic2NyZWVuSGVpZ2h0IiwiYXZhaWxIZWlnaHQiLCJ3aWR0aCIsImhlaWdodCIsIndpbmRvdyIsImNyZWF0ZSIsImlkIiwib3V0ZXJCb3VuZHMiLCJsZWZ0IiwiTWF0aCIsInJvdW5kIiwidG9wIiwibWluSGVpZ2h0IiwibWluV2lkdGgiLCJwYXJzZXJHZXppdHRlciIsInJlcXVpcmUiLCJvbk1lc3NhZ2UiLCJtZXNzYWdlIiwic2VuZGVyIiwic2VuZFJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsInBhcnNlIiwicmVzcG9uc2UiLCIkaHR0cCIsInN0b3JhZ2UiLCJsb2NhbCIsInBhcnNlckdleml0dGVyT3JnIiwic2VsZiIsInVybCIsIm1hdGNoZWRJdGVtcyIsIml0ZW1zIiwia2V5d29yZHMiLCJnZXQiLCJzcGxpdCIsIiQiLCJkYXRhIiwic3RhdHVzIiwic2xpY2UiLCJhbHdheXMiLCJhbGwiLCJlcnJvcnMiLCJlYWNoIiwiaW5kZXgiLCJpdGVtIiwiJHRoaXMiLCJ0aXRsZSIsImZpbmQiLCJ0ZXh0IiwibGluayIsInB1YkRhdGUiLCJndWlkIiwiZGVzY3JpcHRpb24iLCJjaGVja0NvdW50IiwibGVuZ3RoIiwiY2FsbGJhY2siLCJzdWNjZXNzIiwicHVzaCIsInJlcGxhY2UiLCIkZGF0YSIsImFydGljbGVUZXh0IiwiaGFzS2V5d29yZHMiLCJpIiwiaW5kZXhPZiIsImVycm9yIiwidGhlbiIsImNhdGNoIiwibW9kdWxlIiwiZXhwb3J0cyIsImNvcmUiLCJhamF4IiwibWV0aG9kIiwiYXJncyIsInByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNsaWVudCIsIlhNTEh0dHBSZXF1ZXN0IiwidXJpIiwiYXJnY291bnQiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsImVuY29kZVVSSUNvbXBvbmVudCIsInRpbWVvdXQiLCJvcGVuIiwic2VuZCIsIm9ubG9hZCIsInN0YXR1c1RleHQiLCJvbmVycm9yIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ3RDQTs7Ozs7O0FBTUFBLFFBQU9DLEdBQVAsQ0FBV0MsT0FBWCxDQUFtQkMsVUFBbkIsQ0FBOEJDLFdBQTlCLENBQTBDLFlBQVc7QUFDbkQ7QUFDQSxPQUFJQyxjQUFjQyxPQUFPQyxVQUF6QjtBQUNBLE9BQUlDLGVBQWVGLE9BQU9HLFdBQTFCO0FBQ0EsT0FBSUMsUUFBUSxHQUFaO0FBQ0EsT0FBSUMsU0FBUyxHQUFiOztBQUVBWCxVQUFPQyxHQUFQLENBQVdXLE1BQVgsQ0FBa0JDLE1BQWxCLENBQXlCLFlBQXpCLEVBQXVDO0FBQ3JDQyxTQUFJLGNBRGlDO0FBRXJDQyxrQkFBYTtBQUNYTCxjQUFPQSxLQURJO0FBRVhDLGVBQVFBLE1BRkc7QUFHWEssYUFBTUMsS0FBS0MsS0FBTCxDQUFXLENBQUNiLGNBQVlLLEtBQWIsSUFBb0IsQ0FBL0IsQ0FISztBQUlYUyxZQUFLRixLQUFLQyxLQUFMLENBQVcsQ0FBQ1YsZUFBYUcsTUFBZCxJQUFzQixDQUFqQyxDQUpNO0FBS1hTLGtCQUFXVCxNQUxBO0FBTVhVLGlCQUFVWDtBQU5DO0FBRndCLElBQXZDO0FBV0QsRUFs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LEtBQUtBLE1BQUwsR0FBYyxHQUF4QyxFQUE2QztBQUMzQztBQUNBc0MscUJBQVEsS0FBS3BELFFBQWI7QUFDRCxZQUhELE1BR087QUFDTDtBQUNBcUQsb0JBQU8sS0FBS1ksVUFBWjtBQUNEO0FBQ0YsVUFSRDtBQVNBWCxnQkFBT1ksT0FBUCxHQUFpQixZQUFZO0FBQzNCYixrQkFBTyxLQUFLWSxVQUFaO0FBQ0QsVUFGRDtBQUdELFFBbkNhLENBQWQ7O0FBcUNBO0FBQ0EsY0FBT2YsT0FBUDtBQUNEO0FBN0NRLElBQVg7O0FBZ0RBO0FBQ0EsVUFBTztBQUNMLFlBQU8sVUFBU0QsSUFBVCxFQUFlO0FBQ3BCLGNBQU9ILEtBQUtDLElBQUwsQ0FBVSxLQUFWLEVBQWlCekMsR0FBakIsRUFBc0IyQyxJQUF0QixDQUFQO0FBQ0QsTUFISTtBQUlMLGFBQVEsVUFBU0EsSUFBVCxFQUFlO0FBQ3JCLGNBQU9ILEtBQUtDLElBQUwsQ0FBVSxNQUFWLEVBQWtCekMsR0FBbEIsRUFBdUIyQyxJQUF2QixDQUFQO0FBQ0QsTUFOSTtBQU9MLFlBQU8sVUFBU0EsSUFBVCxFQUFlO0FBQ3BCLGNBQU9ILEtBQUtDLElBQUwsQ0FBVSxLQUFWLEVBQWlCekMsR0FBakIsRUFBc0IyQyxJQUF0QixDQUFQO0FBQ0QsTUFUSTtBQVVMLGVBQVUsVUFBU0EsSUFBVCxFQUFlO0FBQ3ZCLGNBQU9ILEtBQUtDLElBQUwsQ0FBVSxRQUFWLEVBQW9CekMsR0FBcEIsRUFBeUIyQyxJQUF6QixDQUFQO0FBQ0Q7QUFaSSxJQUFQO0FBY0QsRUFsRUQ7QUFtRUE7O0FBRUFMLFFBQU9DLE9BQVAsR0FBaUI1QyxLQUFqQixDIiwiZmlsZSI6ImJhY2tncm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvcHVibGljL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgZDVmZDhiZmQ5MzdlOGUxMmYxNDhcbiAqKi8iLCIvKipcbiAqIExpc3RlbnMgZm9yIHRoZSBhcHAgbGF1bmNoaW5nIHRoZW4gY3JlYXRlcyB0aGUgd2luZG93XG4gKlxuICogQHNlZSBodHRwOi8vZGV2ZWxvcGVyLmNocm9tZS5jb20vYXBwcy9hcHAucnVudGltZS5odG1sXG4gKiBAc2VlIGh0dHA6Ly9kZXZlbG9wZXIuY2hyb21lLmNvbS9hcHBzL2FwcC53aW5kb3cuaHRtbFxuICovXG5jaHJvbWUuYXBwLnJ1bnRpbWUub25MYXVuY2hlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbigpIHtcbiAgLy8gQ2VudGVyIHdpbmRvdyBvbiBzY3JlZW4uXG4gIHZhciBzY3JlZW5XaWR0aCA9IHNjcmVlbi5hdmFpbFdpZHRoO1xuICB2YXIgc2NyZWVuSGVpZ2h0ID0gc2NyZWVuLmF2YWlsSGVpZ2h0O1xuICB2YXIgd2lkdGggPSA1MDA7XG4gIHZhciBoZWlnaHQgPSA0MDA7XG5cbiAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJywge1xuICAgIGlkOiBcImhlbGxvV29ybGRJRFwiLFxuICAgIG91dGVyQm91bmRzOiB7XG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgIGxlZnQ6IE1hdGgucm91bmQoKHNjcmVlbldpZHRoLXdpZHRoKS8yKSxcbiAgICAgIHRvcDogTWF0aC5yb3VuZCgoc2NyZWVuSGVpZ2h0LWhlaWdodCkvMiksXG4gICAgICBtaW5IZWlnaHQ6IGhlaWdodCxcbiAgICAgIG1pbldpZHRoOiB3aWR0aFxuICAgIH1cbiAgfSk7XG59KTtcblxudmFyIHBhcnNlckdleml0dGVyID0gcmVxdWlyZSgnbW9kdWxlcy9wYXJzZXJzL2dleml0dGVyLm9yZycpO1xuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24obWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgaWYgKG1lc3NhZ2UgPT09ICdQYXJzZS5TdGFydCcpIHtcbiAgICBjb25zb2xlLmxvZygnU2VuZGVyIScsIHNlbmRlcik7XG4gICAgY29uc29sZS5sb2coJ1dlIGhhdmUgYSBvcmRlciEnLCBzZW5kUmVzcG9uc2UpO1xuXG4gICAgcGFyc2VyR2V6aXR0ZXIucGFyc2UoZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdCRyBSRVNQT05TRTogJywgcmVzcG9uc2UpO1xuICAgICAgc2VuZFJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vbWFpbi5qc1xuICoqLyIsInZhciAkaHR0cCA9IHJlcXVpcmUoJ21vZHVsZXMvSHR0cCcpO1xuXG52YXIgc3RvcmFnZSA9IGNocm9tZS5zdG9yYWdlLmxvY2FsO1xuXG52YXIgcGFyc2VyR2V6aXR0ZXJPcmcgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgdXJsID0gJ2h0dHA6Ly93d3cuZ2V6aXR0ZXIub3JnL3Jzcy9hbGwvJztcblxuICByZXR1cm4ge1xuICAgIHBhcnNlOiBmdW5jdGlvbihzZW5kUmVzcG9uc2UpIHtcbiAgICAgIC8vIHZhciBwYXJzZWQgPSBbXTtcbiAgICAgIC8vIHN0b3JhZ2UuZ2V0KCdwYXJzZWQnLCBmdW5jdGlvbihpdGVtcykge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnUEFSU0VEOiAnLCBpdGVtcy5wYXJzZWQpO1xuICAgICAgLy8gICBwYXJzZWQgPSBpdGVtcy5wYXJzZWQgfHwgW107XG4gICAgICAvLyAgIGlmIChwYXJzZWQubGVuZ3RoID4gMSkge1xuICAgICAgLy8gICAgIHN0b3JhZ2UucmVtb3ZlKCdwYXJzZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vICAgICAgIGNvbnNvbGUubG9nKCdwYXJzZWQgbGlzdCBpbiBzdG9yYWdlIGNsZWFyZWQnKTtcbiAgICAgIC8vICAgICB9KTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfSk7XG4gICAgICB2YXIgbWF0Y2hlZEl0ZW1zID0gW107XG4gICAgICB2YXIgaXRlbXM7XG5cbiAgICAgIC8vINC60LvRjtGH0LXQstGL0LUg0YHQu9C+0LLQsFxuICAgICAgdmFyIGtleXdvcmRzO1xuICAgICAgc3RvcmFnZS5nZXQoJ2tleXdvcmRzJywgZnVuY3Rpb24oaXRlbXMpIHtcbiAgICAgICAga2V5d29yZHMgPSBpdGVtcy5rZXl3b3Jkcy5zcGxpdCgnOycpIHx8IFtdO1xuICAgICAgfSk7XG5cbiAgICAgICQuZ2V0KHVybCwgZnVuY3Rpb24oZGF0YSwgc3RhdHVzKSB7XG4gICAgICAgIC8vINGB0L/QuNGB0L7QuiDRgdGC0LDRgtC10LlcbiAgICAgICAgaXRlbXMgPSAkKCdpdGVtJywgZGF0YSk7XG5cbiAgICAgICAgLy8gRklYTUU6INGD0L/RgNC+0YHRgtC40Lwg0L7RgtC70LDQtNC60YMgLSDQvtGB0YLQsNCy0LjQvCDRgtC+0LvRjNC60L4g0L/QsNGA0L7Rh9C60YNcbiAgICAgICAgaXRlbXMgPSBpdGVtcy5zbGljZSgwLCAyMCk7XG5cbiAgICAgIH0pLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFsbCA9IFtdO1xuICAgICAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICAgICAgJC5lYWNoKGl0ZW1zLCBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHZhciAkdGhpcyA9ICQoaXRlbSk7XG4gICAgICAgICAgdmFyIHRpdGxlID0gJHRoaXMuZmluZCgndGl0bGUnKS50ZXh0KCk7XG4gICAgICAgICAgdmFyIGxpbmsgPSAkdGhpcy5maW5kKCdsaW5rJykudGV4dCgpO1xuICAgICAgICAgIHZhciBwdWJEYXRlID0gJHRoaXMuZmluZCgncHViRGF0ZScpLnRleHQoKTtcbiAgICAgICAgICB2YXIgZ3VpZCA9ICR0aGlzLmZpbmQoJ2d1aWQnKS50ZXh0KCk7XG4gICAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gJHRoaXMuZmluZCgnZGVzY3JpcHRpb24nKS50ZXh0KCk7XG5cbiAgICAgICAgICBmdW5jdGlvbiBjaGVja0NvdW50KCkge1xuICAgICAgICAgICAgLy8gaWYgKHBhcnNlZC5pbmRleE9mKGd1aWQpID09PSAtMSkge1xuICAgICAgICAgICAgLy8gICBwYXJzZWQucHVzaChndWlkKTtcbiAgICAgICAgICAgIC8vICAgc3RvcmFnZS5zZXQoe3BhcnNlZDogcGFyc2VkfSk7XG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpdGVtczogJywgaXRlbXMubGVuZ3RoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbGw6ICcsIGFsbC5sZW5ndGgsICdlcnJvcnM6ICcsIGVycm9ycy5sZW5ndGgpO1xuICAgICAgICAgICAgLy8g0LXRgdC70Lgg0L7QsdGA0LDQsdC+0YLQsNC90Ysg0LLRgdC1INC30LDQv9GA0L7RgdGLICjRgSDQvtGI0LjQsdC60L7QuSDQuNC70Lgg0LHQtdC3KSAtINC+0YLQv9GA0LDQstC70Y/QtdC8INC+0YLQstC10YIg0LIg0LjQvdGC0LXRgNGE0LXQudGBXG4gICAgICAgICAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAoYWxsLmxlbmd0aCArIGVycm9ycy5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgIHNlbmRSZXNwb25zZShtYXRjaGVkSXRlbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBjYWxsYmFjayA9IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coMSwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICAgICAgYWxsLnB1c2goZGF0YSk7XG5cbiAgICAgICAgICAgICAgLy8gVE9ETzog0LLRi9GA0LXQt9Cw0YLRjCDQstGB0LUgaW1nINGC0LXQs9C4INC/0LXRgNC10LQg0YHQvtC30LTQsNC90LjQtdC8ICRkYXRhXG4gICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoLzxpbWcgLio/Pi9nLCAnJyk7XG4gICAgICAgICAgICAgIHZhciAkZGF0YSA9ICQoZGF0YSk7XG4gICAgICAgICAgICAgIHZhciBhcnRpY2xlVGV4dCA9ICRkYXRhLmZpbmQoJyNuZXdUZXh0JykudGV4dCgpO1xuXG4gICAgICAgICAgICAgIGlmIChhcnRpY2xlVGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhhc0tleXdvcmRzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXdvcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaGFzS2V5d29yZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoYXJ0aWNsZVRleHQuaW5kZXhPZihrZXl3b3Jkc1tpXSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc0tleXdvcmRzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaGFzS2V5d29yZHMpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNQVRDSCBGT1IgXCInICsga2V5d29yZHMgKyAnXCIgaW4gJyArIHRpdGxlKTtcbiAgICAgICAgICAgICAgICAgIG1hdGNoZWRJdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBsaW5rOiBsaW5rLFxuICAgICAgICAgICAgICAgICAgICBwdWJEYXRlOiBwdWJEYXRlLFxuICAgICAgICAgICAgICAgICAgICBndWlkOiBndWlkLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjaGVja0NvdW50KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coMiwgJ2Vycm9yJyk7XG4gICAgICAgICAgICAgIGVycm9ycy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICBjaGVja0NvdW50KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIGlmIChwYXJzZWQuaW5kZXhPZihndWlkKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICRodHRwKGxpbmspLmdldCgpXG4gICAgICAgICAgICAgIC50aGVuKGNhbGxiYWNrLnN1Y2Nlc3MsIGNhbGxiYWNrLmVycm9yKVxuICAgICAgICAgICAgICAuY2F0Y2goY2FsbGJhY2suZXJyb3IpO1xuICAgICAgICAgIC8vIH1cblxuICAgICAgICB9KTsgLy8gZWFjaCBpdGVtcyBlbmRcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZXJHZXppdHRlck9yZztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2pzL21vZHVsZXMvcGFyc2Vycy9nZXppdHRlci5vcmcuanNcbiAqKi8iLCIvLyBBLT4gJGh0dHAgZnVuY3Rpb24gaXMgaW1wbGVtZW50ZWQgaW4gb3JkZXIgdG8gZm9sbG93IHRoZSBzdGFuZGFyZCBBZGFwdGVyIHBhdHRlcm5cbnZhciAkaHR0cCA9IGZ1bmN0aW9uICh1cmwpIHtcblxuICAvLyBBIHNtYWxsIGV4YW1wbGUgb2Ygb2JqZWN0XG4gIHZhciBjb3JlID0ge1xuXG4gICAgLy8gTWV0aG9kIHRoYXQgcGVyZm9ybXMgdGhlIGFqYXggcmVxdWVzdFxuICAgIGFqYXg6IGZ1bmN0aW9uIChtZXRob2QsIHVybCwgYXJncykge1xuXG4gICAgICAvLyBDcmVhdGluZyBhIHByb21pc2VcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoIGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblxuICAgICAgICAvLyBJbnN0YW50aWF0ZXMgdGhlIFhNTEh0dHBSZXF1ZXN0XG4gICAgICAgIHZhciBjbGllbnQgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgdmFyIHVyaSA9IHVybDtcblxuICAgICAgICBpZiAoYXJncyAmJiAobWV0aG9kID09PSAnUE9TVCcgfHwgbWV0aG9kID09PSAnUFVUJykpIHtcbiAgICAgICAgICB1cmkgKz0gJz8nO1xuICAgICAgICAgIHZhciBhcmdjb3VudCA9IDA7XG4gICAgICAgICAgZm9yICh2YXIga2V5IGluIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgaWYgKGFyZ2NvdW50KyspIHtcbiAgICAgICAgICAgICAgICB1cmkgKz0gJyYnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHVyaSArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChhcmdzW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNsaWVudC50aW1lb3V0ID0gNTAwMDtcbiAgICAgICAgY2xpZW50Lm9wZW4obWV0aG9kLCB1cmksIHRydWUpO1xuICAgICAgICBjbGllbnQuc2VuZCgpO1xuXG4gICAgICAgIGNsaWVudC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgLy8gUGVyZm9ybXMgdGhlIGZ1bmN0aW9uIFwicmVzb2x2ZVwiIHdoZW4gdGhpcy5zdGF0dXMgaXMgZXF1YWwgdG8gMnh4XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBQZXJmb3JtcyB0aGUgZnVuY3Rpb24gXCJyZWplY3RcIiB3aGVuIHRoaXMuc3RhdHVzIGlzIGRpZmZlcmVudCB0aGFuIDJ4eFxuICAgICAgICAgICAgcmVqZWN0KHRoaXMuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjbGllbnQub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZWplY3QodGhpcy5zdGF0dXNUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBSZXR1cm4gdGhlIHByb21pc2VcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICAvLyBBZGFwdGVyIHBhdHRlcm5cbiAgcmV0dXJuIHtcbiAgICAnZ2V0JzogZnVuY3Rpb24oYXJncykge1xuICAgICAgcmV0dXJuIGNvcmUuYWpheCgnR0VUJywgdXJsLCBhcmdzKTtcbiAgICB9LFxuICAgICdwb3N0JzogZnVuY3Rpb24oYXJncykge1xuICAgICAgcmV0dXJuIGNvcmUuYWpheCgnUE9TVCcsIHVybCwgYXJncyk7XG4gICAgfSxcbiAgICAncHV0JzogZnVuY3Rpb24oYXJncykge1xuICAgICAgcmV0dXJuIGNvcmUuYWpheCgnUFVUJywgdXJsLCBhcmdzKTtcbiAgICB9LFxuICAgICdkZWxldGUnOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICByZXR1cm4gY29yZS5hamF4KCdERUxFVEUnLCB1cmwsIGFyZ3MpO1xuICAgIH1cbiAgfTtcbn07XG4vLyBFbmQgQVxuXG5tb2R1bGUuZXhwb3J0cyA9ICRodHRwO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vanMvbW9kdWxlcy9IdHRwLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==