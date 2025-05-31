## Fixes 2 Task List

### Header

- [ ] **1. Fix Header Visibility**
  - [ ] 1.1. Hide the old header completely that appears behind the new header.
  - [ ] 1.2. Ensure no duplicate header elements are visible.

- [ ] **2. Add Theme Switcher**
  - [ ] 2.1. Add light/dark theme switch button to the right side before the account avatar.
  - [ ] 2.2. Implement proper theme switching functionality.
  - [ ] 2.3. Ensure theme colors from CSS variables are correctly applied when switching themes.

- [ ] **3. Fix Avatar Background**
  - [ ] 3.1. Adjust the background color and foreground color of the avatar component.
  - [ ] 3.2. Ensure avatar is visible against the header background.

### Course Dashboard

- [ ] **4. Welcome Message Adjustments**
  - [ ] 4.1. Increase margin from header to welcome message to approximately 48px (3rem).
  - [ ] 4.2. Remove the background color from the welcome message container.

- [ ] **5. What's Next Section Improvements**
  - [ ] 5.1. Fix left and right padding for items to prevent touching card boundaries.
  - [ ] 5.2. Correct the card height to hug content without unnecessary space.
  - [ ] 5.3. Vertically center action buttons on the right side of each item.
  - [ ] 5.4. Replace one assignments item with an upcoming assessment item.
  - [ ] 5.5. Update CTA button colors: Primary for live classes, Secondary for assignments and quizzes, Accent for assessments.

- [ ] **6. Course Modules Section Updates**
  - [ ] 6.1. Reposition progress percentage number to appear at the end of the progress bar and inline with the "Progress" text.
  - [ ] 6.2. Standardize CTAs to use button component with primary background and appropriate foreground color.
  - [ ] 6.3. Set uniform button height to 48px (3rem).

### Course Module Details Page

- [ ] **7. Navigation Improvements**
  - [ ] 7.1. Remove redundant "Back to Dashboard" button since breadcrumb navigation exists.
  - [ ] 7.2. Remove "Web Development Bootcamp" link from breadcrumb as it's unnecessary.

- [ ] **8. Left Pane (Module Content) Fixes**
  - [ ] 8.1. Correct foreground color for icons and text in selected state (should use a white color variable).
  - [ ] 8.2. Convert module content from card to simple list items to fix empty space issues.
  - [ ] 8.3. Update completed items to use success green color for check marks.

- [ ] **9. Right Pane Content Improvements**
  - [ ] **9.1. Live Class Conditions**
    - [ ] 9.1.1. Create three live classes to demonstrate different states.
    - [ ] 9.1.2. Implement "Join Class" CTA that appears 10 minutes before class time.
    - [ ] 9.1.3. Display countdown for future classes ("X days" or "X hours Y minutes" format).
    - [ ] 9.1.4. Show checkmark with completed status and video player for past classes.
  
  - [ ] **9.2. Video Improvements**
    - [ ] 9.2.1. Remove "Rewatch Video" CTA.
    - [ ] 9.2.2. Implement automatic completion marking when video is watched.
  
  - [ ] **9.3. Reading Material Fixes**
    - [ ] 9.3.1. Update "Mark as Complete" button to match button specifications defined in 3.2.
  
  - [ ] **9.4. Assignment Improvements**
    - [ ] 9.4.1. Remove card styling from submission requirements, display as plain text within parent card.
    - [ ] 9.4.2. Adjust "Download Instructions" and "Submit Assignment" buttons to match button specs.

- [ ] **10. General Layout Improvements**
  - [ ] 10.1. Add bottom margin of at least 64px (4rem) to both dashboard and course module details pages. 