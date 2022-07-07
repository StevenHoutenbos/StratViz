import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab.js';
import NonContinous from './NonContinuous.js'
import TabContent from './TabContent.js';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuid } from 'uuid';

function Tabs(props) {

    const importConfig = (tabs) => {
        tabs.forEach(tab => {
            tab.tabId = uuid()
            tab.plots.forEach(plot => {
                plot.plotId = uuid()
            });
        });
        // console.log(tabs)
        return tabs
    }

    const [tabs, setTabs] = useState(importConfig(props.config.tabs));
    const [activeTab, setActiveTab] = useState(props.config.tabs[0].tabId);

    const uploadRef = React.useRef(null);

    const newTab = () => {
        return {
            tabName: "new tab",
            tabId: uuid(),
            plots: [{
                plotName: "new Plot",
                plotId: uuid(),
                signals: []
            }, {
                plotName: "new Plot",
                plotId: uuid(),
                signals: []
            }, {
                plotName: "new Plot",
                plotId: uuid(),
                signals: []
            }, {
                plotName: "new Plot",
                plotId: uuid(),
                signals: []
            },
            ]
        }
    }

    // Handle clicking a tab
    const onClickTabItem = (tabId) => {

        // Set active tab to clicked tab
        setActiveTab(tabId);
    }

    const handleChangeTabName = (tabId, newTitle) => {

        // Find index of object we want to change
        const tabIndex = tabs.findIndex((tab => tab.tabId === tabId));

        // copy the original array, as to not mutate the original array
        const newTabs = [...tabs];

        // change the value that we want to change
        newTabs[tabIndex].tabName = newTitle;

        // Set the newTabs array as the new array
        setTabs(newTabs);
    }

    const handleDeleteTab = (tabId) => {
        // Find index of object we want to change
        const tabIndex = tabs.findIndex((tab => tab.tabId === tabId));

        // copy the original array, as to not mutate the original array
        const newTabs = [...tabs];

        // change the value that we want to change
        newTabs.splice(tabIndex);

        // Set the newTabs array as the new array
        setTabs(newTabs);
    }

    const addTab = () => {
        // copy the original array, as to not mutate the original array
        const newTabs = [...tabs];

        // change the value that we want to change
        newTabs.push(newTab());

        // Set the newTabs array as the new array
        setTabs(newTabs);
    }

    const handleChangeTabs = (tabId, tabName, plots) => {

        // Find index of object we want to change
        const tabIndex = tabs.findIndex((tab => tab.tabId === tabId));

        // copy the original array, as to not mutate the original array
        const newTabs = [...tabs];

        // change the value that we want to change
        newTabs[tabIndex] = { tabName, tabId, plots };

        // Set the newTabs array as the new array
        setTabs(newTabs);
    }

    const downloadConfig = () => {

        // define file 
        const file = new File(

            // Parse tabs object as JSON string
            [JSON.stringify(tabs)],

            // name the file 'config'
            'config',

            { type: 'text/plain', }
        )


        // create a link 
        const link = document.createElement('a')

        // create a url to the file we created
        const url = URL.createObjectURL(file)

        // Add the url to the link
        link.href = url
        link.download = file.name

        // programatically add hidden link, and click it
        document.body.appendChild(link)
        link.click()

        // remove the link object after clicking it
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

    }

    const handleUploadClick = () => {

        // When the upload button is clicked, we programatically click a hidden '<input type=file>' object.
        uploadRef.current.click();

    }

    const handleUploadFile = async (e) => {

        // block default click event
        e.preventDefault()

        // create a filereader
        const reader = new FileReader()

        // when reader is ready, do:
        reader.onload = async (e) => {

            // store uploaded file in a variable
            const text = (e.target.result)

            // load file as configuration
            setTabs(importConfig(JSON.parse(text)))
        };

        reader.readAsText(e.target.files[0])
    }

    // define variable to use jsx in js later
    const nonContinous = <NonContinous />

    return (
        <div className="tabs">
            <ol className="tab-list">

                {/* for every tab, do: */}
                {tabs.map((tab) => {
                    return (

                        // create a tab (the one that we can click at the top of the screen)
                        <Tab
                            activeTab={activeTab}
                            key={tab.tabId}
                            tabId={tab.tabId}
                            label={tab.tabName}
                            onClick={onClickTabItem}
                            onChangeTabName={handleChangeTabName}
                            onDelete={handleDeleteTab}
                            float="left"
                            editable="true"
                        />
                    );
                })}

                {/* add a button to add a new tab */}
                <AddIcon id="addTab" onMouseDown={addTab} sx={{ height: '16px' }} style={{ cursor: 'pointer', paddingLeft: 4, color: "#777" }} />

                {/* add a spacer so buttons defined below float right */}
                <div style={{ flexGrow: 1 }}></div>

                {/* add config download button */}
                <CloudDownloadIcon className='tabButton' id="downloadConfig" onMouseDown={downloadConfig} sx={{ height: '20px' }} />
                
                {/* create a hidden file input component. We will click this hidden component programatically via the cloudUploadIcon button */}
                <input type="file" style={{ display: 'none' }} id="upload" ref={uploadRef} onChange={handleUploadFile} />
                {/* add config upload button */}
                <CloudUploadIcon className='tabButton' id="uploadConfig" onClick={handleUploadClick} sx={{ height: '20px' }} />

                {/* add tab for non continuous values */}
                <Tab
                    styleName="ncTab"
                    activeTab={activeTab}
                    key="nc"
                    tabId="nc"
                    label="Non-Continuous"
                    onClick={onClickTabItem}
                    editable="false"
                />

            </ol>

            {/* create div that holds tab content. Content will change based on which tab is selected */}
            <div className="tab-content">

                {/* for all tabs */}
                {tabs.map((tab) => {

                    // check if that tab is the active tab
                    if (tab.tabId !== activeTab) return undefined;

                    // if it is, return a TabComponent with the correct properties
                    return <TabContent tabName={tab.tabName} tabId={tab.tabId} plots={tab.plots} onChangeTabs={handleChangeTabs} />;
                
                })}

                {/* if the active tab is 'nc' (non-continuous), show the 'NonContinuous' component */}
                {activeTab === "nc" ? nonContinous : undefined}

            </div>
        </div>
    )
}

Tabs.propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
}

export default Tabs;