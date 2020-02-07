import React from 'react';
import { RichUtils } from 'draft-js';

import StyleButton from '../StyleButton'

var INLINE_STYLES = [
    {label: 'Negrito', style: 'BOLD'},
    {label: 'Itálico', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();


    function toggleInlineStyle(inlineStyle) {
        props.onChange(
            RichUtils.toggleInlineStyle(
                props.editorState,
                inlineStyle
            )
        );
    }

    return (
        <>
            {INLINE_STYLES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={toggleInlineStyle}
                    style={type.style}
                />
            )}
        </>
    );
};

export default InlineStyleControls;