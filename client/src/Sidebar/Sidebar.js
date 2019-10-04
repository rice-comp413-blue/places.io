import React from 'react';
import { SegmentedControl } from 'segmented-control'


const Sidebar = (props) => {
    const updateMode = (newMode) => props.updateModeFunc(newMode);
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
            {props.mode === 'view' ? <div>List.</div> : <div>Form goes here.</div>}
        </div>
    )
};

export default Sidebar;