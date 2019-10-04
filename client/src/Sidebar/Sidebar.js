import React from 'react';
import Feed from '../Feed/Feed';
import Form from '../Feed/Form';
import { SegmentedControl } from 'segmented-control'


const Sidebar = (props) => {
    const updateMode = (newMode) => props.updateModeFunc(newMode);
    const feed = ['This', 'is', 'the', 'feed'];
    return (
        <div>
            <SegmentedControl
                name="modeToggle"
                options={[
                    { label: "View", value: "view", default: true },
                    { label: "Submit", value: "submit" },
                ]}
                setValue={newMode => updateMode(newMode)}
                style={{ width: '100%', color: '#2980b9', marginLeft: '1em' }} // purple400
            />
            {props.mode === 'view' ? <Feed elements={feed}/> : <Form/>}
        </div>
    )
};

export default Sidebar;