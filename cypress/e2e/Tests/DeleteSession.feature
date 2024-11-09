Feature: Manage Sessions in Courses

  Scenario: Delete a Session inside a Course
    Given I am logged in
    When I visit the dashboard
    And I search for the course "Sample"
    Then I should see the course card for "Sample"
    When I click on the course card for "Sample"
    And I go to the Sessions tab
    And I navigate to the Upcoming tab
    And I click on the delete icon on the session's card
    And I click on the Delete Session button in the confirmation popup
    Then I should see a success message "Session deletedSession delete successfully"
