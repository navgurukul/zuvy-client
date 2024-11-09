Feature: Manage Batches in Courses

  Scenario: Delete a Batch inside a Course
    Given I am logged in
    When I visit the dashboard
    And I search for the course "Sample"
    Then I should see the course card for "Sample"
    When I click on the course card for "Sample"
    And I navigate to the Batches tab
    And I search for the batch "Batch A" in the search bar
    Then I should see the batch card for "Batch A"
    When I click on the batch card for "Batch A"
    And I click on the delete icon
    And in the confirmation popup, I type the batch name as "Batch A"
    And I click on the "Delete Batch" button
    Then I should see a success message "Batch Deleted Successfully"
