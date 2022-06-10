import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Tab extends Component {

    constructor(props){
      super(props);
      this.state = {
        editing: false,
      }
    }

    static propTypes = {
      activeTab: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    };
  
    onClick = () => {
      const { tabId, onClick } = this.props;
      onClick(tabId);
    }

    onDoubleClick = () => {
      this.setState({editing: true}); 
    }

    deleteTab = () => {
      console.log("verwijder tab");
    }
  
    handleFocus(e) {
      e.currentTarget.select();
    }

    handleBlur = (e) => {
      const {tabId, changeTitle} = this.props;
      const newTitle = e.target.value;
      changeTitle(tabId, newTitle);
      this.setState({editing: false})
    }

    render() {
      const {
        onClick,
        onDoubleClick,
        deleteTab,
        props: {
          activeTab,
          label,
          tabId,
          float,
          editable
        },
      } = this;
  
      let className = 'tab-list-item';
  
      if (activeTab === tabId) {
        className += ' tab-list-active';
      }

      const labelEditHTML = 
      <>
          <input autoFocus type="text" id='edit' defaultValue={label} onFocus={this.handleFocus} onBlur={this.handleBlur}/>
          <svg style={{width:"14px",height:"14px",padding:"0px", paddingLeft: "10px"}} viewBox="0 0 22 22" onmousedown={this.deleteTab}>
          <path fill="currentColor" d="M19,13H5V11H19V13Z" />
          </svg>
      </>

      return (
        <li
          className = {className}
          onClick = {onClick}
          onDoubleClick = {editable ? onDoubleClick : ""}
          style={{float: float}}
        >
          {(this.state.editing ? labelEditHTML : label)}
        </li>
      );
    }
  }
  
  export default Tab;