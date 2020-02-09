import classNames from 'classnames';
import { EditorState, Modifier } from 'draft-js';
import { getSelectedBlock } from 'draftjs-utils';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import KeyDownHandler from '../../event-handler/keyDown';
import SuggestionHandler from '../../event-handler/suggestions';
import './styles.css';

class Suggestion {
  constructor(config) {
    const {
      separator,
      trigger,
      getSuggestions,
      onChange,
      getEditorState,
      getWrapperRef,
      caseSensitive,
      dropdownClassName,
      optionClassName,
      modalHandler,
    } = config;
    this.config = {
      separator,
      trigger,
      getSuggestions,
      onChange,
      getEditorState,
      getWrapperRef,
      caseSensitive,
      dropdownClassName,
      optionClassName,
      modalHandler,
    };
  }

  findSuggestionEntities = (contentBlock, callback) => {
    if (this.config.getEditorState()) {
      const {
        separator,
        trigger,
        getSuggestions,
        getEditorState,
      } = this.config;
      const selection = getEditorState().getSelection();
      if (
        selection.get('anchorKey') === contentBlock.get('key') &&
        selection.get('anchorKey') === selection.get('focusKey')
      ) {
        let text = contentBlock.getText();
        text = text.substr(
          0,
          selection.get('focusOffset') === text.length - 1
            ? text.length
            : selection.get('focusOffset') + 1
        );
        let index = text.lastIndexOf(separator + trigger);
        let preText = separator + trigger;
        if ((index === undefined || index < 0) && text[0] === trigger) {
          index = 0;
          preText = trigger;
        }
        if (index >= 0) {
          const mentionText = text.substr(index + preText.length, text.length);
          console.debug({mentionText})
          const suggestionPresent = getSuggestions().length > 0
          if (suggestionPresent) {
            callback(index === 0 ? 0 : index + 1, text.length);
          }
        }
      }
    }
  };

  getSuggestionComponent = getSuggestionComponent.bind(this);

  getSuggestionDecorator = () => ({
    strategy: this.findSuggestionEntities,
    component: this.getSuggestionComponent(),
  });
}

function getSuggestionComponent() {
  const { config } = this;
  return class SuggestionComponent extends Component {
    static propTypes = {
      children: PropTypes.array,
    };

    state = {
      style: { left: 15 },
      activeOption: -1,
      showSuggestions: true,
    };

    componentDidMount() {
      //const editorRect = config.getWrapperRef().getBoundingClientRect();
      const suggestionRect = this.suggestion.getBoundingClientRect();
      const dropdownRect = this.dropdown.getBoundingClientRect();
      let left = 15;
      let right;
      let bottom;
      /*
      if (
        editorRect.width <
        suggestionRect.left - editorRect.left + dropdownRect.width
      ) {
        right = 15;
      } else {
        left = 15;
      }
      if (editorRect.bottom < dropdownRect.bottom) {
        //bottom = 0;
      }
      */
      this.setState({
        // eslint-disable-line react/no-did-mount-set-state
        style: { left, right, bottom },
      });
      KeyDownHandler.registerCallBack(this.onEditorKeyDown);
      SuggestionHandler.open();
      config.modalHandler.setSuggestionCallback(this.closeSuggestionDropdown);
      //this.filterSuggestions(this.props);
    }

    componentDidUpdate(props) {
      const { children } = this.props;
      if (children !== props.children) {
        //this.filterSuggestions(props);
        this.setState({
          showSuggestions: true,
        });
      }
    }

    componentWillUnmount() {
      KeyDownHandler.deregisterCallBack(this.onEditorKeyDown);
      SuggestionHandler.close();
      config.modalHandler.removeSuggestionCallback();
    }

    onEditorKeyDown = event => {
        console.debug('onEditorKeyDown')
      const { activeOption } = this.state;
      const newState = {};
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (activeOption === this.filteredSuggestions.length - 1) {
          newState.activeOption = 0;
        } else {
          newState.activeOption = activeOption + 1;
        }
      } else if (event.key === 'ArrowUp') {
        if (activeOption <= 0) {
          newState.activeOption = this.filteredSuggestions.length - 1;
        } else {
          newState.activeOption = activeOption - 1;
        }
      } else if (event.key === 'Escape') {
        newState.showSuggestions = false;
        SuggestionHandler.close();
      } else if (event.key === 'Enter') {
        this.addMention();
      }
      this.setState(newState);
    };

    onOptionMouseEnter = event => {
        console.debug('onOptionMouseEnter')
      const index = event.target.getAttribute('data-index');
      this.setState({
        activeOption: index,
      });
    };

    onOptionMouseLeave = () => {
      this.setState({
        activeOption: -1,
      });
    };

    setSuggestionReference = ref => {
      this.suggestion = ref;
    };

    setDropdownReference = ref => {
      this.dropdown = ref;
    };

    closeSuggestionDropdown = () => {
      this.setState({
        showSuggestions: false,
      });
    };

    filteredSuggestions = [];

    filterSuggestions = props => {
      const mentionText = props.children[0].props.text.substr(1);
      console.debug({MENTION_TEXT: mentionText})
      const suggestions = config.getSuggestions();
      this.filteredSuggestions =
        suggestions &&
        suggestions.filter(suggestion => {
          if (!mentionText || mentionText.length === 0) {
            return true;
          }
          if (config.caseSensitive) {
            return suggestion.value.indexOf(mentionText) >= 0;
          }
          return (
            suggestion.value
              .toLowerCase()
              .indexOf(mentionText && mentionText.toLowerCase()) >= 0
          );
        });
    };

    addMention = () => {
      const { activeOption } = this.state;
      const editorState = config.getEditorState();
      const { onChange, separator, trigger } = config;
      const selectedMention = this.filteredSuggestions[activeOption];
      if (selectedMention) {
        addMention(editorState, onChange, separator, trigger, selectedMention);
      }
    };

    render() {
      const { children } = this.props;
      this.filterSuggestions(this.props);
      const { activeOption, showSuggestions } = this.state;
      const { dropdownClassName, optionClassName } = config;
      return (
        <span
          className="rdw-suggestion-wrapper"
          ref={this.setSuggestionReference}
          onClick={config.modalHandler.onSuggestionClick}
          aria-haspopup="true"
          aria-label="rdw-suggestion-popup"
        >
          <span>{children}</span>
          {showSuggestions && (
            <span
              className={classNames(
                'rdw-suggestion-dropdown',
                dropdownClassName
              )}
              contentEditable="false"
              suppressContentEditableWarning
              style={this.state.style}
              ref={this.setDropdownReference}
            >
              {this.filteredSuggestions.map((suggestion, index) => (
                <span
                  key={index}
                  spellCheck={false}
                  onClick={this.addMention}
                  data-index={index}
                  onMouseEnter={this.onOptionMouseEnter}
                  onMouseLeave={this.onOptionMouseLeave}
                  className={classNames(
                    'rdw-suggestion-option',
                    optionClassName,
                    { 'rdw-suggestion-option-active': index === activeOption }
                  )}
                >
                  {suggestion.text}
                </span>
              ))}
            </span>
          )}
        </span>
      );
    }
  };
}


