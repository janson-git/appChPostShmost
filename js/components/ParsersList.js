var React = require('react');

// var ParserCheckbox = require('components/ParserCheckbox');
var ParserRadioButton = require('components/ParserRadioButton');

var ParsersList = React.createClass({
  onButtonClick: function(e) {
    console.log(e.target);
    e.preventDefault();
    // ee.emit('Buttons.next', {value: e.target.value});
  },
  render: function() {
    // <ParserCheckbox key={item.id} data={item}/>
    return (
      <ul className="ulCheckboxes">
        {this.props.data.map(function (item) {
          return (
            <ParserRadioButton key={item.id} data={item} groupName="parserList"/>
          )
        })}
      </ul>
    );
    }
    });

    module.exports = ParsersList;