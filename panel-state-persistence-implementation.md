# Panel State Persistence Implementation

## Overview

This implementation adds panel state persistence functionality to InvokeAI's frontend, allowing each tab's panel states (settings, active focus/panel, dimensions, etc.) to be saved and restored when users navigate back to the application.

## Architecture

The implementation follows the existing UI slice pattern and integrates seamlessly with the current navigation system using a combination of Redux state management and the NavigationApi.

### Key Components

1. **UI Types & State** (`uiTypes.ts`, `uiSlice.ts`)
2. **Navigation API** (`navigation-api.ts`)
3. **Navigation Hook** (`use-navigation-api.tsx`)
4. **Debounce Utility** (`debounce.ts`)

## Implementation Details

### 1. UI State Schema Updates

**File**: `invokeai/frontend/web/src/features/ui/store/uiTypes.ts`

Added new panel state types:
- `GridviewPanelState`: Stores `width` and `height` for Gridview panels
- `DockviewPanelState`: Stores `isActive` flag for Dockview panels

Updated UI state schema:
- Added `gridviewPanelStates: Record<string, GridviewPanelState>`
- Added `dockviewPanelStates: Record<string, DockviewPanelState>`
- Incremented version to 4 for migration

### 2. Redux Actions

**File**: `invokeai/frontend/web/src/features/ui/store/uiSlice.ts`

Added new actions:
- `gridviewPanelStateChanged`: Updates Gridview panel state
- `dockviewPanelStateChanged`: Updates Dockview panel state

Added migration logic for version 3 → 4:
- Initializes empty panel state records

### 3. NavigationApi Enhancements

**File**: `invokeai/frontend/web/src/features/ui/layouts/navigation-api.ts`

Enhanced the NavigationApi class with:

#### New Types
- `PanelStateCallbacks`: Interface for Redux integration callbacks

#### New Properties
- `panelDisposables`: Map for tracking panel event listeners
- `panelStateCallbacks`: Optional callbacks for state management

#### Enhanced Methods
- **`connectToApp`**: Now accepts optional `panelStateCallbacks` parameter
- **`registerPanel`**: Automatically sets up state persistence for panels
- **`_setupPanelStatePersistence`**: Private method handling:
  - State rehydration when panels are registered
  - Debounced event listeners for state changes
  - Cleanup management

#### Panel-Specific Behavior

**Gridview Panels:**
- Listens to `onDidDimensionsChange` events
- Persists `width` and `height` values
- Restores dimensions on rehydration

**Dockview Panels:**
- Listens to `onDidActiveChange` events  
- Persists `isActive` flag
- Restores active state on rehydration

### 4. Debounced State Persistence

**File**: `invokeai/frontend/web/src/common/util/debounce.ts`

Created a TypeScript-friendly debounce utility:
- Delays state persistence by 1 second
- Prevents excessive Redux dispatches during rapid UI changes
- Proper TypeScript generic constraints

### 5. Redux Integration Hook

**File**: `invokeai/frontend/web/src/features/ui/layouts/use-navigation-api.tsx`

Enhanced the existing navigation hook with panel state callbacks:
- `getGridviewPanelState` / `setGridviewPanelState`
- `getDockviewPanelState` / `setDockviewPanelState`
- Proper Redux store integration using `store.getState()` and `store.dispatch()`

### 6. Application Integration

**File**: `invokeai/frontend/web/src/features/ui/components/AppContent.tsx`

Added `useNavigationApi()` hook call to initialize the NavigationApi connection when the application starts.

## Panel State Structure

### Gridview Panel State
```typescript
{
  width?: number;
  height?: number;
}
```

### Dockview Panel State  
```typescript
{
  isActive: boolean;
}
```

### Storage Key Format
Panel states are keyed by: `${tab}:${panelId}`

Examples:
- `generate:left_panel`
- `generate:gallery_panel`
- `canvas:viewer_panel`

## Persistence Behavior

### State Saving
- **Trigger**: Panel dimension/active changes
- **Debounce**: 1 second delay
- **Storage**: Redux store (persisted via existing persistence layer)

### State Restoration
- **Trigger**: Panel registration
- **Timing**: Immediately when panel is added to NavigationApi
- **Fallback**: No restoration if no saved state exists

## Migration & Backwards Compatibility

- Incremented UI state version from 3 to 4
- Added migration logic to initialize empty panel state objects
- Backwards compatible with existing UI state

## Integration Points

The implementation integrates with:
1. **Existing UI persistence**: Uses the same persistence layer as accordions/expanders
2. **Navigation system**: Leverages existing NavigationApi and tab management
3. **Panel lifecycle**: Hooks into existing panel registration/cleanup
4. **Event system**: Uses Dockview/Gridview native event APIs

## Benefits

1. **Seamless UX**: Panel states persist across app sessions
2. **Performance**: Debounced updates prevent excessive state writes
3. **Scalable**: Easily extensible to new panel types
4. **Type Safe**: Full TypeScript support with proper type constraints
5. **Memory Efficient**: Automatic cleanup of event listeners

## Future Enhancements

The architecture supports easy extension for:
- Additional panel state properties
- Custom debounce intervals per panel type
- Panel-specific persistence policies
- Cross-tab state synchronization