import { ContentState, convertToRaw, Editor, EditorState, getDefaultKeyBinding, RichUtils } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { getCustomStyleMap } from 'draftjs-utils';
import htmlToDraft from 'html-to-draftjs';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import blockStyleFn from "./BlockStyle";
import BlockStyleControls from './controls/BlockStyleControls';
import FontFamilyControls from './controls/FontFamilyControls';
import FontSizeControls from './controls/FontSizeControls';
import InlineStyleControls from './controls/InlineStyleControls';
import ListControls from './controls/ListControls';
import TextAlignControls from './controls/TextAlignControls';
import './style.css';


const RichEditor = (props, ref) => {

    const [editorState, setEditorState] = useState(null);
    const editorRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            editorRef.current.focus();
        },
        onChange: (newEditorState) => {
            onChange(newEditorState);
        },
        convertToHtml: () => {
            return draftToHtml(convertToRaw(editorState.getCurrentContent()));
        },
        getEditorState: () => {
            return editorState
        },
        getEditorRef: () => {
            return editorRef
        }
    }));

    useEffect(() => {
        let newEditorState = EditorState.createEmpty()

        if(props.initialHtml) {
            const contentBlock = htmlToDraft(props.initialHtml)
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                newEditorState = EditorState.createWithContent(contentState);
            }
        }

        newEditorState = EditorState.set(newEditorState, {
            decorator: props.compositeDecorator,
        })

        setEditorState(newEditorState)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const onChange = (editorState) => {
        setEditorState(editorState);
        //console.debug(`FontSize: ${getSelectionCustomInlineStyle(editorState, ['FONTSIZE']).FONTSIZE}`)
    }

    function handleKeyCommand(command, editorState) {
        console.debug("handleKeyCommand")
        if(props.handleKeyCommand !== undefined) {
            const handled = props.handleKeyCommand(command, editorState)
            if(handled === "handled") {
                return true
            }
        }
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            onChange(newState);
            return true;
        }
        return false;
    }

    function mapKeyToEditorCommand(e) {
        console.debug("mapKeyToEditorCommand")
        if(props.keyBindingFn !== undefined) {
            const command = props.keyBindingFn(e)
            if(command !== "") {
                return command;
            }
        }
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(
                e,
                editorState,
                4, /* maxDepth */
            );
            if (newEditorState !== editorState) {
                onChange(newEditorState);
            }
            return;
        }
        return getDefaultKeyBinding(e);
    }


    const getStyleMap = (props) => ({ ...getCustomStyleMap(), ...styleMap });

    const handleClickDiv = () => {
        editorRef.current.focus()
    }

    if (!editorState) {
        return null
    }

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
            className += ' RichEditor-hidePlaceholder';
        }
    }


    return (
        <div className="RichEditor-root">

            <div className="RichEditor-controls">

                <InlineStyleControls
                    editorState={editorState}
                    onChange={onChange}
                />

                <BlockStyleControls
                    editorState={editorState}
                    onChange={onChange}
                />

                <FontSizeControls
                    editorState={editorState}
                    onChange={onChange}
                />

                <FontFamilyControls
                    editorState={editorState}
                    onChange={onChange}
                />

                <TextAlignControls
                    editorState={editorState}
                    onChange={onChange}
                />

                <ListControls
                    editorState={editorState}
                    onChange={onChange}
                />

                {props.toolbarCustomButtons && props.toolbarCustomButtons.map((button, index) => (
                    React.cloneElement(button, { key: index, editorState: editorState, onChange: onChange})
                ))}

            </div>
            <div className={className} onClick={handleClickDiv}>
                <Editor
                    editorState={editorState}
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={mapKeyToEditorCommand}
                    customStyleMap={getStyleMap(props)}
                    onChange={onChange}
                    blockStyleFn={blockStyleFn}
                    placeholder={props.placeholder}
                    ref={editorRef}
                    spellCheck={true}
                />
            </div>

            {props.showHtml && draftToHtml(convertToRaw(editorState.getCurrentContent()))}

        </div>
    );

}



// Custom overrides for "code" style.
const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};

const RichEditorRef = React.forwardRef(RichEditor);

export default RichEditorRef;