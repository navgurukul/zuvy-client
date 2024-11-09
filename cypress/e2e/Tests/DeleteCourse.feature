Feature: Manage Courses

  Scenario: Visit Dashboard (/admin/courses)
    Given I am logged in
    When I visit the dashboard

  Scenario: Delete a Course if it exists
    Given I am logged in
    When I visit the dashboard
    And I search for the course "Sample"
    Then I should see the course card for "Sample"
    When I click on the course card for "Sample"
    And I navigate to the settings tab
    And I click on the "Delete Course" button
    And I confirm deletion in the confirmation popup
    Then I should see a success message "Bootcamp Deleted Successfully"
