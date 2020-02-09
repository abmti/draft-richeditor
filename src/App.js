import 'bootstrap/dist/css/bootstrap.min.css';
import { CompositeDecorator, EditorState, KeyBindingUtil, Modifier } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import { List } from "immutable";
import React, { useRef, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Container, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import CustomOption from './components/editor/custom/CustomOption';
import Suggestion from "./components/editor/custom/FindSuggestions";
import getMentionDecorators from './components/editor/decorators/Mention';
import ModalHandler from './components/editor/event-handler/modals';
import SuggestionHandler from './components/editor/event-handler/suggestions';
import RichEditor from './components/editor/RichEditor';

const { hasCommandModifier, isCtrlKeyCommand } = KeyBindingUtil;

const suggestions = [
    { text: 'APPLE', value: 'apple', url: 'apple' },
    { text: 'BANANA', value: 'banana', url: 'banana' },
    { text: 'CHERRY', value: 'cherry', url: 'cherry' },
    { text: 'DURIAN', value: 'durian', url: 'durian' },
    { text: 'EGGFRUIT', value: 'eggfruit', url: 'eggfruit' },
    { text: 'FIG', value: 'fig', url: 'fig' },
    { text: 'GRAPEFRUIT', value: 'grapefruit', url: 'grapefruit' },
    { text: 'HONEYDEW', value: 'honeydew', url: 'honeydew' },
]

function App() {

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

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            if (SuggestionHandler.isOpen()) {
              e.preventDefault();
            }
        }

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
        
        ...getMentionDecorators({
            ...mention,
            onChange: onChangeEditor,
            getEditorState: getEditorState,
            getSuggestions: getSuggestions,
            getWrapperRef: getWrapperRef,
            modalHandler: modalHandler,
        }),

        new Suggestion({
            ...mention,
            trigger: '$',
            onChange: onChangeEditor,
            getEditorState: getEditorState,
            getSuggestions: getSuggestions,
            getWrapperRef: getWrapperRef(),
            modalHandler: modalHandler,
        }).getSuggestionDecorator()

    ]);

    function onChangeEditor(newState) {
        richEditorRef.current.onChange(newState)
    }
    
    function getEditorState() {
        return richEditorRef.current.getEditorState()
    }

    function getWrapperRef() {
        //return richEditorRef.current.getWrapperEditorRef()
        return null
    }

    return (
        <Container className="mt-3">
            <Card>
                <CardHeader>
                    Editor
                </CardHeader>
                <CardBody>

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

export default App;