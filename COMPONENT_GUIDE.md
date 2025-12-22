# Component Quick Reference

Quick guide for using TrueDemand's locked design system components.

---

## Button

```tsx
import { Button } from '@/components/ui/button';

// Primary (default)
<Button>Continue</Button>
<Button onClick={handleClick}>Save Changes</Button>

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="link">Learn More</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading={isLoading}>Processing...</Button>

// With Icons
import { ArrowRight, Check } from 'lucide-react';
<Button>
  Continue
  <ArrowRight className="w-4 h-4" />
</Button>
```

---

## Card

```tsx
import { Card } from '@/components/ui/card';

// Default card
<Card padding="lg" className="max-w-5xl mx-auto">
  <h1>Content here</h1>
</Card>

// Variants
<Card variant="default" padding="default">...</Card>
<Card variant="selectable" onClick={handleSelect}>...</Card>
<Card variant="selected">...</Card>
<Card variant="feature" padding="default">...</Card>

// As clickable button
<Card variant="selectable" asButton onClick={...}>
  Click me
</Card>

// Custom padding
<Card padding="none">Custom layout</Card>
<Card padding="sm">Compact</Card>
<Card padding="lg">Spacious</Card>

// With subcomponents
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## Stepper

```tsx
import { Stepper } from '@/components/ui/stepper';

const steps = [
  { number: 1, label: 'CHOOSE MARKET', emoji: '🎯' },
  { number: 2, label: 'FIND PAIN POINTS', emoji: '🔍' },
  { number: 3, label: 'REVIEW INSIGHTS', emoji: '✨' },
  { number: 4, label: 'LAUNCH PLAN', emoji: '🚀' },
];

<Stepper
  steps={steps}
  currentStep={2}
  completedSteps={[1]}
/>

// Custom class
<Stepper
  steps={steps}
  currentStep={3}
  completedSteps={[1, 2]}
  className="mb-16"
/>
```

---

## Input

```tsx
import { Input } from '@/components/ui/input';

// Basic
<Input
  type="text"
  placeholder="Enter your email..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// With label
<div>
  <label className="block text-[14px] font-medium text-[#1E293B] mb-3">
    Email Address
  </label>
  <Input type="email" placeholder="you@example.com" />
</div>

// Disabled
<Input disabled value="Cannot edit" />

// With error state
<Input
  type="text"
  className="border-red-500 focus:ring-red-500"
  placeholder="Error state"
/>
```

---

## Badge

```tsx
import { Badge } from '@/components/ui/badge';

// Variants
<Badge variant="primary">New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="outline">Neutral</Badge>
```

---

## Common Patterns

### Page Header
```tsx
<div className="mb-16">
  <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight mb-4">
    Page Title
  </h1>
  <p className="text-[15px] text-[#64748B] leading-relaxed max-w-3xl">
    Page description or subtitle text.
  </p>
</div>
```

### Section Header
```tsx
<h2 className="text-[20px] font-semibold text-[#1E293B] mb-6">
  Section Title
</h2>
```

### Card Title
```tsx
<h3 className="text-[18px] font-semibold text-[#1E293B] mb-4">
  Card Title
</h3>
```

### Helper Text
```tsx
<p className="text-[14px] text-[#94A3B8]">
  Helper or muted text
</p>
```

### Navigation Buttons
```tsx
<div className="flex items-center justify-between">
  <Button variant="ghost" onClick={handleBack}>
    <ChevronLeft className="w-4 h-4" />
    Back
  </Button>
  <Button onClick={handleContinue}>
    Continue
    <ArrowRight className="w-4 h-4" />
  </Button>
</div>
```

### Feature Card with Icon
```tsx
<Card variant="feature" padding="default">
  <div className="flex items-start gap-3 mb-5">
    <div className="text-[28px]">⚡</div>
    <div>
      <h3 className="text-[18px] font-semibold text-[#1E293B] mb-1">
        Feature Name
      </h3>
      <p className="text-[14px] text-[#94A3B8]">
        Feature description
      </p>
    </div>
  </div>

  {/* Feature content */}

  <Button className="w-full">Action</Button>
</Card>
```

### Grid Layout
```tsx
// 3-column grid (market selection)
<div className="grid grid-cols-3 gap-5">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>

