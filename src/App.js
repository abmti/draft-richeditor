import 'bootstrap/dist/css/bootstrap.min.css';
import { CompositeDecorator, EditorState, KeyBindingUtil, Modifier } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import { List } from "immutable";
import React, { useRef, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import CustomOption from './components/CustomOption';
import RichEditor from './components/editor/RichEditor';
import getMentionDecorators from './decorators/Mention';
import ModalHandler from './event-handler/modals';

const { hasCommandModifier, isCtrlKeyCommand } = KeyBindingUtil;

function App() {

    const editorRef = useRef();
    const richEditorRef = useRef();
    const [openModal, setOpenModal] = useState(false);
    const [editorState, setEditorState] = useState(null);

    const modalHandler = new ModalHandler();

    function handleKeyCommand(command, editorState) {
        if (command === "editor-find") {
            console.debug("EDITOR-FIND")
            setEditorState(editorState)
            toggleModal()
            return 'handled';
        }
        if (command === "editor-mention") {
            console.debug("EDITOR-MENTION")
        }
        return 'not-handled';
    }

    function mapKeyToEditorCommand(e) {
        // Ctrl+F
        console.debug(e.keyCode)
        if (e.keyCode === 70 && (hasCommandModifier(e) || isCtrlKeyCommand(e))) {
            return "editor-find";
        }
        //if (e.keyCode === 50) {
        //    return "editor-mention";
        //}
        return "";
    }

    function toggleModal() {
        setOpenModal(!openModal)
    }

    function addTemplate() {

        const html = '<strong>TESTEEEEE</strong>'

        const contentBlock = htmlToDraft(html);
        let contentState = editorState.getCurrentContent();
        contentBlock.entityMap.forEach((value, key) => {
            contentState = contentState.mergeEntityData(key, value);
        });
        contentState = Modifier.replaceWithFragment(
            contentState,
            editorState.getSelection(),
            new List(contentBlock.contentBlocks)
        );
        richEditorRef.current.onChange(EditorState.push(editorState, contentState, "insert-characters"));
        toggleModal()
    }

    const mention = {
        separator: ' ',
        trigger: '@',
        suggestions: [
            { text: 'APPLE', value: 'apple', url: 'apple' },
            { text: 'BANANA', value: 'banana', url: 'banana' },
            { text: 'CHERRY', value: 'cherry', url: 'cherry' },
            { text: 'DURIAN', value: 'durian', url: 'durian' },
            { text: 'EGGFRUIT', value: 'eggfruit', url: 'eggfruit' },
            { text: 'FIG', value: 'fig', url: 'fig' },
            { text: 'GRAPEFRUIT', value: 'grapefruit', url: 'grapefruit' },
            { text: 'HONEYDEW', value: 'honeydew', url: 'honeydew' },
        ],
    }

    const getSuggestions = () => mention.suggestions;

    const compositeDecorator = new CompositeDecorator([
        /*
        {
            strategy: handleStrategy,
            component: <HandleSpan onClick={addTemplate} />,
        },
        {
            strategy: hashtagStrategy,
            component: HashtagSpan,
        },
        */

        ...getMentionDecorators({
            ...mention,
            onChange: onChangeEditor,
            getEditorState: getEditorState,
            getSuggestions: getSuggestions,
            getWrapperRef: getWrapperRef,
            modalHandler: modalHandler,
      })
        
    ]);

    function onChangeEditor(newState) {
        richEditorRef.current.onChange(newState)
    }
    
    function getEditorState() {
        return richEditorRef.current.getEditorState()
    }

    function getWrapperRef() {
        return editorRef.current
    }

    return (
        <Container className="mt-3">
            <Card>
                <CardHeader>
                    Editor
                </CardHeader>
                <CardBody>

                    <div
                        ref={editorRef}
                        >
                        <RichEditor id="richeditor"
                            toolbarCustomButtons={[<CustomOption />]}
                            placeholder="Digite alguma coisa"
                            handleKeyCommand={handleKeyCommand}
                            keyBindingFn={mapKeyToEditorCommand}
                            ref={richEditorRef}
                            compositeDecorator={compositeDecorator}
                            initialHtml={"<strong>Init...</strong>"}
                            showHtml={true}
                        />
                    </div>

                    <button type="button" onClick={() => richEditorRef.current.focus()}>FOCUS</button>

                    <br />
                    <br />

                    <button type="button" onClick={() => {
                            console.debug(richEditorRef.current.convertToHtml())
                        }}>
                        PRINT HTML
                    </button>

                    <Modal isOpen={openModal} toggle={toggleModal}>
                        <ModalHeader toggle={toggleModal}>Modal title</ModalHeader>
                        <ModalBody>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={addTemplate}>Add Template HTML</Button>{' '}
                            <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                </CardBody>
            </Card>
        </Container>
    );
}

/**
 * Super simple decorators for handles and hashtags, for demonstration
 * purposes only. Don't reuse these regexes.
 */
const HANDLE_REGEX = /@[\w]+/g;
const HASHTAG_REGEX = /#[\w\u0590-\u05ff]+/g;

function handleStrategy(contentBlock, callback, contentState) {
    findWithRegex(HANDLE_REGEX, contentBlock, callback);
}

function hashtagStrategy(contentBlock, callback, contentState) {
    findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
}

function HandleSpan(props) {

    const [dropdownOpen, setDropdownOpen] = useState(true);
    const toggle = () => setDropdownOpen(prevState => !prevState);

    return (
        <span
            style={styles.handle}
            data-offset-key={props.offsetKey}
        >
            {props.children}

            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                <DropdownToggle caret>
                    Dropdown
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem>Foo Action</DropdownItem>
                    <DropdownItem>Bar Action</DropdownItem>
                    <DropdownItem onClick={props.onClick}>Quo Action</DropdownItem>
                </DropdownMenu>
            </Dropdown>

        </span>
    );
};

function HashtagSpan(props) {
    return (
        <span
            style={styles.hashtag}
            data-offset-key={props.offsetKey}
        >
            [{props.children}]
        </span>
    );
};

const styles = {
    root: {
        fontFamily: '\'Helvetica\', sans-serif',
        padding: 20,
        width: 600,
    },
    editor: {
        border: '1px solid #ddd',
        cursor: 'text',
        fontSize: 16,
        minHeight: 40,
        padding: 10,
    },
    button: {
        marginTop: 10,
        textAlign: 'center',
    },
    handle: {
        color: 'rgba(98, 177, 254, 1.0)',
        direction: 'ltr',
        unicodeBidi: 'bidi-override',
    },
    hashtag: {
        color: 'rgba(95, 184, 138, 1.0)',
    },
};


export default App;