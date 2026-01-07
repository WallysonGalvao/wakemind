## Git Workflow

- Do not include "Claude Code" in commit messages
- Use conventional commits (be brief and descriptive)

## Important Concepts

Focus on these principles in all code:

- e2e type-safety
- error monitoring/observability
- automated tests
- readability/maintainability

All detailed coding guidelines are in the skills:

- Use `software-engineering` skill for core principles
- Use `typescript` skill for TypeScript/JavaScript standards
- Use `react` skill for React/Next.js best practices
- Use `reviewing-code` skill for code reviews
- Use `writing` skill for documentation and commit messages

# WakeMind - Project Guidelines

## Styling Standards

This project uses **TailwindCSS + NativeWind** for styling. Follow these rules:

### ✅ DO

- Use `className` with Tailwind utility classes for all styling
- Use `contentContainerClassName` for ScrollView/FlatList content styling
- Use `useMemo` for dynamic styles that depend on runtime values (e.g., safe area insets)
- Support dark/light themes with `dark:` prefix

### ❌ DON'T

- Do NOT use `StyleSheet.create()` - this is not the project pattern
- Avoid inline `style={{}}` objects when possible
- Never use CSS `filter` property (not supported in React Native)

### Examples

```tsx
// ✅ Good - Using NativeWind
<View className="flex-1 bg-background-light dark:bg-background-dark">
<ScrollView contentContainerClassName="gap-4 pb-36">

// ✅ Good - Dynamic values with useMemo
const headerStyle = useMemo(() => ({ paddingTop: insets.top + 12 }), [insets.top]);
<View style={headerStyle}>

// ❌ Bad - StyleSheet.create
const styles = StyleSheet.create({ container: { flex: 1 } });

// ❌ Bad - Inline styles for static values
<View style={{ paddingBottom: 140, gap: 16 }}>
```

## Accessibility

Always add `accessibilityRole` to interactive elements:

```tsx
<Pressable accessibilityRole="button" onPress={handlePress}>
```

## Icon Types

Use proper TypeScript types for MaterialIcons:

```tsx
icon?: keyof typeof MaterialIcons.glyphMap
```
