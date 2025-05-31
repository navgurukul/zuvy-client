## Fixes Task List

- [ ] **1. Link Course Module Details Page**
  - [ ] 1.1. Update `src/app/student/_components/CourseModulesSection.tsx` to ensure that clicking the CTA in a course module card navigates to the corresponding `course/[courseId]/module/[moduleId]` page.
    - Relevant files: `src/app/student/_components/CourseModulesSection.tsx`

- [ ] **2. Standardize Primary Button Styling**
  - [ ] 2.1. Globally review components and replace `bg-secondary` (and similar uses of secondary color for primary actions) with `bg-primary` for main call-to-action button components.
  - [ ] 2.2. Ensure all main call-to-action buttons consistently utilize the primary color scheme as defined in the Academia Futura theme (`globals.css`, `tailwind.config.ts`).
    - Relevant files: Potentially many, including `src/app/student/_components/WhatsNextSection.tsx`, `src/app/course/[courseId]/module/[moduleId]/_components/ItemContentView.tsx`, `src/components/ui/button.tsx` (if generic button styles need adjustment).

- [ ] **3. Add Success Color Theme**
  - [ ] 3.1. In `src/app/globals.css`, define new CSS variables for success colors (e.g., `--success`, `--success-foreground`, and their HSL/OKLCH equivalents) for both light and dark themes, using an appropriate shade of green.
  - [ ] 3.2. Update `tailwind.config.ts` to include these new success color definitions.
  - [ ] 3.3. Apply the new success color variables to components that indicate success, such as progress bar completion, and checkmark icons for completed items.
    - Relevant files: `src/app/globals.css`, `tailwind.config.ts`, `src/app/student/_components/CourseInformationBanner.tsx`, `src/app/student/_components/CourseModulesSection.tsx`, `src/app/student/_components/AttendanceSection.tsx`.

- [ ] **4. Correct Font Application**
  - [ ] 4.1. In `src/app/layout.tsx`, verify that `next/font/google` is importing "Outfit" for headings and "Manrope" for body/sans-serif text.
  - [ ] 4.2. In `src/app/globals.css`, confirm that the CSS variables `--font-heading` and `--font-sans` are correctly assigned 'Outfit' and 'Manrope' respectively, with appropriate fallbacks.
  - [ ] 4.3. In `tailwind.config.ts`, ensure `theme.extend.fontFamily.heading` and `theme.extend.fontFamily.sans` correctly reference `var(--font-heading)` and `var(--font-sans)`.
  - [ ] 4.4. Troubleshoot and fix any CSS specificity or import issues preventing the correct fonts from rendering on headings and body text throughout the application.
    - Relevant files: `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`.

- [ ] **5. Refine "What's Next" Section**
  - [ ] 5.1. In `src/app/student/_components/WhatsNextSection.tsx`, remove the "View All" button if present.
  - [ ] 5.2. Adjust the styling of item icons to ensure their background height is appropriate for the icon size and does not stretch to the full height of the list item. The background should hug the icon.
    - Relevant files: `src/app/student/_components/WhatsNextSection.tsx`.

- [ ] **6. Adjust Course Modules Section (Dashboard View)**
  - [ ] 6.1. In `src/app/student/_components/CourseModulesSection.tsx`, remove the "View Full Curriculum" button/link if present.
  - [ ] 6.2. Modify the Call to Action (CTA) button at the bottom of each module card to have its width hug its content (e.g., using `w-auto` or similar).
  - [ ] 6.3. Ensure the CTA button is aligned to the right side of the card.
  - [ ] 6.4. Reduce the width of the module progress bar to approximately 1/3rd of the card width.
    - Relevant files: `src/app/student/_components/CourseModulesSection.tsx`.

- [ ] **7. Revise Attendance Section - Recent Classes Layout**
  - [ ] 7.1. In `src/app/student/_components/AttendanceSection.tsx`, change the layout for the "Recent Classes" list from a multi-column style to a full-width row style.
  - [ ] 7.2. Ensure each recent class item (icon, topic, date, badge) is displayed clearly in its own row, allowing the full topic name to be visible without excessive truncation.
    - Relevant files: `src/app/student/_components/AttendanceSection.tsx`.

- [ ] **8. Refine Attendance Section - Streak Display**
  - [ ] 8.1. In `src/app/student/_components/AttendanceSection.tsx`, ensure the streak icon (e.g., Flame) and the streak number are properly aligned (e.g., vertically centered, appropriate spacing).
  - [ ] 8.2. Remove the literal text "class streak". The number and icon should suffice.
  - [ ] 8.3. Reposition the motivational message (e.g., "Impressive streak...") to appear directly below the streak icon and number grouping.
    - Relevant files: `src/app/student/_components/AttendanceSection.tsx`.

- [ ] **9. Adjust Page Spacing (Student Dashboard)**
  - [ ] 9.1. In `src/app/student/page.tsx`, reduce the vertical spacing (e.g., top padding or margin) between the global `<Header />` and the main page content (specifically the "Welcome to Zuvy..." message) by approximately half of its current value.
    - Relevant files: `src/app/student/page.tsx`.

- [ ] **10. Update Theme Background and Card Colors**
  - [ ] 10.1. In `src/app/globals.css`, review and update the Academia Futura theme color definitions (both OKLCH and HSL sections, for light mode primarily, and ensure dark mode remains consistent or is similarly adjusted if needed).
  - [ ] 10.2. Adjust the `--background` CSS variable to a slightly bluish background tint instead of the current off-white/cream for the light theme.
  - [ ] 10.3. Adjust the `--card` CSS variable to use a white or very light contrasting color for card backgrounds in the light theme, ensuring it stands out from the new bluish main background.
  - [ ] 10.4. Verify these changes in `tailwind.config.ts` if colors are directly mapped there, though primary changes should be in `globals.css` CSS variables.
    - Relevant files: `src/app/globals.css`, `tailwind.config.ts`. 