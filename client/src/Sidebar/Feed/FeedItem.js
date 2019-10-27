import React from 'react';

const FeedItem = (props) => {
    return (
        <div className="feedItem">
            <p>ID: {props.story.storyid}</p>
            <p>Text: {props.story.text}</p>
            <p>Location: ({props.story.lat}, {props.story.long})</p>
            <p>Timestamp: {props.story.timestamp.toString()}</p>
        </div>
    );
};

export default FeedItem
