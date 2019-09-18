import { connect } from 'react-redux'
import { WordEditorPortal, WordEditorPortalProps } from './WordEditor.portal'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { Dispatch } from 'redux'

type Dispatchers = 'onClose'

const mapStateToProps = (
  state: StoreState
): Omit<WordEditorPortalProps, Dispatchers> => ({
  show: state.isShowWordEditor,
  darkMode: state.config.darkMode,
  withAnimation: state.config.animation,
  colors: state.colors,
  width: window.innerWidth - state.config.panelWidth - 100,
  ctxTrans: state.config.ctxTrans,
  word: state.wordEditorWord
})

const mapDispatchToProps = (
  dispatch: Dispatch<StoreAction>
): Pick<WordEditorPortalProps, Dispatchers> => ({
  onClose: () => {
    dispatch({ type: 'WORD_EDITOR_STATUS', payload: null })
  }
})

export const WordEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WordEditorPortal)

export default WordEditorContainer
