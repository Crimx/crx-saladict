import { combineEpics } from 'redux-observable'
import { from, of } from 'rxjs'
import { map, mapTo, mergeMap, filter } from 'rxjs/operators'

import { isStandalonePage } from '@/_helpers/saladict'
import { saveWord } from '@/_helpers/record-manager'

import { StoreAction, StoreState } from '../'
import { ofType } from '../../utils/operators'

import searchStartEpic from './searchStart.epic'
import newSelectionEpic from './newSelection.epic'
import { translateCtx } from '@/_helpers/translateCtx'

export const epics = combineEpics<StoreAction, StoreAction, StoreState>(
  /** Start searching text. This will also send to Redux. */
  (action$, state$) =>
    action$.pipe(
      ofType('BOWL_ACTIVATED'),
      map(
        () =>
          state$.value.selection.word
            ? {
                type: 'SEARCH_START',
                payload: { word: state$.value.selection.word }
              }
            : { type: 'SEARCH_START' } // this should never be reached
      )
    ),
  (action$, state$) =>
    action$.pipe(
      ofType('ADD_TO_NOTEBOOK'),
      mergeMap(() => {
        if (state$.value.config.editOnFav && !isStandalonePage()) {
          return of({
            type: 'WORD_EDITOR_STATUS',
            payload:
              state$.value.searchHistory[state$.value.searchHistory.length - 1]
          } as const)
        }

        return from(
          (async () => {
            const word =
              state$.value.searchHistory[state$.value.searchHistory.length - 1]
            if (word) {
              try {
                const trans = await translateCtx(
                  word.context || word.text,
                  state$.value.config.ctxTrans
                )
                word.trans = word.trans ? word.trans + '\n\n' + trans : trans
                await saveWord('notebook', word)
                return true
              } catch (e) {
                console.warn(e)
                return false
              }
            }
            return false
          })()
        ).pipe(
          // dim icon if failed
          filter(isSuccess => !isSuccess),
          mapTo({ type: 'WORD_IN_NOTEBOOK', payload: false } as const)
        )
      })
    ),
  newSelectionEpic,
  searchStartEpic
)

export default epics
