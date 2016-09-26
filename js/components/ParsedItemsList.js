var React = require('react');


var ParserItemsList = React.createClass({
  onButtonClick: function(e) {
    console.log(e.target);
    e.preventDefault();
    // ee.emit('Buttons.next', {value: e.target.value});
  },
  render: function() {
    if (this.props.items === undefined) {
      return (
        <ul><li>Нет загруженых элементов</li></ul>
      );
    }
    return (
      <div className="parsedItems">
        <ul>
          {this.props.items.map(function (item) {
            return (
              <li key={item.id} groupName="parsedItemsList"><a href={item.link} target="_blank">{item.title}</a></li>
            )
          })}
        </ul>
      </div>
    );
    }
    });

    module.exports = ParserItemsList;