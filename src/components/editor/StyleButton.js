import React from 'react';

function StyleButton(props) {
    
    function onToggle(e) {
        e.preventDefault();
        props.onToggle(props.style);
    };

    let className = 'RichEditor-styleButton';
    if (props.active) {
        className += ' RichEditor-activeButton';
    }

    return (
        <span className={className} onMouseDown={onToggle}>
            {props.children ? props.children : props.label }
        </span>
    );
    
}

export default StyleButton