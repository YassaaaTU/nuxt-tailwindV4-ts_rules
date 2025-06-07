# Nuxt.js Development Instructions & Best Practices

This document provides comprehensive guidelines for developing robust, intuitive, and clean Nuxt.js applications. These instructions emphasize Nuxt's dynamic nature and component-agnostic architecture to create maintainable and scalable applications.

## Core Philosophy

Nuxt.js excels at being **dynamic** and **component-agnostic**, allowing developers to:
- Build applications that adapt to different contexts and environments
- Create reusable components that work across different frameworks
- Leverage server-side rendering, static generation, and client-side rendering seamlessly
- Maintain clean separation of concerns between UI, logic, and data

## Project Structure & Organization

### Directory Conventions

```
your-nuxt-app/
├── assets/           # Uncompiled assets (SCSS, images, fonts)
├── components/       # Vue components (auto-imported)
├── composables/      # Vue composables (auto-imported)
├── content/          # Nuxt Content files (optional)
├── layouts/          # Application layouts
├── middleware/       # Route middleware
├── pages/            # File-based routing
├── plugins/          # Vue.js plugins
├── public/           # Static assets
├── server/           # Server-side API routes
├── stores/           # State management (Pinia)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions (auto-imported)
```

## Package Management & Development Commands

### Package Manager Preference

**Always use Bun instead of npm** for this Nuxt.js project:

- **Installation**: `bun install` (not `npm install`)
- **Development server**: `bun dev` (not `npm run dev`)
- **Build**: `bun run build` (not `npm run build`)
- **Package addition**: `bun add <package>` (not `npm install <package>`)
- **Dev dependencies**: `bun add -d <package>` (not `npm install -D <package>`)

### Common Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Add a package
bun add vue-awesome-component

# Add a dev dependency
bun add -d @types/node
```

### File Naming Conventions

- **Components**: Use PascalCase (`UserProfile.vue`, `GameBoard.vue`)
- **Pages**: Use kebab-case (`user-profile.vue`, `game-board.vue`)
- **Composables**: Use camelCase with `use` prefix (`useAuth.ts`, `useGameState.ts`)
- **Types**: Use PascalCase (`User.ts`, `GameConfig.ts`)
- **Utilities**: Use camelCase (`formatDate.ts`, `validateInput.ts`)

## Component Architecture

### Component-Agnostic Design Principles

```vue
<!-- ✅ Good: Generic, reusable component -->
<script setup lang="ts" generic="T">
interface Props<T> {
  items: T[]
  keyExtractor: (item: T) => string | number
  renderItem: (item: T) => VNode | string
  emptyState?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props<T>>(), {
  emptyState: 'No items found',
  loading: false
})

const emit = defineEmits<{
  select: [item: T]
  loadMore: []
}>()
</script>

<template>
  <div class="dynamic-list">
    <div v-if="loading" class="loading-state">
      <slot name="loading">Loading...</slot>
    </div>

    <div v-else-if="items.length === 0" class="empty-state">
      <slot name="empty">{{ emptyState }}</slot>
    </div>

    <div v-else class="items-container">
      <div
        v-for="item in items"
        :key="keyExtractor(item)"
        class="item"
        @click="emit('select', item)"
      >
        <slot name="item" :item="item">
          {{ renderItem(item) }}
        </slot>
      </div>
    </div>

    <slot name="footer" />
  </div>
</template>
```

### Dynamic Component Loading

```vue
<script setup lang="ts">
// Dynamic component loading based on conditions
const componentName = computed(() => {
  if (gameState.value.phase === 'lobby') return 'GameLobby'
  if (gameState.value.phase === 'playing') return 'GameBoard'
  if (gameState.value.phase === 'results') return 'GameResults'
  return 'WelcomeScreen'
})

