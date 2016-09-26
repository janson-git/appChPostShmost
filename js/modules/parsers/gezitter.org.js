var $http = require('modules/Http');

var storage = chrome.storage.local;

var parserGezitterOrg = function() {
  var self = this;
  var url = 'http://www.gezitter.org/rss/all/';

  return {
    parse: function(sendResponse) {
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
      storage.get('keywords', function(items) {
        keywords = items.keywords.split(';') || [];
      });

      $.get(url, function(data, status) {
        // список статей
        items = $('item', data);

        // FIXME: упростим отладку - оставим только парочку
        items = items.slice(0, 20);

      }).always(function() {
        var all = [];
        var errors = [];

        $.each(items, function(index, item) {
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
            if (items.length === (all.length + errors.length)) {
              sendResponse(matchedItems);
            }
          }

          var callback = {
            success: function(data) {
              console.log(1, 'success');
              all.push(data);

              // вырезать все img теги перед созданием DOM
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
            error: function(data) {
              console.log(2, 'error');
              errors.push(data);
              checkCount();
            }
          };

          // if (parsed.indexOf(guid) === -1) {
            $http(link).get()
              .then(callback.success, callback.error)
              .catch(callback.error);
          // }

        }); // each items end
      });
    }
  };
}();

module.exports = parserGezitterOrg;