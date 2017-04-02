import React, { PropTypes } from 'react';
import ComposableField from "./ComposableField";
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <span className="drag-handler">Drag to Reorder</span>);

const SortableItem = SortableElement(({index, fieldIndex, datum, component}) => {
  var template = component.props.getTemplateForField(datum.type);
  var parentKey = "composable_index_" + datum.id + "_type_" + datum.type; 
  return(
    <div className="composable--field">
      <div className="composable--field-heading">
        <span className="composable--field-heading--type">{template ? template.name : `Unsupported field type (${datum.type})` }</span>
        <button className="composable--field-heading--remove" type="button" onClick={() => component.props.removeField(fieldIndex)}>Remove</button>
        <DragHandle />
      </div>
      {template 
        ? <ComposableField 
            template={template.fields} 
            data={datum} 
            parentKey={parentKey} 
            fieldIndex={fieldIndex} 
            onChange={component.props.onFieldChange}
          />
        : <div className="composable--field--unsupported">
            <p>There is no available template for this field type</p>
          </div>
      }
    </div>
  );
});

const SortableList = SortableContainer(({data, onSortEnd, component}) => {
  return(
    <div className="composabe--fields">
      {data.map((datum, index) => (
        <SortableItem index={index} 
                      fieldIndex={index} 
                      datum={datum} 
                      component={component} 
                      key={"composable_index_" + datum.id + "_type_" + datum.type} 
        />
      ))}
    </div>
  );
});

class ComposableFields extends React.Component {

  constructor(props) {
    super(props),
    this.onSortEnd = this.onSortEnd.bind(this);
  }

  onSortEnd({oldIndex, newIndex}, event) {
    this.props.dragMove(oldIndex, newIndex);
  }

  render() {
    var component = this;
    var data = this.props.data;
    if(data.length) {
      return(
        <SortableList data={data} 
                      onSortEnd={this.onSortEnd} 
                      component={component} 
                      useDragHandle={true} 
                      lockAxis="y" 
                      lockToContainerEdges={true}
        />
      );
    } else {
      return(
        <div className="composable--fields__empty">
          <p>There are no fields</p>
        </div>
      );
    }
  }
}

ComposableFields.propTypes = {
  data: React.PropTypes.array,
  dataTypes: React.PropTypes.array,
  removeField: React.PropTypes.func,
  moveFieldBy: React.PropTypes.func,
  onFieldChange: React.PropTypes.func,
  getTemplateForField: React.PropTypes.func
};

export default ComposableFields;
