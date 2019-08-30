import { connect } from 'react-redux'
import { MenuBar, MenuBarProps } from './MenuBar'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { Dispatch } from 'redux'
import { isStandalonePage } from '@/_helpers/saladict'
import { newWord } from '@/_helpers/record-manager'

type Dispatchers =
  | 'searchText'
  | 'updateText'
  | 'addToNoteBook'
  | 'updateHistoryIndex'
  | 'togglePin'
  | 'onClose'
  | 'onDragAreaMouseDown'
  | 'onDragAreaTouchStart'
  | 'onHeightChanged'

const mapStateToProps = (
  state: StoreState
): Omit<MenuBarProps, Dispatchers> => ({
  text: state.text,
  isInNotebook: state.isFav,
  shouldFocus: !state.isExpandMtaBox && (state.isQSPanel || isStandalonePage()),
  enableSuggest: state.config.searchSuggests,
  histories: state.searchHistory,
  historyIndex: state.historyIndex,
  profiles: state.profiles,
  activeProfileId: state.activeProfile.id,
  isPinned: state.isPinned
})

const mapDispatchToProps = (
  dispatch: Dispatch<StoreAction>
): Pick<MenuBarProps, Dispatchers> => ({
  searchText: text => {
    dispatch({
      type: 'SEARCH_START',
      payload: {
        word: newWord({
          text,
          title: 'Saladict',
          favicon: 'https://saladict.crimx.com/favicon.ico'
        })
      }
    })
  },
  updateText: text => {
    dispatch({ type: 'UPDATE_TEXT', payload: text })
  },
  addToNoteBook: () => {
    dispatch({ type: 'ADD_TO_NOTEBOOK' })
  },
  updateHistoryIndex: index => {
    dispatch({ type: 'UPDATE_HISTORY_INDEX', payload: index })
  },
  togglePin: () => {
    dispatch({ type: 'TOGGLE_PIN' })
  },
  onClose: () => {
    dispatch({ type: 'CLOSE_PANEL' })
  },
  onHeightChanged: (height: number) => {
    dispatch({
      type: 'PANEL_MIN_HEIGHT',
      payload: Math.floor(height)
    })
  },
  onDragAreaMouseDown: () => {},
  onDragAreaTouchStart: () => {}
})

export const MenuBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MenuBar)

export default MenuBarContainer
