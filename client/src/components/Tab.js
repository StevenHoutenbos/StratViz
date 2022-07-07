import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Tab extends Component {

    constructor(props) {
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
        // import functions from props
        const { tabId, onClick } = this.props;
        // tell the parent component that this tab has been clicked
        onClick(tabId);
    }

    onDoubleClick = () => {
        // activate editing mode
        this.setState({ editing: true });
    }

    deleteTab = () => {
        // import functions from props
        const { tabId, onDelete } = this.props;
        // tell the parent component to delete this tab
        onDelete(tabId);
    }

    handleBlur = (e) => {
        // import functions from props
        const { tabId, onChangeTabName } = this.props;

        // read input field and store it
        const newTitle = e.target.value;

        // change the tab name and quit editing mode
        onChangeTabName(tabId, newTitle);
        this.setState({ editing: false })
    }

    render() {

        const {
            onClick,
            onDoubleClick,
            props: {
                activeTab,
                label,
                tabId,
                editable,
                styleName
            },
        } = this;

        // add standard styling, plus any styling that was passed on by parent as prop
        let className = 'tab-list-item ' + styleName;

        // If this tab is the active tab, add some styling
        if (activeTab === tabId) {
            className += ' tab-list-active';
        }

        // HTML for editing tabname / deleting a tab. This is only shown when editing mode is active.
        const labelEditHTML =
            <>
                {/* add an input field for the tabname. 
                When user clicks elsewhere on the screen (blur), handle the blur event.
                on focus, select the textfield, so user can directly start typing a new tab name. */}
                <input autoFocus type="text" id='edit' defaultValue={label} onFocus={(e) => e.currentTarget.select()} onBlur={this.handleBlur} />

                {/* add button to remove tab */}
                <svg style={{ width: "14px", height: "14px", padding: "0px", paddingLeft: "10px" }} viewBox="0 0 22 22" onMouseDown={this.deleteTab}>
                    <path fill="currentColor" d="M19,13H5V11H19V13Z" />
                </svg>
            </>

        return (
            <li
                className={className}
                onClick={onClick}

                // when not in editing mode, activate double click to edit functionality
                onDoubleClick={editable ? onDoubleClick : ""}
            >
                {/* if editing, show input field, else show the tab name (label) */}
                {(this.state.editing ? labelEditHTML : label)}
            </li>
        );
    }
}

export default Tab;