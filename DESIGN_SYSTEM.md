# TrueDemand Design System

**Version:** 1.0
**Last Updated:** December 2024
**Status:** LOCKED (Production-Ready)

This document defines the complete visual language for TrueDemand. All UI implementations MUST follow these specifications exactly to prevent design drift.

---

## Color Palette

### Primary Brand (Trustworthy Blue)
```
Primary:       #2563EB  (rgb 37, 99, 235)
Primary Light: #3B82F6  (rgb 59, 130, 246)
Primary Dark:  #1D4ED8  (rgb 29, 78, 216)
Soft Blue BG:  #EFF6FF  (very light blue background)
Hover Tint:    #F0F9FF  (lightest blue for hover states)
```

### Neutrals (Slate Scale)
```
Slate 50:  #F8FAFC  (page background)
Slate 100: #F1F5F9  (disabled states)
Slate 200: #E5E7EB  (borders)
Slate 300: #CBD5E1
Slate 400: #94A3B8  (muted text, helper text)
Slate 500: #64748B  (body text)
Slate 600: #475569
Slate 700: #334155
Slate 800: #1E293B  (card titles)
Slate 900: #0F172A  (headings)
```

### Semantic Colors
```
Success:  #10B981  (emerald for completed states)
Warning:  #F59E0B  (amber for callouts)
Error:    #EF4444  (red for errors)
```

### Special Gradients
```
Primary Button:     linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)
Hover Gradient:     linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)
Completed Step:     linear-gradient(135deg, emerald-50 0%, green-50 100%)
Dark Feature Card:  linear-gradient(135deg, #0B1220 0%, #1E293B 100%)
```

---

## Typography

### Font Families
```
UI Font:   Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Code Font: "Geist Mono", "SF Mono", Monaco, monospace
```

### Type Scale (Exact Pixel Values)
```
12px - Helper text, labels, uppercase labels
14px - Body small, UI text, card descriptions
15px - Body text (primary), button text
16px - Input fields
18px - Card titles, section subheadings
20px - Section headers, card feature titles
22px - Stepper emoji size
32px - Page headers (H1), market card emojis
36px - Loading state emoji
```

### Font Weights
```
400 - Normal (body text)
500 - Medium (labels)
600 - Semibold (card titles, section headers)
700 - Bold (page headers)
```

### Line Heights
```
1.25  - Tight (headings)
1.5   - Normal (body text)
1.625 - Relaxed (descriptions, helper text)
```

### Letter Spacing
```
-0.01em - Tight (optional, for large headings)
0       - Normal (default)
0.06em  - Wide (stepper labels, all-caps text)
```

---

## Spacing Scale

Use consistent spacing multiples:
```
8px   (0.5rem)   - Extra small gaps
12px  (0.75rem)  - Small gaps
16px  (1rem)     - Default gap
24px  (1.5rem)   - Medium gap
32px  (2rem)     - Large gap
40px  (2.5rem)   - Extra large gap
48px  (3rem)     - Section spacing (lg padding)
64px  (4rem)     - Header spacing (mb-16)
```

**Vertical Rhythm:**
- Between major sections: 64px (mb-16)
- Between cards in stack: 24px (space-y-6)
- Inside card sections: 40-48px (mb-10 to mb-12)
- Between form elements: 40px (mb-10)

---

## Border Radius

```
8px  (0.5rem)     - Small elements (badges, small buttons)
10px (0.625rem)   - Buttons, inputs (DEFAULT)
12px (0.75rem)    - Medium cards, callouts
14px (0.875rem)   - Large cards (standard card radius)
16px (1rem)       - Extra large elements
20px (1.25rem)    - Hero sections
9999px (full)     - Pills, circles
```

**Component-Specific:**
- Standard Card: `rounded-[14px]`
- Button: `rounded-[10px]`
- Input: `rounded-[10px]`
- Badge: `rounded-md` (6px)
- Stepper Circle: `rounded-full`

---

## Shadows

