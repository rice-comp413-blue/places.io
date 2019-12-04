import React from 'react';
import ReactMarkdown from 'react-markdown';
import text from './spec_text.js';

const Spec = (props) => {
    return (
        <div style={{textAlign: 'left', paddingLeft: '5em'}}>
            <ReactMarkdown source={text} />
        </div>
    );
}

export default Spec;