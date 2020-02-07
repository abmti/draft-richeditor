import React, { useEffect, useState } from 'react';
import { getSelectionCustomInlineStyle, toggleCustomInlineStyle } from 'draftjs-utils';

var FONT_SIZES = [
    {label: '10', style: 10},
    {label: '12', style: 12},
    {label: '14', style: 14},
    {label: '16', style: 16},
    {label: '18', style: 18},
    {label: '20', style: 20},
];

const FontSizeControls = (props) => {
    
    const currentStyle = getSelectionCustomInlineStyle(props.editorState, ['FONTSIZE']).FONTSIZE
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [defaultValue, setDefaultValue] = useState(null)

    useEffect(() => {
        if(!currentStyle) {
            const editorElm = document.getElementsByClassName('DraftEditor-root');
            if (editorElm && editorElm.length > 0) {
                const editorStyles = window.getComputedStyle(editorElm[0]);
                let defaultFontSize = editorStyles.getPropertyValue('font-size');
                defaultFontSize = defaultFontSize.substring(0, defaultFontSize.length - 2);
                console.debug({defaultFontSize})
                setDefaultValue(defaultFontSize)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggle = (e) => {
        console.debug(e)
        e.preventDefault();
        setDropdownOpen(!dropdownOpen)
    }


    const handleSelect = (e, value) => {
        e.preventDefault();
        console.debug('toggleFontSize: '+ value)
        const newState = toggleCustomInlineStyle(
            props.editorState,
            'fontSize',
            value,
        );
        if (newState) {
            props.onChange(newState);
        }
        toggle(e)        
    }


    return (
        
        <div className="btn-group show mr-2">
            <button type="button" aria-haspopup="true" aria-expanded="true" className="dropdown-toggle dropdown-toggle-controls btn btn-sm btn-outline-secondary"
                onMouseDown={toggle}>
                {currentStyle ? currentStyle.replace('fontsize-', '') : defaultValue}
            </button>
            {dropdownOpen && (
                <div tabIndex="-1" role="menu" aria-hidden="false" className="dropdown-menu show" style={{position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(0px, 30px, 0px)'}} x-placement="bottom-start">

                    {FONT_SIZES.map((type) => (
                        
                        <button key={type.label} type="button" tabIndex="0" role="menuitem" className="dropdown-item"
                            onMouseDown={(e) => {
                                handleSelect(e, type.style)
                            }}>
                            {type.label}
                        </button>

                    ))}
                </div>
            )}     
        </div>

        
    );
};

export default FontSizeControls;