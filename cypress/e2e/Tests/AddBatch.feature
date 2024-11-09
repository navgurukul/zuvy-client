Feature: Manage Batches in Courses

  Scenario: Add a Batch inside a Course
    Given I am logged in
    When I visit the dashboard
    And I search for the course "Sample"
    Then I should see the course card for "Sample"
    When I click on the course card for "Sample"
    And I navigate to the Batches tab
    And I click on the "New Batch" button
    And in the popup, I enter the batch name as "Batch A"
    And I enter the instructor's email as "saquibaijaz@navgurukul.org"
    And I enter the cap enrollment as "3"
    And I click the "Create Batch" button in the popup
    Then I should see a success message "Batch created successfully"
