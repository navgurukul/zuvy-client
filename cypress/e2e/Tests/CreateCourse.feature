Feature: Manage Courses

  Scenario: Visit Dashboard (/admin/courses)
    Given I am logged in
    When I visit the dashboard

  Scenario: Create a Course if it does not already exist
    Given I am logged in
    When I visit the dashboard
    And I check if a course with the name "Sample" exists
    And I create a course with the name "Sample" if it does not exist
    Then I should see the course card for "Sample"