function addMention(
    editorState,
    onChange,
    separator,
    trigger,
    suggestion,
  ) {

    console.debug('ADD MENTION')
    //trigger = ''
    const { value, url } = suggestion;
    const entityKey = editorState
      .getCurrentContent()
      .createEntity('MENTION', 'IMMUTABLE', { text: `${trigger}${value}`, value, url })
      .getLastCreatedEntityKey();
    const selectedBlock = getSelectedBlock(editorState);
    const selectedBlockText = selectedBlock.getText();
    let focusOffset = editorState.getSelection().focusOffset;
    const mentionIndex = (selectedBlockText.lastIndexOf(separator + trigger, focusOffset) || 0) + 1;
    let spaceAlreadyPresent = false;
    if (selectedBlockText.length === mentionIndex + 1) {
      focusOffset = selectedBlockText.length;
    }
    if (selectedBlockText[focusOffset] === ' ') {
      spaceAlreadyPresent = true;
    }
    let updatedSelection = editorState.getSelection().merge({
      anchorOffset: mentionIndex,
      focusOffset,
    });
    let newEditorState = EditorState.acceptSelection(editorState, updatedSelection);
    let contentState = Modifier.replaceText(
      newEditorState.getCurrentContent(),
      updatedSelection,
      `${trigger}${value}`,
      newEditorState.getCurrentInlineStyle(),
      entityKey,
    );
    newEditorState = EditorState.push(newEditorState, contentState, 'insert-characters');
  
    if (!spaceAlreadyPresent) {
      // insert a blank space after mention
      updatedSelection = newEditorState.getSelection().merge({
        anchorOffset: mentionIndex + value.length + trigger.length,
        focusOffset: mentionIndex + value.length + trigger.length,
      });
      newEditorState = EditorState.acceptSelection(newEditorState, updatedSelection);
      contentState = Modifier.insertText(
        newEditorState.getCurrentContent(),
        updatedSelection,
        ' ',
        newEditorState.getCurrentInlineStyle(),
        undefined,
      );
    }
    onChange(EditorState.push(newEditorState, contentState, 'insert-characters'));
  }
  


export default Suggestion;
