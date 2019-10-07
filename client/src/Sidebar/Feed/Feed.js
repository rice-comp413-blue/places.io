import React from 'react';
export default class Feed extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div>
                <ul>
                    {this.props.elements.map(x => (<li key={x}>{x}</li>))}
                </ul>
            </div>
        )
    }
}