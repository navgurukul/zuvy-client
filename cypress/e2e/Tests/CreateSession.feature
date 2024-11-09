Feature: Manage Sessions in Courses

  Scenario: Create a Session inside a Course
    Given I am logged in
    When I navigate inside the course
    And I search for the course "Sample"
    And I click on the course card for "Sample"
    And I go to the Sessions tab
    And I click on the "Create Session" button
    And in the popup, I enter the session name as "Session A"
    And I click on the Classes Start Date box
    And I select a date two days after the current date from the calendar
    And I close the calendar popup
    And I enter the start time as "10:00 AM"
    And I enter the end time as "11:00 AM"
    And I click on the Batches dropdown and select a batch
    And I close the Batches dropdown
    And I click on the Days of Week dropdown
    And I select the days of the week as "Monday, Wednesday, Friday"
    And I close the Days of Week dropdown
    Then I should see the number of days autofilled with "3"
    When I click on the Create Session button
    Then I should see a success message "Created Classes Successfully"
