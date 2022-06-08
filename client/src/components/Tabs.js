import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab';

class Tabs extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      activeTab: this.props.children[0].props.tabId,
    };
  }

  onClickTabItem = (tab) => {
    this.setState({ activeTab: tab });
  }

  changeTitleTabItem = (tabId, newTitle) => {
    console.log("called onBlurTabItem! new value of " + tabId + " is: " + newTitle);
    const { setTabName } = this.props;
    setTabName(tabId, newTitle);
  }

  footerHTML =
    <div className='footer'>
      <div className='timeAdjustment'>

      </div>
    </div>


  render() {
    const {
      onClickTabItem,
      changeTitleTabItem,
      props: {
        children,
      },
      state: {
        activeTab,
      }
    } = this;

    return (
      <div className="tabs">
        <ol className="tab-list">
          {children.map((child) => {
            const { label, tabId } = child.props;


            return (
              <Tab
                activeTab={activeTab}
                key={label}
                tabId={tabId}
                label={label}
                onClick={onClickTabItem}
                changeTitle={changeTitleTabItem}
                float="left"
                editable="true"
              />
            );
          })}
          <button id="addTab" onclick="addTab()">
            <svg style={{width:"14px",height:"14px",padding:"0px"}} viewBox="0 0 22 22">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
          </button>
          <Tab
            activeTab={activeTab}
            key="config"
            tabId="config"
            label="config"
            onClick={onClickTabItem}
            float="right"
            editable="false"
          />
        </ol>
        <div className="tab-content">
          {children.map((child) => {
            if (child.props.tabId !== activeTab) return undefined;
            return child.props.children;
          })}
        </div>
        {activeTab === "config" ? undefined : this.footerHTML}

      </div>
    );
  }
}

export default Tabs;