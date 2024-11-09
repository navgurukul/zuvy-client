Feature: Manage Curriculum Modules in Courses

  Scenario: Delete a Module inside a Course
    Given I am logged in
    When I visit the dashboard
    And I search for the course "Sample"
    Then I should see the course card for "Sample"
    When I click on the course card for "Sample"
    And I go to the Curriculum tab
    And I click on the delete icon on the Module card
    And I click on the Delete Module button in the confirmation popup
    Then I should see a success message "Module Deleted Successfully"
