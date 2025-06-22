Feature: Project Management UI
Purpose: Provide BDD scenarios for listing, creating, updating, and deleting projects from within the SPA.

Scenario: Display existing projects
Given I am authenticated and on the /projects management page
And the GET /projects API returns:
| key | name | db_config |
| projA | Project A | {"uri":"neo4j://...","index":"A"} |
| projB | Project B | {"uri":"neo4j://...","index":"B"} |
When the page finishes loading
Then I see a table with two rows showing keys projA, projB, their names, and configs

Scenario: Create a new project
Given I am on the /projects page
When I click "New Project"
And I fill in name="New KB" and the JSON db_config
And I submit the form
Then the UI sends POST /projects with the entered data
And I see a toast "Project created"
And the new project appears in the list

Scenario: Update an existing project
Given the table shows a project with key="projX" and its current config
When I click the "Edit" button for projX
And I change its db_config value
And I submit the form
Then the UI sends PUT /projects/projX with the updated fields
And I see a toast "Project updated"
And the table row for projX reflects the new config

Scenario: Delete a project
Given the table shows a project with key="projY"
When I click the "Delete" button for projY
And I confirm the deletion prompt
Then the UI sends DELETE /projects/projY
And I see a toast "Project deleted"
And the row for projY is removed from the table

Scenario: Handle API error on load
Given the GET /projects API returns a 500 error
When I load the /projects page
Then I see a toast "Failed to load projects"
And the table is not rendered 