var React = require('react');

var ParseStartButton = React.createClass({
  click: function(e) {
    console.log(e.target);
    e.preventDefault();
    window.ee.emit('Action.Parse', {'value': e.target.value});
  },
  render: function() {
    return (
      <button name="parse" onClick={this.click} value="parse">Поехали!</button>
    );
  }
});

module.exports = ParseStartButton;