import React from 'react';
import FeedItem from './FeedItem'

const EmptyFeed = (props) => {
    return (
        <p>Empty feed — make a view request!</p>
    )
}

export default class Feed extends React.Component {
    render() {
        return (
            <div className={this.props.className}>
                {this.props.elements ?
                    this.props.elements.map(x => <FeedItem key={x.storyid} story={x} />) :
                    <EmptyFeed />
                }
            </div>
        )
    }
}