// Dynamic props based on context
const componentProps = computed(() => {
  const baseProps = { gameId: gameState.value.id }

  switch (gameState.value.phase) {
    case 'lobby':
      return { ...baseProps, players: gameState.value.players }
    case 'playing':
      return { ...baseProps, currentRound: gameState.value.currentRound }
    case 'results':
      return { ...baseProps, scores: gameState.value.scores }
    default:
      return baseProps
  }
})
</script>

<template>
  <component
    :is="componentName"
    v-bind="componentProps"
    @phase-change="handlePhaseChange"
  />
</template>
```

## Composables: The Heart of Nuxt's Flexibility

### State Management Composables

```typescript
// composables/useGameState.ts
export const useGameState = () => {
  // Global reactive state
  const gameState = useState<GameState>('game.state', () => ({
    id: null,
    phase: 'welcome',
    players: [],
    currentRound: 0,
    scores: {},
    settings: getDefaultSettings()
  }))

  // Computed values
  const isGameActive = computed(() =>
    gameState.value.phase === 'playing'
  )

  const canStartGame = computed(() =>
    gameState.value.players.length >= 2 &&
    gameState.value.players.every(p => p.isReady)
  )

  // Actions
  const initializeGame = async (config: GameConfig) => {
    try {
      const { data } = await $fetch<GameState>('/api/games', {
        method: 'POST',
        body: config
      })

      gameState.value = data
      await navigateTo(`/game/${data.id}`)
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to initialize game'
      })
    }
  }

  const updatePlayerStatus = (playerId: string, status: PlayerStatus) => {
    const player = gameState.value.players.find(p => p.id === playerId)
    if (player) {
      player.status = status
    }
  }

  // Reactive cleanup
  const cleanup = () => {
    gameState.value = getInitialState()
  }

  return {
    // State (readonly)
    gameState: readonly(gameState),

    // Computed
    isGameActive,
    canStartGame,

    // Actions
    initializeGame,
    updatePlayerStatus,
    cleanup
  }
}
```

### Data Fetching Composables

```typescript
// composables/useAsyncData.ts
export const useAsyncData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    default?: () => T | null
    server?: boolean
    client?: boolean
    transform?: (data: T) => T
    refresh?: boolean
  } = {}
) => {
  const {
    default: defaultValue = () => null,
    server = true,
    client = true,
    transform = (data: T) => data,
    refresh = false
  } = options

  const data = ref<T | null>(defaultValue())
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    if (process.server && !server) return
    if (process.client && !client) return

    pending.value = true
    error.value = null

    try {
      const result = await fetcher()
      data.value = transform(result)
    } catch (e) {
      error.value = e as Error
    } finally {
      pending.value = false
    }
  }

  const refresh = async () => {
    await execute()
  }

  // Execute on mount
  onMounted(() => {
    if (process.client && client) {
      execute()
    }
  })

  return {
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
    execute
  }
}
```

## Dynamic Routing & Middleware

### Flexible Route Handling

```typescript
// middleware/game.ts
export default defineNuxtRouteMiddleware((to) => {
  const { gameState } = useGameState()
  const gameId = to.params.id as string

  // Dynamic validation based on route context
  if (!gameId || !isValidGameId(gameId)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Game not found'
    })
  }

  // Context-aware redirects
  if (gameState.value.id !== gameId) {
    // Attempt to restore game state
    return navigateTo(`/game/${gameId}/restore`)
  }

  // Phase-based access control
  const allowedPhases = getPhasesByRoute(to.name)
  if (!allowedPhases.includes(gameState.value.phase)) {
    return navigateTo(`/game/${gameId}/${gameState.value.phase}`)
  }
})
```

### Dynamic Page Components

```vue
<!-- pages/game/[id]/[phase].vue -->
<script setup lang="ts">
// Dynamic imports based on phase
const phaseComponents = {
  lobby: () => import('~/components/game/LobbyPhase.vue'),
  setup: () => import('~/components/game/SetupPhase.vue'),
  playing: () => import('~/components/game/PlayingPhase.vue'),
  results: () => import('~/components/game/ResultsPhase.vue')
}

const route = useRoute()
const { gameState, validateGameAccess } = useGameState()

