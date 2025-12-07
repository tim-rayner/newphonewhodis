# Setup Complete

## Installed Packages

### UI Framework
- **shadcn/ui** dependencies:
  - `class-variance-authority` - For component variants
  - `clsx` - For conditional classnames
  - `tailwind-merge` - For merging Tailwind classes
  
### Styling
- `tailwindcss@3.4.18` - Utility-first CSS framework
- `postcss` - CSS processor
- `autoprefixer` - PostCSS plugin for vendor prefixes

### Icons
- `@fortawesome/fontawesome-svg-core` - Font Awesome core
- `@fortawesome/free-solid-svg-icons` - Solid icon set
- `@fortawesome/react-fontawesome` - React components

## File Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind directives + theme import
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page with AppLayout
├── shared/
│   ├── layout/
│   │   ├── AppLayout.tsx    # Basic app layout with header
│   │   └── index.ts         # Barrel export
│   ├── lib/
│   │   ├── utils.ts         # cn() helper for classnames
│   │   └── index.ts         # Barrel export
│   └── styles/
│       └── theme.css        # Global theme CSS variables
```

## Theme Configuration

The global theme is defined in `src/shared/styles/theme.css` with CSS variables for:
- Colors (background, foreground, primary, secondary, etc.)
- Border radius
- Light/dark mode support

Tailwind config (`tailwind.config.js`) maps these variables to Tailwind utilities.

## Usage

### Adding shadcn components
```bash
pnpm dlx shadcn@latest add button
```

### Using Font Awesome icons
```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

<FontAwesomeIcon icon={faHeart} />
```

### Using the cn() utility
```tsx
import { cn } from '@/shared/lib';

<div className={cn("base-class", condition && "conditional-class")} />
```

## Run Development Server
```bash
pnpm dev
```
