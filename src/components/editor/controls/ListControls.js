import React from 'react';
import { RichUtils } from 'draft-js';

import StyleButton from '../StyleButton'

const BLOCK_TYPES = [
    {label: 'UL', style: 'unordered-list-item', icon: 'fa fa-list-ul'},
    {label: 'OL', style: 'ordered-list-item', icon: 'fa fa-list-ol'},
];

const ListControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();

    const toggleBlockType = (blockType) => {
        props.onChange(
            RichUtils.toggleBlockType(
                props.editorState,
                blockType
            )
        );
    }

    return (
        <span className="ml-2">
            {BLOCK_TYPES.map((type) => (
                <StyleButton
                    key={type.label}
                    active={blockType === type.style}
                    label={type.label}
                    onToggle={toggleBlockType}
                    style={type.style}
                >
                    <i className={type.icon}></i>
                </StyleButton>
            ))}
        </span>
    );
};

export default ListControls;