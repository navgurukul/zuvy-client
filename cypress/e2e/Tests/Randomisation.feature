Feature: Weightage Calculation for Coding Questions

  # Positive Test Cases
  Scenario: Basic Valid Input
    Given the number of easy questions is 1
    And the number of medium questions is 2
    And the number of hard questions is 2
    When I calculate the weightage
    Then the Easy Weightage should be 6.25
    And the Medium Weightage should be 18.75
    And the Hard Weightage should be 25.0

  Scenario: All Easy Questions
    Given the number of easy questions is 5
    And the number of medium questions is 0
    And the number of hard questions is 0
    When I calculate the weightage
    Then the Easy Weightage should be 50.0
    And the Medium Weightage should be 0.0
    And the Hard Weightage should be 0.0

  Scenario: All Medium Questions
    Given the number of easy questions is 0
    And the number of medium questions is 5
    And the number of hard questions is 0
    When I calculate the weightage
    Then the Easy Weightage should be 0.0
    And the Medium Weightage should be 50.0
    And the Hard Weightage should be 0.0

  Scenario: All Hard Questions
    Given the number of easy questions is 0
    And the number of medium questions is 0
    And the number of hard questions is 5
    When I calculate the weightage
    Then the Easy Weightage should be 0.0
    And the Medium Weightage should be 0.0
    And the Hard Weightage should be 50.0

  Scenario: Mixed Questions with 2 Easy, 2 Medium, 1 Hard
    Given the number of easy questions is 2
    And the number of medium questions is 2
    And the number of hard questions is 1
    When I calculate the weightage
    Then the Easy Weightage should be 14.29
    And the Medium Weightage should be 21.43
    And the Hard Weightage should be 14.29

  Scenario: Single easy question
    Given the number of easy questions is 1
    And the number of medium questions is 0
    And the number of hard questions is 0
    When I calculate the weightage
    Then the Easy Weightage should be 50.0
    And the Medium Weightage should be 0.0
    And the Hard Weightage should be 0.0

  Scenario: Mixed questions with equal count
    Given the number of easy questions is 1
    And the number of medium questions is 1
    And the number of hard questions is 1
    When I calculate the weightage
    Then the Easy Weightage should be 16.67
    And the Medium Weightage should be 16.67
    And the Hard Weightage should be 16.67

  Scenario: Three easy and two hard questions
    Given the number of easy questions is 3
    And the number of medium questions is 0
    And the number of hard questions is 2
    When I calculate the weightage
    Then the Easy Weightage should be 30.0
    And the Medium Weightage should be 0.0
    And the Hard Weightage should be 40.0
  
  Scenario: Two medium and two hard questions
    Given the number of easy questions is 0
    And the number of medium questions is 2
    And the number of hard questions is 2
    When I calculate the weightage
    Then the Easy Weightage should be 0.0
    And the Medium Weightage should be 30.0
    And the Hard Weightage should be 40.0

  
  

  # Negative Test Cases
  Scenario: More than 5 questions
    Given the number of easy questions is 3
    And the number of medium questions is 2
    And the number of hard questions is 1
    When I calculate the weightage
    Then I should see an error message "Error: The total number of questions must be exactly 5."

  Scenario: Negative input values
    Given the number of easy questions is -1
    And the number of medium questions is 2
    And the number of hard questions is 3
    When I calculate the weightage
    Then I should see an error message "Error: Invalid input values."

  Scenario: Invalid input types
    Given the number of easy questions is "two"
    And the number of medium questions is 2
    And the number of hard questions is 1
    When I calculate the weightage
    Then I should see an error message "Error: Invalid input type."

  Scenario: Floating point numbers for inputs
    Given the number of easy questions is 1.5
    And the number of medium questions is 2
    And the number of hard questions is 1
    When I calculate the weightage
    Then I should see an error message "Error: Invalid input values."

  Scenario: Zero questions of all types
    Given the number of easy questions is 0
    And the number of medium questions is 0
    And the number of hard questions is 0
    When I calculate the weightage
    Then I should see an error message "Error: The total number of questions must be exactly 5."

  Scenario: Negative and zero questions combined
    Given the number of easy questions is -1
    And the number of medium questions is 0
    And the number of hard questions is 5
    When I calculate the weightage
    Then I should see an error message "Error: Invalid input values."

  Scenario: Exceeding hard questions
    Given the number of easy questions is 0
    And the number of medium questions is 2
    And the number of hard questions is 4
    When I calculate the weightage
    Then I should see an error message "Error: The total number of questions must be exactly 5."

  Scenario: Mixed questions with valid and invalid counts
    Given the number of easy questions is 3
    And the number of medium questions is "three"
    And the number of hard questions is 1
    When I calculate the weightage
    Then I should see an error message "Error: Invalid input type."




  # Edge Cases
  Scenario: Maximum easy questions with zero others
    Given the number of easy questions is 5
    And the number of medium questions is 0
    And the number of hard questions is 0
    When I calculate the weightage
    Then the Easy Weightage should be 50.0
    And the Medium Weightage should be 0.0
    And the Hard Weightage should be 0.0

  Scenario: Maximum hard questions with zero others
    Given the number of easy questions is 0
    And the number of medium questions is 0
    And the number of hard questions is 5
    When I calculate the weightage
    Then the Easy Weightage should be 0.0
    And the Medium Weightage should be 0.0
    And the Hard Weightage should be 50.0

  Scenario: Mixed questions leading to exact marks
    Given the number of easy questions is 2
    And the number of medium questions is 2
    And the number of hard questions is 1
    When I calculate the weightage
    Then the Easy Weightage should be 14.29
    And the Medium Weightage should be 21.43
    And the Hard Weightage should be 14.29

  Scenario: Equal distribution of questions
    Given the number of easy questions is 2
    And the number of medium questions is 2
    And the number of hard questions is 1
    When I calculate the weightage
    Then the Easy Weightage should be 14.29
    And the Medium Weightage should be 21.43
    And the Hard Weightage should be 14.29

  Scenario: Total weightage less than 50
    Given the number of easy questions is 1
    And the number of medium questions is 1
    And the number of hard questions is 1
    When I calculate the weightage
    Then the Easy Weightage should be 12.5
    And the Medium Weightage should be 12.5
    And the Hard Weightage should be 12.5

  Scenario: All questions contribute to 50 marks
    Given the number of easy questions is 2
    And the number of medium questions is 2
    And the number of hard questions is 1
    When I calculate the weightage
    Then the total weightage should be 50.0

  Scenario: More than 5 questions with zero easy
    Given the number of easy questions is 0
    And the number of medium questions is 3
    And the number of hard questions is 3
    When I calculate the weightage
    Then I should see an error message "Error: The total number of questions must be exactly 5."

  Scenario: Zero questions but invalid input
    Given the number of easy questions is 0
    And the number of medium questions is 0
    And the number of hard questions is "zero"
    When I calculate the weightage
    Then I should see an error message "Error: Invalid input values."

