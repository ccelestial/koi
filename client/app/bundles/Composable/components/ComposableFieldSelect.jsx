import React, { PropTypes } from 'react';

class ComposableFieldSelect extends React.Component {
  render() {
    var options = this.props.fieldSettings.data || [];
    var className = this.props.fieldSettings.className || "form--auto";
    return(
      <select className={className} 
              value={this.props.value} 
              onChange={(event) => this.props.onChange(event, this.props.fieldIndex, this.props.fieldSettings)}>
        {options.map(option => {
          return(
            <option value={option.value} key={"option__" + Ornament.parameterize(option.name) }>{option.name}</option>
          );
        })}
      </select>
    );
  }
}

ComposableFieldSelect.propTypes = {
  fieldIndex: React.PropTypes.number,
  fieldSettings: React.PropTypes.object,
  value: React.PropTypes.string,
  id: React.PropTypes.string,
  onChange: React.PropTypes.func
};

export default ComposableFieldSelect;
