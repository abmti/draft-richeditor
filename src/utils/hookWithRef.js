// https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
import {useCallback, useRef} from 'react'

function useHookWithRefCallback() {
  const ref = useRef(null)
  const setRef = useCallback(node => {
    if (ref.current) {
      // Make sure to cleanup any events/references added to the last instance
    }
    
    if (node) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
    }
    
    // Save a reference to the node
    console.debug('useCallback')
    console.debug(node)
    ref.current = node
  }, [])
  return setRef
}

export default useHookWithRefCallback;