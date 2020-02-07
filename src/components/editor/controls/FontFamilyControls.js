import React, { useEffect, useState } from 'react';
import { getSelectionCustomInlineStyle, toggleCustomInlineStyle } from 'draftjs-utils';

var FONT_FAMILY = [
    {label: 'Arial', style: 'Arial'},
    {label: 'Georgia', style: 'Georgia'},
    {label: 'Impact', style: 'Impact'},
    {label: 'Tahoma', style: 'Tahoma'},
    {label: 'Times New Roman', style: 'Times New Roman'},
    {label: 'Verdana', style: 'Verdana'},
];

const FontFamilyControls = (props) => {

    const currentStyle = getSelectionCustomInlineStyle(props.editorState, ['FONTFAMILY']).FONTFAMILY
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [defaultValue, setDefaultValue] = useState(null)

    useEffect(() => {
        if(!currentStyle) {
            const editorElm = document.getElementsByClassName('DraftEditor-root');
            if (editorElm && editorElm.length > 0) {
                const editorStyles = window.getComputedStyle(editorElm[0]);
                let defaultFontFamily = editorStyles.getPropertyValue('font-family');
                console.debug({defaultFontFamily})
                setDefaultValue(defaultFontFamily)
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
        console.debug('toggleFontFamily: '+ value)
        const newState = toggleCustomInlineStyle(
            props.editorState,
            'fontFamily',
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
                {currentStyle ? currentStyle.replace('fontfamily-', '') : defaultValue}
            </button>
            {dropdownOpen && (
                <div tabIndex="-1" role="menu" aria-hidden="false" className="dropdown-menu show" style={{position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(0px, 30px, 0px)'}} x-placement="bottom-start">

                    {FONT_FAMILY.map((type) => (
                        
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

export default FontFamilyControls;