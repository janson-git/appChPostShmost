var config = [
  {
    'id': 'vb',
    'name': 'vb.kg',
    'parser': 'vb.kg'
  },
  {
    'id': 'other',
    'name': 'other.kg',
    'parser': 'other.kg'
  }
];


var Parsers = function() {
  var list = [], i;
  for (i in config) {
    var id = config[i].id;
    var name = config[i].name;
    var parser = require('modules/parsers/' + config[i].parser + '.js');

    list.push({
      'id': id,
      'name': name,
      'parser': parser
    });
  }

  return {
    'list': list
  };
}();


module.exports = Parsers;