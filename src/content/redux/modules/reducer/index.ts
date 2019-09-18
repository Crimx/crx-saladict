import {
  isStandalonePage,
  isPopupPage,
  isQuickSearchPage
} from '@/_helpers/saladict'
import { createReducer } from '../../utils/createReducer'
import { initState } from '../state'
import { ActionCatalog } from '../action-catalog'
import { searchStart } from './search-start.handler'
import { newSelection } from './new-selection.handler'
import { openQSPanel } from './open-qs-panel.handler'

export const createRootReducer = () =>
  createReducer<ReturnType<typeof initState>, ActionCatalog>(initState(), {
    NEW_CONFIG: (state, { payload }) => {
      const url = window.location.href
      const panelMaxHeight =
        (window.innerHeight * payload.panelMaxHeightRatio) / 100
      const colors =
        payload.darkMode === state.config.darkMode
          ? state.colors
          : payload.darkMode
          ? {
              brand: '#218c74',
              background: '#222',
              backgroundRGB: '34, 34, 34',
              font: '#ddd',
              divider: '#4d4748'
            }
          : {
              brand: '#5caf9e',
              background: '#fff',
              backgroundRGB: '255, 255, 255',
              font: '#333',
              divider: '#ddd'
            }

      return {
        ...state,
        config: payload,
        panelHeight: Math.min(state.panelHeight, panelMaxHeight),
        panelMaxHeight,
        isTempDisabled:
          payload.blacklist.some(([r]) => new RegExp(r).test(url)) &&
          payload.whitelist.every(([r]) => !new RegExp(r).test(url)),
        colors
      }
    },

    NEW_PROFILES: (state, { payload }) => ({
      ...state,
      profiles: payload
    }),

    NEW_ACTIVE_PROFILE: (state, { payload }) => ({
      ...state,
      activeProfile: payload,
      isExpandMtaBox:
        payload.mtaAutoUnfold === 'once' ||
        payload.mtaAutoUnfold === 'always' ||
        (payload.mtaAutoUnfold === 'popup' && isPopupPage()),
      renderedDicts: state.renderedDicts.filter(({ id }) =>
        payload.dicts.selected.includes(id)
      )
    }),

    NEW_SELECTION: newSelection,

    TEMP_DISABLED_STATE: (state, { payload }) =>
      payload
        ? {
            ...state,
            isTempDisabled: true,
            isPinned: false,
            // keep showing if it's standalone page
            isShowDictPanel: isStandalonePage(),
            isShowBowl: false,
            // also reset quick search panel state
            isQSPanel: isQuickSearchPage()
          }
        : {
            ...state,
            isTempDisabled: false
          },

    BOWL_ACTIVATED: state => ({
      ...state,
      isShowBowl: false,
      isShowDictPanel: true
    }),

    UPDATE_TEXT: (state, { payload }) => ({
      ...state,
      text: payload
    }),

    TOGGLE_MTA_BOX: state => ({
      ...state,
      isExpandMtaBox: !state.isExpandMtaBox
    }),

    TOGGLE_PIN: state => ({
      ...state,
      isPinned: !state.isPinned
    }),

    TOGGLE_WAVEFORM_BOX: state => ({
      ...state,
      isExpandWaveformBox: !state.isExpandWaveformBox
    }),

    CLOSE_PANEL: state =>
      isStandalonePage()
        ? state
        : {
            ...state,
            isPinned: false,
            isShowBowl: false,
            isShowDictPanel: false,
            isQSPanel: isQuickSearchPage()
          },

    UPDATE_HISTORY_INDEX: (state, { payload }) => ({
      ...state,
      historyIndex: payload
    }),

    WORD_IN_NOTEBOOK: (state, { payload }) => ({
      ...state,
      isFav: payload
    }),

    ADD_TO_NOTEBOOK: state =>
      state.config.editOnFav && !isStandalonePage()
        ? state
        : {
            ...state,
            // epic will set this back to false if transation failed
            isFav: true
          },

    SEARCH_START: searchStart,

    SEARCH_END: (state, { payload }) => {
      if (state.renderedDicts.every(({ id }) => id !== payload.id)) {
        // this dict is for auto-pronunciation only
        return state
      }

      return {
        ...state,
        renderedDicts: state.renderedDicts.map(d =>
          d.id === payload.id
            ? {
                id: d.id,
                searchStatus: 'FINISH',
                searchResult: payload.result
              }
            : d
        )
      }
    },

    UPDATE_PANEL_HEIGHT: (state, { payload }) => {
      const { _panelHeightCache } = state
      const sum =
        _panelHeightCache.sum - _panelHeightCache[payload.area] + payload.height
      const floatHeight =
        payload.floatHeight == null
          ? _panelHeightCache.floatHeight
          : payload.floatHeight

      return {
        ...state,
        panelHeight: Math.min(Math.max(sum, floatHeight), state.panelMaxHeight),
        _panelHeightCache: {
          ..._panelHeightCache,
          [payload.area]: payload.height,
          sum,
          floatHeight
        }
      }
    },

    DRAG_START_COORD: (state, { payload }) => ({
      ...state,
      dragStartCoord: payload
    }),

    SUMMONED_PANEL_INIT: (state, { payload }) => ({
      ...state,
      text: payload,
      historyIndex: 0,
      isShowDictPanel: true,
      isShowBowl: false
    }),

    QS_PANEL_CHANGED: (state, { payload }) => {
      if (state.withQSPanel === payload) {
        return state
      }

      // hide panel on otehr pages and leave just quick search panel
      return payload
        ? {
            ...state,
            withQSPanel: payload,
            isPinned: false,
            // no hiding if it's browser action page
            isShowDictPanel: isPopupPage(),
            isShowBowl: false,
            isQSPanel: false
          }
        : {
            ...state,
            withQSPanel: payload,
            isQSPanel: isQuickSearchPage()
          }
    },

    OPEN_QS_PANEL: openQSPanel,

    WORD_EDITOR_STATUS: (state, { payload }) =>
      payload
        ? {
            ...state,
            isShowWordEditor: true,
            wordEditorWord: payload,
            dictPanelCoord: {
              x: 50,
              y: window.innerHeight * 0.2
            }
          }
        : {
            ...state,
            isShowWordEditor: false
          },

    PLAY_AUDIO: (state, { payload }) => ({
      ...state,
      lastPlayAudio: payload
    })
  })

export default createRootReducer
