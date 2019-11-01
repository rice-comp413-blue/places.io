import React from 'react';
import FeedItem from './FeedItem'

const EmptyFeed = (props) => {
    return (
        <p>Empty feed — make a view request!</p>
    )
}

export default class Feed extends React.Component {
    // constructor(props) {
    //     super(props)
    // }
    render() {
        console.log(this.props.elements);
        return (
            <div>
                {this.props.elements ? this.props.elements.map(x => (<FeedItem key={x.storyid} story={x} />)) : <EmptyFeed />}
            </div>
        )
    }
}