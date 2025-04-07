import { useThemeStore } from '~/stores/theme'

export default defineNuxtPlugin(() =>
{
	const themeStore = useThemeStore()

	watch(
		() => themeStore.current,
		(newTheme) =>
		{
			document.documentElement.setAttribute('data-theme', newTheme)
		},
		{ immediate: true }
	)
})
