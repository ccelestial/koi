import React, { PropTypes } from 'react';

class ComposableAdd extends React.Component {
  render() {
    var component = this;
    return(
      <div className="composable--add">
        <div className="composable--add--wrapper">
          <div className="composable--add--label">
            <strong>Add:</strong>
          </div>
          {component.props.dataTypes.map((dataType) => {
            return(
              <div className="composable--add--type" key={"composable_add_field_type_" + Ornament.parameterize(dataType.name)}>
                <button type="button" aria-label={"Add new " + dataType.name} onClick={() => component.props.addField(event, dataType)}>{dataType.name}</button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

ComposableAdd.propTypes = {
  dataTypes: React.PropTypes.array,
  addField: React.PropTypes.func
};

export default ComposableAdd;