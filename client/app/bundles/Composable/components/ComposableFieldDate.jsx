import React, { PropTypes } from 'react';
import ComposableFieldString from "./ComposableFieldString";

class ComposableFieldDate extends React.Component {
  render() {
    var className = this.props.fieldSettings.className;
    var fieldClass = "datepicker form--small";
    var props = $.extend(true, {}, this.props);
    props.fieldSettings.className = className ? className + fieldClass : fieldClass;

    return(
      <ComposableFieldString {...props} />
    )
  }
}

ComposableFieldDate.propTypes = {
  fieldIndex: React.PropTypes.number,
  fieldSettings: React.PropTypes.object,
  value: React.PropTypes.string,
  id: React.PropTypes.string,
  onChange: React.PropTypes.func
};

export default ComposableFieldDate;