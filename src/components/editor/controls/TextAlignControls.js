import React, { useState, useEffect } from 'react';
import { getSelectedBlocksMetadata, setBlockData } from 'draftjs-utils';

var STYLES = [
    {label: 'Esquerda', style: 'left'},
    {label: 'Direita', style: 'right'},
    {label: 'Centralizado', style: 'center'},
    {label: 'Justificado', style: 'justify'}
];

const TextAlignControls = (props) => {
    
    const currentValue = getSelectedBlocksMetadata(props.editorState).get('text-align')

    const [dropdownOpen, setDropdownOpen] = useState(false)

    useEffect(() => {
        
    }, []);

    const toggle = (e) => {
        console.debug(e)
        e.preventDefault();
        setDropdownOpen(!dropdownOpen)
    }

    
    const handleSelect = (e, value) => {
        e.preventDefault();
        console.debug('textAlign: '+ value)
        
        if (currentValue !== value) {
            props.onChange(setBlockData(props.editorState, { 'text-align': value }));
        } else {
            props.onChange(setBlockData(props.editorState, { 'text-align': undefined }));
        }
        toggle(e)        
    }


    return (
        
        <div className="btn-group show mr-2">
            <button type="button" aria-haspopup="true" aria-expanded="true" className="dropdown-toggle dropdown-toggle-controls btn btn-sm btn-outline-secondary"
                onMouseDown={toggle}>
                <i className={`fa fa-align-${currentValue || 'left'}`}></i>
            </button>
            {dropdownOpen && (
                <div tabIndex="-1" role="menu" aria-hidden="false" className="dropdown-menu show" style={{position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(0px, 30px, 0px)'}} x-placement="bottom-start">

                    {STYLES.map((type) => (
                        
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

export default TextAlignControls;