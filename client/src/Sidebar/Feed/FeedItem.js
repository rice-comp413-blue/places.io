import React from 'react';

const FeedItem = (props) => {
    return (
        <div>
            <p>------------------------</p>
            <p>ID: {props.story.storyid}</p>
            <p>Text: {props.story.text}</p>
            <p>Location: ({props.story.lat}, {props.story.long})</p>
            <p>Timestamp: {props.story.timestamp.toString()}</p>
            <p>------------------------</p>
        </div>
    );
};

export default FeedItem
