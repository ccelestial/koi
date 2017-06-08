import React, { PropTypes } from 'react';
import ComposableFieldString from "./ComposableFieldString";

class ComposableFieldFile extends React.Component {

  componentDidMount() {
    $(document).trigger("ornament:uploaders");
  }

  render() {
    var isUploader = this.props.fieldSettings.inputData && typeof(this.props.fieldSettings.inputData["file-uploader"]) !== "undefined";

    if(isUploader) {

      var hiddenId = this.props.id + "__hidden";
      var fileProps = $.extend(true, {}, this.props);
      var hiddenProps = $.extend(true, {}, this.props);
      fileProps.inputType = "file";
      fileProps.fieldSettings.inputData["file-for"] = hiddenId;
      fileProps.onChange = () => { 
        // WHY AREN'T YOU CHANGING THE HIDDEN INPUT BRO
        return false;
      };
      hiddenProps.inputType = "hidden";
      hiddenProps.fieldSettings.inputData = [];
      hiddenProps.fieldSettings.fieldAttributes = hiddenProps.fieldSettings.fieldAttributes || {};
      hiddenProps.fieldSettings.fieldAttributes.id = hiddenId;

      return(
        <div>
          <ComposableFieldString {...hiddenProps} />
          <ComposableFieldString {...fileProps} />
        </div>
      )
    } else {
      var props = $.extend(true, {}, this.props);
      props.inputType = "file";
      props.value = "";

      return(
        <ComposableFieldString {...props} />
      )
    }
  }
}

ComposableFieldFile.propTypes = {
  fieldIndex: React.PropTypes.number,
  fieldSettings: React.PropTypes.object,
  value: React.PropTypes.string,
  id: React.PropTypes.string,
  onChange: React.PropTypes.func
};

export default ComposableFieldFile;