### Standard Shadows
```
xs:      0 1px 2px rgba(0, 0, 0, 0.05)
sm:      0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
default: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)
md:      0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05)
lg:      0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)
```

### Blue Glow Shadows (Brand)
```
Primary Small:  0 4px 12px rgba(37, 99, 235, 0.15)
Primary:        0 10px 20px rgba(37, 99, 235, 0.2)
Primary Large:  0 20px 40px rgba(37, 99, 235, 0.25)
```

### Hover Shadows
```
Card Hover:     0 10px 30px rgba(37, 99, 235, 0.08)
Button Hover:   shadow-lg shadow-blue-200/50
```

**Usage:**
- Default Card: `shadow-sm`
- Feature Card: `shadow-sm hover:shadow-md`
- Primary Button Hover: `hover:shadow-lg hover:shadow-blue-200/50`
- Stepper Active: `shadow-lg shadow-blue-200/50`

---

## Components

### Button
**Variants:**
- `primary` - Gradient blue button (default)
- `secondary` - White with border
- `ghost` - Minimal, no background
- `link` - Text-only with underline

**Sizes:**
- `sm` - h-10 (40px), px-4, text-[14px], rounded-[8px]
- `default` - h-12 (48px), px-6, text-[15px], rounded-[10px]
- `lg` - h-14 (56px), px-8, text-[16px], rounded-[12px]

**States:**
- Hover: `scale-[1.02]` + shadow increase
- Disabled: Gray gradient, no shadow, no scale
- Loading: Spinner icon + disabled state

**Examples:**
```tsx
<Button>Continue</Button>
<Button variant="secondary">Back</Button>
<Button variant="ghost">Cancel</Button>
<Button loading={true}>Saving...</Button>
```

---

### Card
**Variants:**
- `default` - Standard white card with border
- `selectable` - Hover lift + blue border on hover
- `selected` - Blue border + light blue background
- `feature` - Hover shadow increase

**Padding:**
- `none` - No padding (custom layout)
- `sm` - p-4 (16px)
- `default` - p-6 (24px)
- `lg` - p-12 (48px)

**Examples:**
```tsx
<Card padding="lg" className="max-w-5xl mx-auto">...</Card>
<Card variant="selectable" onClick={...}>...</Card>
<Card variant="selected">...</Card>
```

---

