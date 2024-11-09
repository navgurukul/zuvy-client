Feature: Manage Curriculum Modules in Courses

  Scenario: Create a Module inside a Course
    Given I am logged in
    When I visit the dashboard
    And I search for the course "Sample"
    Then I should see the course card for "Sample"
    When I click on the course card for "Sample"
    And I go to the Curriculum tab
    And I click on the "Add Module" button
    And in the popup, I select the Learning Material radio button
    And I enter the module name as "Module A"
    And I enter the module description as "This is a test module description"
    And I enter "2" in the months box, "1" in the weeks box, and "3" in the days box
    And I click on the Create Module button
    Then I should see a success message "Module Created Successfully"
