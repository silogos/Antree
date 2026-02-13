# Task 13: UI Components Build - Learnings

## Files Created

### Core UI Components (2)
1. **Topbar.tsx** - Fixed header with title, current time, last refresh timestamp
   - TV-optimized with larger text on screens >= 1024px
   - Real-time clock with 1-second interval updates

2. **Footer.tsx** - Simple footer with version and credits
   - Hidden on TV screens (width >= 1024px)
   - Responsive design

### Utilities (3)
3. **EmptyState.tsx** - Centered empty state component
   - Props: message, illustration (optional icon), iconSize, className
   - Uses Lucide icons for illustration

4. **ViewModeToggle.tsx** - Toggle between display/operator modes
   - Props: currentMode, onChange, disabled
   - Consistent with shadcn/ui styling

5. **SoundToggle.tsx** - Toggle sound on/off
   - Props: soundEnabled, onChange, disabled, label
   - Consistent with shadcn/ui styling

### Modals (2)
6. **AddQueueModal.tsx** - Form for adding new queues
   - RHF form with required fields: queueNumber, service, customerName, duration, statusId
   - Includes status dropdown populated from statuses prop
   - Integrates with mockQueueService
   - Validation handled by RHF

7. **StatusManagerModal.tsx** - CRUD operations for statuses
   - Add new status
   - Edit existing status
   - Delete status with confirmation
   - Visual color picker with preset colors
   - List of existing statuses with edit/delete actions
   - Integration with mockStatusService

### UI Components (3)
8. **Dialog.tsx** - Modal dialog wrapper with subcomponents
   - Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, DialogClose
   - Fixed overlay with backdrop blur

9. **Button.tsx** - Reusable button component
   - Variants: default, destructive, outline, secondary, ghost
   - Sizes: default, sm, lg

10. **Input.tsx** - Form input component
    - Consistent styling with shadcn/ui

11. **Label.tsx** - Form label component
    - Proper accessibility

12. **Switch.tsx** - Toggle switch component
    - Simple implementation without id prop
    - Can be integrated with RHF

## Key Patterns & Conventions

### Import Path Issues
- Had to resolve module resolution issues with `@/lib/utils`
- Fixed by using relative paths `../../lib/utils` for components in `src/components/`
- Button.tsx had case sensitivity issue (button.tsx vs Button.tsx) - resolved by renaming

### Form Validation with RHF
- StatusManagerModal: Removed zodResolver due to type incompatibility issues
- Used simple form values object instead
- AddQueueModal: Successfully uses zodResolver with createQueueSchema

### Modal Structure
- Dialog requires `open` and `onClose` props
- Modal structure: Dialog -> DialogContent -> DialogHeader + form -> DialogFooter
- DialogClose is optional but recommended for better UX

### TV-Optimization
- Topbar: CSS media queries for larger text on TV screens (>= 1024px)
- Footer: Hidden on TV screens via CSS/JS detection

### Color Picker Pattern
- Used predefined color palette in StatusManagerModal
- Colors: Red, Orange, Yellow, Lime, Green, Cyan, Blue, Violet, Pink
- Click to select color from preset options

## Common Issues Encountered

1. **Module Resolution**: Using `@/` alias in component imports caused issues because the tsconfig paths were set to `"./*"` but components are in `src/components/`. Fixed with relative paths.

2. **Case Sensitivity**: Button.tsx vs button.tsx import issues. Renamed to button.tsx.

3. **Form Type Mismatch**: RHF zodResolver type inference issues with optional fields. Resolved by using simple form values object instead of zodResolver.

4. **Dialog Props**: Dialog requires `onClose` prop but not explicitly documented in original Dialog component. Added onClose functionality.

## Testing & Verification

- Build passes successfully: `pnpm run build`
- All components export properly
- No TypeScript errors
- All components use Tailwind CSS for styling
- Components follow shadcn/ui design patterns
- All modals use proper form structure

## Next Steps

- Task 14 will combine these components into the main App.tsx
- Need to integrate with existing hooks (useViewMode, useSound)
- Need to wire up status dropdown in AddQueueModal
- Need to wire up onSuccess callbacks for refreshing data
