import { defineStore } from 'pinia'

interface ThemeStore
{
	current: Ref<'dracula' | 'nord'>
	setTheme: (theme: 'nord' | 'dracula') => void
	toggleTheme: () => void
	isdark: ComputedRef<boolean>
}

export const useThemeStore = defineStore(
	'themeStore',
	(): ThemeStore =>
	{
		const current = ref<'nord' | 'dracula'>('nord')

		const setTheme = (theme: 'nord' | 'dracula') =>
		{
			current.value = theme
		}

		const toggleTheme = () =>
		{
			current.value = current.value === 'nord' ? 'dracula' : 'nord'
		}

		const isdark = computed(() => current.value === 'dracula')

		return {
			current,
			setTheme,
			toggleTheme,
			isdark
		}
	},
	{
		persist: true
	}
)
