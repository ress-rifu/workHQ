# WorkHQ Design System - Quick Reference

A comprehensive guide to using the WorkHQ design system components and theme.

---

## 🎨 Theme Usage

### Accessing Theme

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { colors, isDark, toggleTheme, setTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

### Available Theme Properties

```typescript
{
  colorScheme: 'light' | 'dark',
  colors: ThemeColors,        // All color tokens
  isDark: boolean,            // Quick dark mode check
  toggleTheme: () => void,    // Toggle between light/dark
  setTheme: (scheme) => void  // Set specific theme
}
```

---

## 🧩 UI Components

### Button

```typescript
import { Button } from '@/components/ui';

// Primary button (default)
<Button title="Submit" onPress={handleSubmit} />

// Variants
<Button title="Secondary" variant="secondary" />
<Button title="Outline" variant="outline" />
<Button title="Ghost" variant="ghost" />
<Button title="Danger" variant="danger" />

// Sizes
<Button title="Small" size="sm" />
<Button title="Medium" size="md" />  // default
<Button title="Large" size="lg" />

// States
<Button title="Loading..." loading />
<Button title="Disabled" disabled />

// Full width
<Button title="Full Width" fullWidth />

// With icon (provide your own icon component)
<Button 
  title="Save" 
  icon={<Ionicons name="save" size={20} color="#fff" />}
/>
```

**Props:**
- `title`: string (required)
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `icon`: ReactNode
- `onPress`: () => void
- All TouchableOpacity props

---

### Input

```typescript
import { Input } from '@/components/ui';

// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
/>

// With icon
<Input
  label="Email"
  leftIcon="mail-outline"
  value={email}
  onChangeText={setEmail}
/>

// Password input (automatically shows eye icon)
<Input
  label="Password"
  secureTextEntry
  value={password}
  onChangeText={setPassword}
/>

// With error
<Input
  label="Email"
  error="Invalid email address"
  value={email}
  onChangeText={setEmail}
/>

// With hint
<Input
  label="Username"
  hint="3-20 characters, letters and numbers only"
  value={username}
  onChangeText={setUsername}
/>

// Required field
<Input
  label="Email"
  required
  value={email}
  onChangeText={setEmail}
/>
```

**Props:**
- `label`: string
- `error`: string
- `hint`: string
- `leftIcon`: keyof typeof Ionicons.glyphMap
- `rightIcon`: keyof typeof Ionicons.glyphMap
- `onRightIconPress`: () => void
- `required`: boolean
- All TextInput props

---

### Card

```typescript
import { Card } from '@/components/ui';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Custom padding
<Card padding="sm">...</Card>
<Card padding="md">...</Card>  // default
<Card padding="lg">...</Card>
<Card padding="xl">...</Card>

// Shadow variants
<Card shadow="none">...</Card>
<Card shadow="sm">...</Card>
<Card shadow="md">...</Card>    // default
<Card shadow="lg">...</Card>
<Card shadow="xl">...</Card>

// Pressable card
<Card onPress={handlePress}>
  <Text>Tap me!</Text>
</Card>
```

**Props:**
- `children`: ReactNode (required)
- `padding`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `onPress`: () => void
- `style`: ViewStyle

---

### Avatar

```typescript
import { Avatar } from '@/components/ui';

// With name (shows initials)
<Avatar name="John Doe" />

// With image
<Avatar uri="https://example.com/avatar.jpg" />

// Sizes
<Avatar name="John Doe" size="xs" />
<Avatar name="John Doe" size="sm" />
<Avatar name="John Doe" size="md" />  // default
<Avatar name="John Doe" size="lg" />
<Avatar name="John Doe" size="xl" />
```

**Props:**
- `uri`: string (image URL)
- `name`: string (for initials)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `style`: ViewStyle

---

### Badge

```typescript
import { Badge } from '@/components/ui';

// Variants
<Badge label="Active" variant="success" />
<Badge label="Pending" variant="warning" />
<Badge label="Error" variant="error" />
<Badge label="Info" variant="info" />
<Badge label="Default" variant="default" />

// Sizes
<Badge label="Small" size="sm" />
<Badge label="Medium" size="md" />  // default
<Badge label="Large" size="lg" />

// With icon
<Badge 
  label="New" 
  icon={<Ionicons name="star" size={14} color={colors.success} />}
  variant="success"
/>
```

**Props:**
- `label`: string (required)
- `variant`: 'default' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: ReactNode
- `style`: ViewStyle
- `textStyle`: TextStyle

---

### Divider

```typescript
import { Divider } from '@/components/ui';

// Horizontal divider (default)
<Divider />

// With spacing
<Divider spacing="md" />

// Vertical divider
<Divider orientation="vertical" />
```

**Props:**
- `orientation`: 'horizontal' | 'vertical'
- `spacing`: keyof typeof Spacing
- `style`: ViewStyle

---

### LoadingSpinner

```typescript
import { LoadingSpinner } from '@/components/ui';

// Inline spinner
<LoadingSpinner />

// Full screen spinner
<LoadingSpinner fullScreen />

// Size
<LoadingSpinner size="small" />
<LoadingSpinner size="large" />
```

**Props:**
- `size`: 'small' | 'large'
- `fullScreen`: boolean
- `style`: ViewStyle

---

## 📐 Layout Components

### Screen

```typescript
import { Screen } from '@/components/layout';

// Basic screen
<Screen>
  <Text>Content</Text>
</Screen>

// Scrollable screen
<Screen scrollable>
  <Text>Long content...</Text>
</Screen>

// Without safe area
<Screen safe={false}>
  <Text>Content</Text>
</Screen>

// Without padding
<Screen padding={false}>
  <Text>Content</Text>
</Screen>

// Without keyboard avoiding
<Screen keyboardAvoiding={false}>
  <Text>Content</Text>
</Screen>
```

**Props:**
- `children`: ReactNode (required)
- `scrollable`: boolean (default: false)
- `safe`: boolean (default: true)
- `padding`: boolean (default: true)
- `keyboardAvoiding`: boolean (default: true)
- `style`: ViewStyle
- `contentContainerStyle`: ViewStyle

---

### Container

```typescript
import { Container } from '@/components/layout';

// Basic container
<Container>
  <Text>Content</Text>
</Container>

// With max width
<Container maxWidth>
  <Text>Centered content with max width</Text>
</Container>

// Without padding
<Container padding={false}>
  <Text>Content</Text>
</Container>
```

**Props:**
- `children`: ReactNode (required)
- `maxWidth`: boolean (default: false)
- `padding`: boolean (default: true)
- `style`: ViewStyle

---

### Header

```typescript
import { Header } from '@/components/layout';

// With title
<Header title="Profile" />

// With back button
<Header title="Settings" showBack />

// With subtitle
<Header 
  title="Dashboard"
  subtitle="Welcome back!"
/>

// With custom back action
<Header
  title="Details"
  showBack
  onBackPress={handleCustomBack}
/>

// With right action
<Header
  title="Messages"
  rightAction={
    <TouchableOpacity onPress={handleAction}>
      <Ionicons name="add" size={24} color={colors.primary} />
    </TouchableOpacity>
  }
/>
```

**Props:**
- `title`: string
- `subtitle`: string
- `showBack`: boolean
- `onBackPress`: () => void
- `rightAction`: ReactNode
- `style`: ViewStyle

---

## 🎨 Design Tokens

### Colors

Access via `useTheme`:

```typescript
const { colors } = useTheme();

// Usage
colors.primary
colors.background
colors.text
colors.success
colors.error
// ... and many more
```

### Spacing

```typescript
import { Spacing } from '@/constants/theme';

// Values
Spacing.xs    // 4
Spacing.sm    // 8
Spacing.md    // 16
Spacing.lg    // 24
Spacing.xl    // 32
Spacing['2xl'] // 40
Spacing['3xl'] // 48
Spacing['4xl'] // 64
```

### Typography

```typescript
import { Typography } from '@/constants/theme';

// Font Family
Typography.fontFamily.regular   // Inter_400Regular
Typography.fontFamily.medium    // Inter_500Medium
Typography.fontFamily.semibold  // Inter_600SemiBold
Typography.fontFamily.bold      // Inter_700Bold

// Font Size
Typography.fontSize.xs    // 12
Typography.fontSize.sm    // 14
Typography.fontSize.base  // 16
Typography.fontSize.lg    // 18
Typography.fontSize.xl    // 20
Typography.fontSize['2xl'] // 24
Typography.fontSize['3xl'] // 30
// ... etc
```

### Border Radius

```typescript
import { BorderRadius } from '@/constants/theme';

BorderRadius.sm    // 4
BorderRadius.md    // 8
BorderRadius.lg    // 12
BorderRadius.xl    // 16
BorderRadius['2xl'] // 24
BorderRadius.full  // 9999
```

### Shadows

```typescript
import { Shadows } from '@/constants/theme';

// Apply to style
style={[styles.card, Shadows.md]}
```

---

## 📝 Common Patterns

### Form

```typescript
<Screen scrollable keyboardAvoiding>
  <View style={{ gap: Spacing.md }}>
    <Input
      label="Full Name"
      placeholder="Enter your name"
      value={name}
      onChangeText={setName}
      leftIcon="person-outline"
      required
    />
    
    <Input
      label="Email"
      placeholder="Enter your email"
      value={email}
      onChangeText={setEmail}
      leftIcon="mail-outline"
      keyboardType="email-address"
      error={emailError}
      required
    />
    
    <Input
      label="Password"
      placeholder="Enter password"
      value={password}
      onChangeText={setPassword}
      leftIcon="lock-closed-outline"
      secureTextEntry
      required
    />
    
    <Button
      title="Submit"
      onPress={handleSubmit}
      loading={loading}
      fullWidth
      size="lg"
    />
  </View>
</Screen>
```

### Card List

```typescript
<Screen scrollable>
  {items.map((item) => (
    <Card 
      key={item.id} 
      onPress={() => handlePress(item)}
      style={{ marginBottom: Spacing.md }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={item.name} size="md" />
        <View style={{ marginLeft: Spacing.md, flex: 1 }}>
          <Text style={{ fontFamily: Typography.fontFamily.semibold }}>
            {item.name}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            {item.subtitle}
          </Text>
        </View>
        <Badge label={item.status} variant="success" />
      </View>
    </Card>
  ))}
</Screen>
```

### Empty State

```typescript
<View style={{ 
  flex: 1, 
  justifyContent: 'center', 
  alignItems: 'center',
  padding: Spacing.xl 
}}>
  <Ionicons 
    name="calendar-outline" 
    size={64} 
    color={colors.textTertiary} 
  />
  <Text style={{ 
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
    color: colors.text 
  }}>
    No Data Found
  </Text>
  <Text style={{ 
    marginTop: Spacing.xs,
    color: colors.textSecondary 
  }}>
    Get started by adding your first item
  </Text>
  <Button
    title="Add Item"
    onPress={handleAdd}
    style={{ marginTop: Spacing.lg }}
  />
</View>
```

---

## 🎯 Best Practices

1. **Always use theme colors** - Never hardcode colors
2. **Use spacing constants** - Maintain consistency
3. **Leverage components** - Don't recreate basic UI elements
4. **Use typography scale** - Stick to defined font sizes
5. **Test both themes** - Always check light and dark mode
6. **Use semantic colors** - success for positive, error for negative
7. **Maintain touch targets** - Minimum 44x44 for interactive elements

---

## 🚀 Quick Start Template

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen, Header } from '@/components/layout';
import { Button, Input, Card } from '@/components/ui';
import { Typography, Spacing } from '@/constants/theme';

export default function MyScreen() {
  const { colors } = useTheme();
  const [value, setValue] = useState('');

  return (
    <Screen scrollable>
      <Header title="My Screen" showBack />
      
      <Card padding="lg">
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome
        </Text>
        
        <Input
          label="Input Label"
          placeholder="Enter text"
          value={value}
          onChangeText={setValue}
          containerStyle={styles.input}
        />
        
        <Button
          title="Submit"
          onPress={() => console.log(value)}
          fullWidth
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
  },
});
```

---

**Happy Building! 🎉**

