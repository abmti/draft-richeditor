import React from 'react';
import { EditorState, Modifier } from 'draft-js';

const CustomOption = (props) => {

    const addStar = (e) => {
      e.preventDefault();
      const { editorState, onChange } = props;
      const contentState = Modifier.replaceText(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        '⭐',
        editorState.getCurrentInlineStyle(),
      );
      onChange(EditorState.push(editorState, contentState, 'insert-characters'));
    };
  
    
    return (
      <div onMouseDown={addStar}>⭐</div>
    );
    
  }

  export default CustomOption