// Validate access
await validateGameAccess(route.params.id as string)

// Dynamic component loading
const currentPhase = computed(() => route.params.phase as string)
const PhaseComponent = computed(() =>
  phaseComponents[currentPhase.value] || phaseComponents.lobby
)

// SEO optimization
useHead({
  title: `${gameState.value.name} - ${currentPhase.value}`,
  meta: [
    {
      name: 'description',
      content: `${currentPhase.value} phase of ${gameState.value.name}`
    }
  ]
})
</script>

<template>
  <div class="game-container">
    <GameHeader
      :game-state="gameState"
      :current-phase="currentPhase"
    />

    <Suspense>
      <component
        :is="PhaseComponent"
        :game-state="gameState"
        @phase-complete="handlePhaseComplete"
      />

      <template #fallback>
        <div class="loading-phase">
          Loading {{ currentPhase }}...
        </div>
      </template>
    </Suspense>

    <GameFooter />
  </div>
</template>
```

## Server-Side Architecture

### API Route Design

```typescript
// server/api/games/[id]/state.patch.ts
export default defineEventHandler(async (event) => {
  const gameId = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Validation
  const validatedData = await validateGameStateUpdate(body)

  // Business logic
  const updatedGame = await updateGameState(gameId, validatedData)

  // Real-time updates
  await broadcastGameUpdate(gameId, updatedGame)

  return {
    success: true,
    data: updatedGame,
    timestamp: new Date().toISOString()
  }
})
```

### WebSocket Integration

```typescript
// plugins/websocket.client.ts
export default defineNuxtPlugin(() => {
  const { gameState } = useGameState()
  const socket = ref<WebSocket | null>(null)

  const connect = (gameId: string) => {
    const wsUrl = useRuntimeConfig().public.websocketUrl
    socket.value = new WebSocket(`${wsUrl}/game/${gameId}`)

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleGameUpdate(data)
    }

    socket.value.onclose = () => {
      // Reconnection logic
      setTimeout(() => connect(gameId), 3000)
    }
  }

  const handleGameUpdate = (update: GameUpdate) => {
    // Update local state
    if (update.type === 'state_change') {
      Object.assign(gameState.value, update.data)
    }

    // Trigger reactive updates
    nextTick(() => {
      // Handle side effects
    })
  }

  return {
    provide: {
      websocket: {
        connect,
        disconnect: () => socket.value?.close(),
        send: (data: any) => socket.value?.send(JSON.stringify(data))
      }
    }
  }
})
```

## Performance & Optimization

### Lazy Loading Strategies

```vue
<script setup lang="ts">
// Conditional component loading
const HeavyComponent = defineAsyncComponent({
  loader: () => import('~/components/HeavyComponent.vue'),
  loadingComponent: () => h('div', 'Loading...'),
  errorComponent: () => h('div', 'Error loading component'),
  delay: 200,
  timeout: 3000
})

// Lazy data loading
const { data: expensiveData, pending } = await useLazyFetch(
  '/api/expensive-operation',
  {
    key: 'expensive-data',
    default: () => [],
    server: false // Client-side only
  }
)
</script>
```

### Caching Strategies

```typescript
// composables/useCache.ts
export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000 // 5 minutes
) => {
  const cache = useState<Map<string, CacheEntry<T>>>('cache', () => new Map())

  const get = async (): Promise<T> => {
    const cached = cache.value.get(key)

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    const data = await fetcher()
    cache.value.set(key, {
      data,
      timestamp: Date.now()
    })

    return data
  }

  const invalidate = () => {
    cache.value.delete(key)
  }

  const clear = () => {
    cache.value.clear()
  }

  return { get, invalidate, clear }
}
```

## Error Handling & Resilience

### Robust Error Boundaries

```vue
<!-- components/ErrorBoundary.vue -->
<script setup lang="ts">
interface Props {
  fallback?: Component
  onError?: (error: Error, instance: ComponentInternalInstance) => void
}

