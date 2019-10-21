import React from 'react';

const FeedItem = (props) => {
    <div>
        ID: {props.story.id}
        Text: {props.story.text}
        Location: ({props.story.lat}, {props.story.long})
        Time: {props.story.time}
    </div>
};
