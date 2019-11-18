import React, { createRef } from 'react';
import FeedItem from './FeedItem'

const EmptyFeed = (props) => {
    return (
        <p className="missing">Empty feed — make a view request!</p>
    )
}

export default class Feed extends React.Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()
    }
    
    componentDidUpdate() {
        if (this.myRef.current) {
            this.myRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                {this.props.elements.length > 0 ?
                    this.props.elements.map(x => <div key={x.storyid} ref={x.storyid === this.props.selectedStory ? this.myRef : React.createRef()}><FeedItem story={x} onStoryClick={this.props.onStoryClick} selected={x.storyid === this.props.selectedStory}/></div>) :
                    <EmptyFeed />
                }
            </div>
        )
    }
}