const props = withDefaults(defineProps<Props>(), {
  fallback: () => h('div', 'Something went wrong')
})

const error = ref<Error | null>(null)
const hasError = computed(() => error.value !== null)

const resetError = () => {
  error.value = null
}

onErrorCaptured((err, instance) => {
  error.value = err
  props.onError?.(err, instance)
  return false // Prevent propagation
})

provide('resetError', resetError)
</script>

<template>
  <div>
    <component
      v-if="hasError"
      :is="fallback"
      :error="error"
      :reset="resetError"
    />
    <slot v-else />
  </div>
</template>
```

### Network Resilience

```typescript
// composables/useNetworkResilience.ts
export const useNetworkResilience = () => {
  const isOnline = ref(navigator.onLine)
  const retryQueue = ref<Array<() => Promise<any>>>([])

  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoff: number = 1000
  ): Promise<T> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) throw error
        await new Promise(resolve => setTimeout(resolve, backoff * (attempt + 1)))
      }
    }
    throw new Error('Max retries exceeded')
  }

  const queueOperation = (operation: () => Promise<any>) => {
    if (isOnline.value) {
      return operation()
    } else {
      retryQueue.value.push(operation)
    }
  }

  // Handle online/offline events
  const handleOnline = async () => {
    isOnline.value = true

    // Process retry queue
    const operations = [...retryQueue.value]
    retryQueue.value = []

    for (const operation of operations) {
      try {
        await operation()
      } catch (error) {
        console.error('Failed to execute queued operation:', error)
      }
    }
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline: readonly(isOnline),
    executeWithRetry,
    queueOperation
  }
}
```

## Testing Strategies

### Component Testing

```typescript
// tests/components/GameBoard.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import GameBoard from '~/components/GameBoard.vue'

describe('GameBoard', () => {
  it('adapts to different game phases', async () => {
    const wrapper = mount(GameBoard, {
      props: {
        gameState: {
          phase: 'playing',
          players: mockPlayers,
          currentRound: 1
        }
      }
    })

    expect(wrapper.find('[data-testid="playing-phase"]').exists()).toBe(true)

    await wrapper.setProps({
      gameState: { ...wrapper.props().gameState, phase: 'results' }
    })

    expect(wrapper.find('[data-testid="results-phase"]').exists()).toBe(true)
  })

  it('handles dynamic prop changes gracefully', async () => {
    const wrapper = mount(GameBoard, {
      props: { gameState: mockGameState }
    })

    const updateSpy = vi.fn()
    wrapper.vm.$on('state-update', updateSpy)

    await wrapper.setProps({
      gameState: { ...mockGameState, currentRound: 2 }
    })

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ currentRound: 2 })
    )
  })
})
```

## Deployment & Production

### Environment Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private keys (server-side only)
    secretKey: process.env.SECRET_KEY,
    databaseUrl: process.env.DATABASE_URL,

    // Public keys (exposed to client)
    public: {
      apiBase: process.env.API_BASE_URL || '/api',
      websocketUrl: process.env.WS_URL || 'ws://localhost:3001',
      environment: process.env.NODE_ENV || 'development'
    }
  },

  // Dynamic imports optimization
  experimental: {
    payloadExtraction: false // Better for dynamic apps
  },

  // Build optimizations
  build: {
    splitChunks: {
      layouts: true,
      pages: true,
      commons: true
    }
  }
})
```

## Summary: Embracing Nuxt's Dynamic Nature

1. **Component Agnostic**: Design components that work across different contexts and frameworks
2. **Dynamic Loading**: Use conditional imports and lazy loading for optimal performance
3. **Flexible State**: Leverage composables for shared, reactive state management
4. **Adaptive Routing**: Implement dynamic routes that respond to application context
5. **Resilient Architecture**: Build error boundaries and network resilience into your app
6. **Performance First**: Optimize for different rendering modes and deployment targets

By following these guidelines, you'll create Nuxt.js applications that are not only robust and maintainable but also fully leverage Nuxt's dynamic and component-agnostic strengths.
