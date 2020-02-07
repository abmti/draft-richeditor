import React, {useState} from 'react';
import { RichUtils } from 'draft-js';

const BLOCK_TYPES = [
    {label: 'Normal', style: 'unstyled'},
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    //{label: 'UL', style: 'unordered-list-item'},
    //{label: 'OL', style: 'ordered-list-item'},
    {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();
    const blockLabel = BLOCK_TYPES.filter((type) => type.style === blockType)[0]

    const [dropdownOpen, setDropdownOpen] = useState(false)

    const toggle = (e) => {
        console.debug(e)
        e.preventDefault();
        setDropdownOpen(!dropdownOpen)
    }

    const handleSelect = (e, blockType) => {
        e.preventDefault();
        props.onChange(
            RichUtils.toggleBlockType(
                props.editorState,
                blockType
            )
        );
        toggle(e)
    }


    return (
        <>
            <div className="btn-group show mr-2">
                <button type="button" aria-haspopup="true" aria-expanded="true" className="dropdown-toggle dropdown-toggle-controls btn btn-sm btn-outline-secondary"
                    onMouseDown={toggle}>
                    {blockLabel ? blockLabel.label : BLOCK_TYPES[0].label}
                </button>
                {dropdownOpen && (
                    <div tabIndex="-1" role="menu" aria-hidden="false" className="dropdown-menu show" style={{position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(0px, 30px, 0px)'}} x-placement="bottom-start">

                        {BLOCK_TYPES.map((type) => (
                            
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

        </>
    );
};

export default BlockStyleControls;