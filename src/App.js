import React, {useState, useRef} from 'react';
import {Card, CardBody, CardHeader, Container} from 'reactstrap';
import {KeyBindingUtil} from 'draft-js';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import htmlToDraft from 'html-to-draftjs';
import {EditorState, Modifier} from "draft-js";
import {List} from "immutable";

import RichEditor from './components/editor/RichEditor'
import CustomOption from './components/CustomOption'

import 'bootstrap/dist/css/bootstrap.min.css';

const {hasCommandModifier, isCtrlKeyCommand} = KeyBindingUtil;


function App() {

  const richEditorRef = useRef();
  const [openModal, setOpenModal] = useState(false);
  const [editorState, setEditorState] = useState(null);

  function handleKeyCommand(command, editorState) {
    if(command === "editor-find") {
      console.debug("EDITOR-FIND")
      setEditorState(editorState)
      toggleModal()
      return 'handled';
    }
    return 'not-handled';
  }

  function mapKeyToEditorCommand(e) {
    // Ctrl+F
    console.debug(e.keyCode)
    if (e.keyCode === 70 && (hasCommandModifier(e) || isCtrlKeyCommand(e))) {
      return "editor-find";
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

  return (
    <Container className="mt-3">
      <Card>
        <CardHeader>
          Editor!
        </CardHeader>
        <CardBody>
          <RichEditor 
            toolbarCustomButtons={[<CustomOption />]}
            placeholder="Digite alguma coisa"
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={mapKeyToEditorCommand}
            ref={richEditorRef}
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