// 2-column grid (launch features)
<div className="grid grid-cols-2 gap-6">
  <div className="space-y-6">...</div>
  <div>...</div>
</div>
```

### Callout / Alert
```tsx
<div className="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-[12px] p-6">
  <div className="flex items-start gap-3">
    <div className="text-[20px]">💡</div>
    <div>
      <h4 className="font-semibold text-[#1E293B] mb-1.5 text-[14px]">
        Key insight
      </h4>
      <p className="text-[14px] text-[#64748B] leading-relaxed">
        Important message or tip.
      </p>
    </div>
  </div>
</div>
```

### Loading State
```tsx
{isLoading ? (
  <div className="flex flex-col items-center text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-6">
      <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
    </div>
    <h3 className="text-[20px] font-semibold text-[#1E293B] mb-2">
      Loading...
    </h3>
    <p className="text-[14px] text-[#94A3B8]">
      Please wait
    </p>
  </div>
) : (
  <div>Content</div>
)}
```

---

## Typography Classes

### Headings
```tsx
// Page header (H1)
className="text-[32px] font-bold text-[#0F172A] leading-tight"

// Section header (H2)
className="text-[20px] font-semibold text-[#1E293B]"

// Card title (H3)
className="text-[18px] font-semibold text-[#1E293B]"

// Small header (H4)
className="text-[15px] font-semibold text-[#1E293B]"
```

### Body Text
```tsx
// Primary body
className="text-[15px] text-[#64748B] leading-relaxed"

// Small body
className="text-[14px] text-[#64748B] leading-relaxed"

// Helper text
className="text-[14px] text-[#94A3B8]"

// Label
className="text-[12px] font-semibold text-[#1E293B]"
```

---

## Color Classes

### Text Colors
```tsx
className="text-[#0F172A]"  // Headings
className="text-[#1E293B]"  // Card titles
className="text-[#64748B]"  // Body text
className="text-[#94A3B8]"  // Muted/helper text
className="text-[#2563EB]"  // Primary blue
```

### Background Colors
```tsx
className="bg-white"        // Cards, inputs
className="bg-[#F8FAFC]"    // Page background
className="bg-[#EFF6FF]"    // Soft blue background
className="bg-[#F0F9FF]"    // Hover tint
```

### Border Colors
```tsx
className="border-[#E5E7EB]"           // Default borders
className="border-[#2563EB]"           // Primary borders
className="border-[rgba(37,99,235,0.4)]" // Hover borders
```

---

## Spacing Classes

### Margin Bottom
```tsx
className="mb-4"   // 16px - small gap
className="mb-6"   // 24px - medium gap
className="mb-10"  // 40px - form elements
className="mb-12"  // 48px - section spacing
className="mb-16"  // 64px - header spacing
className="mb-20"  // 80px - stepper spacing
```

### Gaps
```tsx
className="gap-3"    // 12px
className="gap-5"    // 20px (market cards)
className="gap-6"    // 24px (launch features)
className="space-y-6" // 24px vertical stack
```

---

## Best Practices

1. **Always use shared components** - Never create inline button/card styles
2. **Follow the type scale** - Use exact pixel values from DESIGN_SYSTEM.md
3. **Maintain spacing rhythm** - Stick to the spacing scale
4. **Use semantic HTML** - Buttons for actions, divs for layout
5. **Keep transitions ≤200ms** - Fast, snappy interactions
6. **Emoji sizing matters** - 32px for large, 28px for features, 22px for stepper
7. **Icons from Lucide only** - w-4 h-4 (16px) or w-5 h-5 (20px)
8. **Max-width containers** - max-w-4xl to max-w-6xl depending on content

---

## Don't

❌ Create custom button styles
❌ Use arbitrary colors outside the palette
❌ Mix border radius values
❌ Create heavy animations (>200ms)
❌ Skip the loading prop on async buttons
❌ Hardcode spacing values
❌ Use system fonts instead of Inter
❌ Create variant drift (stick to defined variants)

## Do

✅ Use `<Button>` for all clickable actions
✅ Use `<Card>` with variants for all container elements
✅ Follow the exact typography scale
✅ Maintain consistent spacing rhythm
✅ Use loading states on async actions
✅ Import from `@/components/ui/*`
✅ Reference DESIGN_SYSTEM.md when unsure
✅ Keep micro-interactions subtle and fast