### Input
**Specifications:**
- Height: Variable (py-3.5 for comfortable click target)
- Padding: px-4, py-3.5
- Text: text-[15px]
- Border: border border-[#E5E7EB]
- Radius: rounded-[10px]
- Focus: ring-2 ring-[#2563EB]
- Placeholder: text-[#94A3B8]

**Example:**
```tsx
<Input
  type="text"
  placeholder="Enter your email..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

### Stepper
**Specifications:**
- Circle Size: w-14 h-14 (56px)
- Emoji Size: text-[22px]
- Label Size: text-[12px]
- Label Tracking: tracking-[0.06em]
- Line Height: h-[3px]
- Spacing: mx-5 between elements

**States:**
- Active: Blue gradient + scale-110 + blue glow shadow
- Completed: Emerald gradient + checkmark icon
- Pending: White background + gray border

**Example:**
```tsx
<Stepper
  steps={steps}
  currentStep={2}
  completedSteps={[1]}
/>
```

---

### Badge
**Variants:**
- `primary` - Light blue background
- `secondary` - Gray background
- `success` - Green background
- `warning` - Amber background
- `error` - Red background

**Example:**
```tsx
<Badge variant="success">Completed</Badge>
```

---

## Emoji Usage

**Sizes by Context:**
```
32px - Market selection cards (large, primary focus)
28px - Feature card icons (section headers)
24px - Timeline icons, secondary features
22px - Stepper step icons
20px - Callout icons
18px - Inline emoji in buttons
```

**Approved Emojis:**
```
Market Cards:     💪 (Health), 💰 (Wealth), ❤️ (Relationships)
Stepper:          🎯 🔍 ✨ 🚀
Features:         ⚡ 👥 🚀 💡 📅
Loading:          🎯 (center focus)
Actions:          ✨ (generate), 🎉 (celebrate), ✓ (complete)
```

---

## Micro-Interactions

### Timing
```
Fast:    100ms (subtle state changes)
Default: 200ms (standard transitions)
Slow:    300ms (complex animations)
```

### Easing
```
Default:  cubic-bezier(0.4, 0, 0.2, 1)
In:       cubic-bezier(0.4, 0, 1, 1)
Out:      cubic-bezier(0, 0, 0.2, 1)
In-Out:   cubic-bezier(0.4, 0, 0.2, 1)
```

### Interactions
- **Card Hover**: `-translate-y-0.5` (subtle lift)
- **Button Hover**: `scale-[1.02]` + shadow increase
- **Selected Card**: Border change + background tint (no motion)
- **Loading Spinner**: `animate-spin` (Loader2 icon)
- **Step Transition**: `scale-110` for active step

**No heavy animations. Keep it ≤200ms.**

---

## Layout Constraints

### Max Widths
```
Step 1 (Market Selection): max-w-5xl (1024px)
Step 2 (Scanning):         max-w-4xl (896px)
Step 3 (Insights):         max-w-5xl (1024px)
Step 4 (Launch):           max-w-6xl (1152px)
```

### Grid System
```
Market Cards:      grid-cols-3 gap-5
Launch Features:   grid-cols-2 gap-6
```

### Container Padding
```
Page Wrapper:      px-8 py-8
Card Padding:      p-12 (large cards)
Feature Cards:     p-6 (compact features)
```

---

## Accessibility

### Focus States
All interactive elements have visible focus rings:
```css
focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2
```

### Disabled States
- Visually distinct (gray background)
- Pointer events disabled
- Clear affordance (cursor-not-allowed)

### Contrast Ratios
- Headings (#0F172A on #FFFFFF): 19.1:1 ✓
- Body text (#64748B on #FFFFFF): 4.7:1 ✓
- Muted text (#94A3B8 on #FFFFFF): 3.2:1 (helper text only)

---

## Development Guidelines

### Using Design Tokens
Always import and use design tokens:

```typescript
import { designTokens } from '@/lib/design-tokens';

// ✓ Good
className="text-[#2563EB]"
// Better: Use design token
style={{ color: designTokens.colors.primary.DEFAULT }}
```

### Using Shared Components
NEVER create inline component styles. Always use shared components:

```tsx
// ✗ Bad
<button className="bg-gradient-to-br from-[#2563EB] to-[#3B82F6] ...">

// ✓ Good
<Button>Click Me</Button>
```

### Component Composition
Build complex UIs from simple components:

```tsx
<Card variant="feature" padding="default">
  <CardTitle>Feature Name</CardTitle>
  <CardDescription>Description text</CardDescription>
  <Button variant="primary">Action</Button>
</Card>
```

---

## Quality Checklist

Before shipping any UI, verify:

- [ ] All buttons use `<Button>` component
- [ ] All cards use `<Card>` component with appropriate variant
- [ ] All inputs use `<Input>` component
- [ ] Typography follows exact pixel sizes
- [ ] Spacing matches the rhythm system
- [ ] Shadows are from the approved scale
- [ ] Border radius is consistent
- [ ] Emoji sizes are contextually appropriate
- [ ] Hover states have ≤200ms transitions
- [ ] Focus states are visible
- [ ] Disabled states are clear
- [ ] No hardcoded colors outside of Tailwind classes

---

## Locked Specifications

**DO NOT CHANGE:**
- Primary brand color (#2563EB)
- Typography scale and font families
- Border radius values
- Shadow scale
- Spacing rhythm
- Transition timings (≤200ms)
- Component variants

**If you need to change these, update this document first and get approval.**

---

## Version History

**v1.0** - December 2024
- Initial locked design system
- Blue theme established
- Component library created
- Onboarding flow standardized
