import { useAppStore } from 'app/store/storeHooks';
import { useAssertSingleton } from 'common/hooks/useAssertSingleton';
import { selectActiveTab } from 'features/ui/store/uiSelectors';
import {
  dockviewPanelStateChanged,
  gridviewPanelStateChanged,
  selectUiSlice,
  setActiveTab,
} from 'features/ui/store/uiSlice';
import type { DockviewPanelState, GridviewPanelState, TabName } from 'features/ui/store/uiTypes';
import { useCallback, useEffect } from 'react';

import { navigationApi } from './navigation-api';

/**
 * Hook that initializes the global navigation API with callbacks to access and modify the active tab
 * and manage panel state persistence.
 */
export const useNavigationApi = () => {
  useAssertSingleton('useNavigationApi');
  const store = useAppStore();

  const getAppTab = useCallback(() => {
    return selectActiveTab(store.getState());
  }, [store]);

  const setAppTab = useCallback(
    (tab: TabName) => {
      store.dispatch(setActiveTab(tab));
    },
    [store]
  );

  const getGridviewPanelState = useCallback(
    (id: string): GridviewPanelState | undefined => {
      const state = selectUiSlice(store.getState());
      return state.gridviewPanelStates[id];
    },
    [store]
  );

  const setGridviewPanelState = useCallback(
    (id: string, state: GridviewPanelState) => {
      store.dispatch(gridviewPanelStateChanged({ id, state }));
    },
    [store]
  );

  const getDockviewPanelState = useCallback(
    (id: string): DockviewPanelState | undefined => {
      const state = selectUiSlice(store.getState());
      return state.dockviewPanelStates[id];
    },
    [store]
  );

  const setDockviewPanelState = useCallback(
    (id: string, state: DockviewPanelState) => {
      store.dispatch(dockviewPanelStateChanged({ id, state }));
    },
    [store]
  );

  useEffect(() => {
    navigationApi.connectToApp({
      getAppTab,
      setAppTab,
      panelStateCallbacks: {
        getGridviewPanelState,
        setGridviewPanelState,
        getDockviewPanelState,
        setDockviewPanelState,
      },
    });
  }, [
    getAppTab,
    setAppTab,
    getGridviewPanelState,
    setGridviewPanelState,
    getDockviewPanelState,
    setDockviewPanelState,
  ]);
};
