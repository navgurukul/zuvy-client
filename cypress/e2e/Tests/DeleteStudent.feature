Feature: Manage Students in Courses

  Scenario: Visit Dashboard (/admin/courses)
    Given I am logged in
    When I visit the dashboard

  Scenario: Delete a Student from a Course
    Given I am logged in
    When I visit the dashboard
    And I search for the course "Sample"
    Then I should see the course card for "Sample"
    When I click on the course card for "Sample"
    And I navigate to the Students tab
    And I search for the student "Jenny Doe" in the student list
    Then I should see the email of the student as "Jenny.doe@example.com"
    When I click on the delete icon in the row for "Jenny Doe"
    And I confirm deletion by clicking the "Continue" button in the confirmation popup
    Then I should see a success message "Student Successfully Deleted"
