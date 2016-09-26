var React = require('react');

var ParserCheckbox = React.createClass({
  onButtonClick: function(e) {
    console.log(e.target);
    e.preventDefault();
    // ee.emit('Buttons.next', {value: e.target.value});
  },
  render: function() {
    var id = this.props.data.id;
    var name = this.props.data.name;
    return (
      <li><input type="checkbox" value={id} />{name}</li>
    );
  }
});

module.exports = ParserCheckbox;