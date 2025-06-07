# Coding Standards & ESLint Configuration Instructions for Nuxt.js

This document outlines the coding standards and best practices enforced by our ESLint configuration for Nuxt.js development. Follow these guidelines when writing or reviewing code in your Nuxt application.

## General JavaScript/TypeScript Rules

### Code Style & Formatting
- **Always use curly braces** for multi-line statements and be consistent (`curly`)
- **Use strict equality** (`===` and `!==`) instead of loose equality, except when comparing with `null` (`eqeqeq`)
- **Prefer arrow functions** over regular function expressions (`prefer-arrow-callback`)
- **Use object shorthand** syntax when possible (`object-shorthand`)
- **No console statements** in production code (`no-console`)
- **Use const/let** instead of var

### Type Safety (TypeScript)
- **Use strict boolean expressions** - no truthy/falsy checks on strings or numbers (`@typescript-eslint/strict-boolean-expressions`)
- **No unnecessary conditions** - avoid redundant boolean checks (`@typescript-eslint/no-unnecessary-condition`)
- **No unnecessary boolean literal comparisons** (e.g., `if (condition === true)`) (`@typescript-eslint/no-unnecessary-boolean-literal-compare`)
- **Use array-simple type syntax** - prefer `string[]` over `Array<string>` for simple types (`@typescript-eslint/array-type`)
- **No non-null assertions** (`!`) - handle null/undefined explicitly (`@typescript-eslint/no-non-null-assertion`)
- **No unused variables** - prefix with underscore if intentionally unused (`@typescript-eslint/no-unused-vars`)
- **Allow short-circuit expressions** - can use `&&` and `||` for side effects (`@typescript-eslint/no-unused-expressions`)

### Import/Export Rules
- **Sort imports automatically** using simple-import-sort (`simple-import-sort/imports`, `simple-import-sort/exports`)
- **Use type-only imports** when importing only types (`@typescript-eslint/consistent-type-imports`)
- **Prefer inline type imports** (`import { type User, getData }`)
- **No import type side effects** (`@typescript-eslint/no-import-type-side-effects`)
- **Group imports** with newlines between groups (`import/newline-after-import`)
- **No duplicate imports** - prefer inline when possible (`import/no-duplicates`)
- **No empty named import blocks** (`import/no-empty-named-blocks`)
- **Imports must be first** (`import/first`)

## Vue.js & Nuxt.js Specific Rules

### Vue Component Structure
- **Use `<script setup>` syntax** for composition API components (`vue/component-api-style`)
- **Single File Component structure order**: `<script>`, `<template>`, `<style>` (`vue/component-tags-order`)
- **Self-closing components** when no content (`vue/html-self-closing`)
- **Use kebab-case** for component names in templates (`vue/component-name-in-template-casing`)
- **Prefer PascalCase** for component file names
- **Use boolean prop naming** for boolean props (e.g., `isLoading`, `hasError`)
- **Consistent prop naming** - use camelCase in script, kebab-case in template

### Vue Template Guidelines
- **Consistent attribute order** (`vue/attributes-order`):
  1. Definition props (is, v-is)
  2. List rendering (v-for)
  3. Conditionals (v-if, v-else-if, v-else, v-show, v-cloak)
  4. Render modifiers (v-pre, v-once)
  5. Global awareness (id)
  6. Unique attributes (ref, key, slot)
  7. Two-way binding (v-model)
  8. Other attributes
  9. Events (v-on)
  10. Content (v-html, v-text)
- **Use v-for with key** - always provide unique keys for list items (`vue/require-v-for-key`)
- **Avoid v-if with v-for** - use computed properties or template wrapper (`vue/no-use-v-if-with-v-for`)
- **Multi-word component names** to avoid conflicts with HTML elements (`vue/multi-word-component-names`)

### Nuxt.js Best Practices
- **Use Nuxt auto-imports** - avoid manual imports for composables, utilities, and components
- **Leverage Nuxt directory structure**:
  - `components/` - Auto-imported components
  - `composables/` - Auto-imported composables
  - `pages/` - File-based routing
  - `layouts/` - Application layouts
  - `middleware/` - Route middleware
  - `plugins/` - Vue.js plugins
  - `stores/` - Pinia stores (auto-imported)
- **Use Nuxt composables**:
  - `useState()` for reactive state
  - `useFetch()` for data fetching
  - `useHead()` for SEO meta tags
  - `useRoute()` and `useRouter()` for navigation
  - `useCookie()` for cookie management
- **Server-side considerations** - be mindful of client/server context

### Tailwind CSS Rules
- **Enforce shorthand classes** (e.g., `p-4` instead of `px-4 py-4`) (`tailwindcss/enforces-shorthand`)
- **Order classes consistently** using our custom order (`tailwindcss/classnames-order`)
- **Use conditional classes** with computed properties or ternary operators in templates

### Pinia Store Rules (if using Pinia)
- **Use composition API stores** with `defineStore()`
- **Keep store actions pure** - avoid side effects in getters
- **Use proper TypeScript types** for state, getters, and actions

## File Organization

### Ignore Patterns
- **Ignore build folders** - no linting of `.nuxt/`, `dist/`, `.output/` folders
- **Ignore generated files** - auto-generated types and Nuxt artifacts
- **Disable type checking** for plain JavaScript files (`.js`, `.mjs`, `.cjs`)

## Code Examples

### ✅ Good Examples

