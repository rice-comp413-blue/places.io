import React from 'react';
import { SegmentedControl } from 'segmented-control'



class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'view'
        };
    }
    updateMode(mode) {
        this.setState({
            mode
        });
    }
    render() {
        return (
            <div>
                <SegmentedControl
                    name="modeToggle"
                    options={[
                        { label: "Submit", value: "submit" },
                        { label: "View", value: "view", default: true },
                    ]}
                    setValue={newMode => this.updateMode(newMode)}
                    style={{ width: '100%', color: '#2980b9', marginLeft: '1em' }} // purple400
                />
                {this.state.mode === 'view' ? <div>List.</div> : <div>Form goes here.</div>}
            </div>
        )
    }
}
export default Sidebar;