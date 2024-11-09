Feature: Manage Students in Courses

  Scenario: Visit Dashboard (/admin/courses)
    Given I am logged in
    When I visit the dashboard

  Scenario: Add a Student to a Course
    Given I am logged in
    When I visit the dashboard
    And I search for the course "Sample"
    Then I should see the course card for "Sample"
    When I click on the course card for "Sample"
    And I navigate to the Students tab
    And I click on the "Add Student" button
    And in the popup, I select the radio button "One at a time"
    And I enter the name of the student as "Jenny Doe"
    And I enter the email of the student as "Jenny.doe@example.com"
    And I click on the "Add Student" button in the popup
    Then I should see a success message "1 Student Successfully Enrolled"
    When I search for the student "Jenny Doe" in the student list
    Then I should see "Jenny Doe" in the list of enrolled students