```vue
<!-- Good Vue SFC structure -->
<script setup lang="ts">
// Type imports
import type { User } from '~/types'

// Nuxt auto-imports - no need to import these
const route = useRoute()
const { data: user } = await useFetch<User>('/api/user')

// Reactive state
const isLoading = ref(false)
const username = ref('')

// Computed properties
const isValidUsername = computed(() => username.value.length > 0)

// Methods
const handleSubmit = async () => {
  if (!isValidUsername.value) return

  isLoading.value = true
  try {
    await $fetch('/api/submit', {
      method: 'POST',
      body: { username: username.value }
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container p-4 mx-auto">
    <form @submit.prevent="handleSubmit">
      <input
        v-model="username"
        type="text"
        :disabled="isLoading"
        class="w-full p-2 border rounded"
        placeholder="Enter username"
      >
      <button
        :disabled="!isValidUsername || isLoading"
        type="submit"
        class="px-4 py-2 mt-2 text-white bg-blue-500 rounded disabled:opacity-50"
      >
        {{ isLoading ? 'Submitting...' : 'Submit' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
/* Component-specific styles */
.container {
  max-width: 600px;
}
</style>
```

```typescript
// Good composable (~/composables/useAuth.ts)
export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)

  const login = async (credentials: LoginCredentials) => {
    const { data } = await $fetch<{ user: User }>('/api/login', {
      method: 'POST',
      body: credentials
    })
    user.value = data.user
  }

  const logout = async () => {
    await $fetch('/api/logout', { method: 'POST' })
    user.value = null
  }

  const isAuthenticated = computed(() => user.value !== null)

  return {
    user: readonly(user),
    login,
    logout,
    isAuthenticated
  }
}
```

```typescript
// Good Pinia store (~/stores/game.ts)
export const useGameStore = defineStore('game', () => {
  const players = ref<Player[]>([])
  const currentRound = ref(1)
  const isGameActive = ref(false)

  const playerCount = computed(() => players.value.length)
  const canStartGame = computed(() => playerCount.value >= 2)

  const addPlayer = (player: Player) => {
    players.value.push(player)
  }

  const startGame = () => {
    if (!canStartGame.value) return
    isGameActive.value = true
  }

  const resetGame = () => {
    players.value = []
    currentRound.value = 1
    isGameActive.value = false
  }

  return {
    // State
    players: readonly(players),
    currentRound: readonly(currentRound),
    isGameActive: readonly(isGameActive),

    // Getters
    playerCount,
    canStartGame,

    // Actions
    addPlayer,
    startGame,
    resetGame
  }
})
```

### ❌ Bad Examples

```vue
<!-- Don't manually import auto-imported composables -->
<script setup>
import { ref } from 'vue' // ❌ Auto-imported
import { useRoute } from 'vue-router' // ❌ Use Nuxt's useRoute()

// Don't use loose equality
const isValid = (value == null) // ❌ Use === null

// Don't use unnecessary boolean comparisons
if (isActive === true) { } // ❌ Use if (isActive)

// Don't use non-null assertions
const user = getUser()! // ❌ Handle null/undefined explicitly

// Don't use console in production
console.log('Debug info') // ❌ Use proper logging

// Don't use var
var count = 0 // ❌ Use const/let

// Don't mix v-if with v-for on same element
// ❌ Bad
<li v-for="user in users" v-if="user.isActive" :key="user.id">
  {{ user.name }}
</li>

// Don't forget keys in v-for
// ❌ Bad
<li v-for="item in items">{{ item.name }}</li>

// Don't use incorrect casing
// ❌ Bad component name
<my-component />  <!-- Should be MyComponent or kebab-case consistently -->
</script>

<template>
  <!-- Don't use wrong attribute order -->
  <!-- ❌ Bad order -->
  <button @click="submit" :disabled="loading" v-if="showButton">
    Submit
  </button>

  <!-- ✅ Good order -->
  <button v-if="showButton" :disabled="loading" @click="submit">
    Submit
  </button>
</template>
```

```typescript
// Don't access stores incorrectly
const gameStore = useGameStore()
gameStore.players.push(newPlayer) // ❌ Mutating readonly state

// Don't create reactive variables incorrectly
const count = ref(0).value // ❌ Don't access .value during initialization

// Don't use reactive() for simple values
const message = reactive('hello') // ❌ Use ref() for primitives

// Don't check truthy/falsy on strings or numbers inappropriately
if (username) { } // ❌ Use username.length > 0
if (count) { } // ❌ Use count !== 0
```

## Configuration Files

Our ESLint setup includes:
- **@nuxt/eslint**: Nuxt's official ESLint configuration
- **Vue.js rules**: Vue-specific linting and best practices
- **TypeScript ESLint**: Type-aware linting for TypeScript files
- **Tailwind CSS**: Class ordering and optimization rules

## Integration

- Uses **@nuxt/eslint** for comprehensive Nuxt.js linting
- Integrates with **Prettier** for code formatting
- Supports **auto-imports** validation and organization
- Includes **Vue.js** template and script linting
- Supports **Tailwind CSS** class ordering
- **Server/Client context** awareness

## Development Workflow

1. **Auto-fix on save** - Configure your IDE to run ESLint fixes automatically
2. **Pre-commit hooks** - Ensure code quality before commits
3. **CI/CD integration** - Fail builds on linting errors
4. **Type checking** - Use Nuxt's built-in TypeScript support
5. **Hot reload** - Instant feedback during development

## Nuxt-Specific Tips

- **Use `~/` alias** for importing from project root
- **Leverage auto-imports** - don't manually import Nuxt composables
- **Follow file-based routing** conventions in `pages/` directory
- **Use `<NuxtLink>` instead of `<a>`** for internal navigation
- **Implement proper SEO** with `useHead()` and `useSeoMeta()`
- **Handle client/server differences** with `process.client` or `process.server`

Follow these standards to maintain consistent, high-quality code in your Nuxt.js application.
