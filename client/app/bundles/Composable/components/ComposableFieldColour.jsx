import React, { PropTypes } from 'react';
import ComposableFieldString from "./ComposableFieldString";

class ComposableFieldColour extends React.Component {
  render() {
    var data = this.props.fieldSettings.inputData || [];
    var props = $.extend(true, {}, this.props);
    data.colourpicker = "";
    props.fieldSettings.inputData = data;

    return(
      <ComposableFieldString {...props} />
    )
  }
}

ComposableFieldColour.propTypes = {
  fieldIndex: React.PropTypes.number,
  fieldSettings: React.PropTypes.object,
  value: React.PropTypes.string,
  id: React.PropTypes.string,
  onChange: React.PropTypes.func
};

export default ComposableFieldColour;