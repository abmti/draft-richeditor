// The function will return block inline styles using block level meta-data
export default function blockStyleFn(block) {

    if (block.getType() === 'blockquote') {
      return 'RichEditor-blockquote';
    } 
      
    const blockAlignment = block.getData() && block.getData().get('text-align');
    if (blockAlignment) {
      return `rdw-${blockAlignment}-aligned-block`;
    }
    
    return '';
  }
  