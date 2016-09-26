var React = require('react');

var ParserRadioButton = React.createClass({
  onButtonClick: function(e) {
    console.log(e.target);
    // e.preventDefault();
    // ee.emit('Buttons.next', {value: e.target.value});
  },
  render: function() {
    var id = this.props.data.id;
    var name = this.props.data.name;
    return (
      <li><input type="radio" name={this.props.groupName} value={id} onChange={this.onButtonClick}/>{name}</li>
    );
  }
});

module.exports = ParserRadioButton;