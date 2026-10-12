package com.inso_world.binocular.web.graphql.controller

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.core.integration.base.BaseIntegrationTest
import com.inso_world.binocular.core.integration.base.TestDataProvider
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/**
 * Test class for IssueController.
 * Tests the functionality of retrieving issues with and without pagination,
 * as well as error handling for invalid requests.
 */
internal class IssueControllerWebTest : BaseIntegrationTest() {
    @Nested
    inner class BasicFunctionality : GraphQlControllerTest() {
        @Test
        fun `should return all issues`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                issues(page: 1, perPage: 100) {
                    count
                    page
                    perPage
                    data {
                        id
                        iid
                        title
                        description
                        state
                        webUrl
                        labels
                    }
                }
            }
        """,
                    ).execute()
                    .path("issues")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(100, result.get("perPage").asInt(), "Expected perPage to be 100")

            // Get the issues from the result
            val issuesData = result.get("data")
            assertEquals(2, issuesData.size(), "Expected 2 issues, but got ${issuesData.size()}")

            // Check that the issues match the test data
            TestDataProvider.testIssues.forEachIndexed { index, expectedIssue ->
                val actualIssue = issuesData.get(index)

                assertAll(
                    {
                        assertEquals(
                            expectedIssue.id,
                            actualIssue.get("id").asText(),
                            "Issue ID mismatch: expected ${expectedIssue.id}, got ${actualIssue.get("id").asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedIssue.platformIid,
                            actualIssue.get("iid").asInt(),
                            "Issue IID mismatch: expected ${expectedIssue.platformIid}, got ${actualIssue.get("iid").asInt()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedIssue.title,
                            actualIssue.get("title").asText(),
                            "Issue title mismatch: expected ${expectedIssue.title}, got ${actualIssue.get("title").asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedIssue.description,
                            actualIssue.get("description").asText(),
                            "Issue description mismatch: expected ${expectedIssue.description}, got ${actualIssue.get(
                                "description",
                            ).asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedIssue.state,
                            actualIssue.get("state").asText(),
                            "Issue state mismatch: expected ${expectedIssue.state}, got ${actualIssue.get("state").asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedIssue.webUrl,
                            actualIssue.get("webUrl").asText(),
                            "Issue webUrl mismatch: expected ${expectedIssue.webUrl}, got ${actualIssue.get("webUrl").asText()}",
                        )
                    },
                    // Note: labels is an array, so we need to handle it differently
                )
            }
        }

        @Test
        fun `should return issue by id`() {
            val expectedIssue = TestDataProvider.testIssues.first { it.id == "1" }

            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                issue(id: "1") {
                    id
                    iid
                    title
                    description
                    state
                    webUrl
                    labels
                }
            }
        """,
                    ).execute()
                    .path("issue")
                    .entity(JsonNode::class.java)
                    .get()

            // Check that the issue matches the test data
            assertAll(
                {
                    assertEquals(
                        expectedIssue.id,
                        result.get("id").asText(),
                        "Issue ID mismatch: expected ${expectedIssue.id}, got ${result.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.platformIid,
                        result.get("iid").asInt(),
                        "Issue IID mismatch: expected ${expectedIssue.platformIid}, got ${result.get("iid").asInt()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.title,
                        result.get("title").asText(),
                        "Issue title mismatch: expected ${expectedIssue.title}, got ${result.get("title").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.description,
                        result.get("description").asText(),
                        "Issue description mismatch: expected ${expectedIssue.description}, got ${result.get("description").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.state,
                        result.get("state").asText(),
                        "Issue state mismatch: expected ${expectedIssue.state}, got ${result.get("state").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.webUrl,
                        result.get("webUrl").asText(),
                        "Issue webUrl mismatch: expected ${expectedIssue.webUrl}, got ${result.get("webUrl").asText()}",
                    )
                },
                // Note: labels is an array, so we need to handle it differently
            )
        }
    }

    @Nested
    inner class Pagination : GraphQlControllerTest() {
        @Test
        fun `should return issues with pagination`() {
            // Test with page=1, perPage=1 (should return only the first issue)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                issues(page: 1, perPage: 1) {
                    count
                    page
                    perPage
                    data {
                        id
                        iid
                        title
                        description
                        state
                        webUrl
                        labels
                    }
                }
            }
        """,
                    ).execute()
                    .path("issues")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the issues from the result
            val issuesData = result.get("data")
            assertEquals(1, issuesData.size(), "Expected 1 issue, but got ${issuesData.size()}")

            // Check that the issue matches the first test issue
            val expectedIssue = TestDataProvider.testIssues.first()
            val actualIssue = issuesData.get(0)

            assertAll(
                {
                    assertEquals(
                        expectedIssue.id,
                        actualIssue.get("id").asText(),
                        "Issue ID mismatch: expected ${expectedIssue.id}, got ${actualIssue.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.platformIid,
                        actualIssue.get("iid").asInt(),
                        "Issue IID mismatch: expected ${expectedIssue.platformIid}, got ${actualIssue.get("iid").asInt()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.title,
                        actualIssue.get("title").asText(),
                        "Issue title mismatch: expected ${expectedIssue.title}, got ${actualIssue.get("title").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.description,
                        actualIssue.get("description").asText(),
                        "Issue description mismatch: expected ${expectedIssue.description}, got ${actualIssue.get("description").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.state,
                        actualIssue.get("state").asText(),
                        "Issue state mismatch: expected ${expectedIssue.state}, got ${actualIssue.get("state").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.webUrl,
                        actualIssue.get("webUrl").asText(),
                        "Issue webUrl mismatch: expected ${expectedIssue.webUrl}, got ${actualIssue.get("webUrl").asText()}",
                    )
                },
                // Note: labels is an array, so we need to handle it differently
            )
        }

        @Test
        fun `should handle null pagination parameters`() {
            // Test with null page and perPage parameters (should use defaults)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                issues {
                    count
                    page
                    perPage
                    data {
                        id
                        iid
                        title
                    }
                }
            }
        """,
                    ).execute()
                    .path("issues")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1 (default)")
            assertEquals(20, result.get("perPage").asInt(), "Expected perPage to be 20 (default)")

            // Get the issues from the result
            val issuesData = result.get("data")
            assertEquals(2, issuesData.size(), "Expected 2 issues, but got ${issuesData.size()}")
        }

        @Test
        fun `should return second page of issues`() {
            // Test with page=2, perPage=1 (should return only the second issue)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                issues(page: 2, perPage: 1) {
                    count
                    page
                    perPage
                    data {
                        id
                        iid
                        title
                        description
                        state
                        webUrl
                        labels
                    }
                }
            }
        """,
                    ).execute()
                    .path("issues")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(2, result.get("page").asInt(), "Expected page to be 2")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the issues from the result
            val issuesData = result.get("data")
            assertEquals(1, issuesData.size(), "Expected 1 issue, but got ${issuesData.size()}")

            // Check that the issue matches the second test issue
            val expectedIssue = TestDataProvider.testIssues[1]
            val actualIssue = issuesData.get(0)

            assertAll(
                {
                    assertEquals(
                        expectedIssue.id,
                        actualIssue.get("id").asText(),
                        "Issue ID mismatch: expected ${expectedIssue.id}, got ${actualIssue.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.platformIid,
                        actualIssue.get("iid").asInt(),
                        "Issue IID mismatch: expected ${expectedIssue.platformIid}, got ${actualIssue.get("iid").asInt()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.title,
                        actualIssue.get("title").asText(),
                        "Issue title mismatch: expected ${expectedIssue.title}, got ${actualIssue.get("title").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.description,
                        actualIssue.get("description").asText(),
                        "Issue description mismatch: expected ${expectedIssue.description}, got ${actualIssue.get("description").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.state,
                        actualIssue.get("state").asText(),
                        "Issue state mismatch: expected ${expectedIssue.state}, got ${actualIssue.get("state").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedIssue.webUrl,
                        actualIssue.get("webUrl").asText(),
                        "Issue webUrl mismatch: expected ${expectedIssue.webUrl}, got ${actualIssue.get("webUrl").asText()}",
                    )
                },
                // Note: labels is an array, so we need to handle it differently
            )
        }

        @Test
        fun `should return empty list for page beyond available data`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
              query {
                  issues(page: 3, perPage: 1) {
                      count
                      page
                      perPage
                      data {
                          id
                          iid
                          title
                          description
                          state
                          webUrl
                          labels
                      }
                  }
              }
          """,
                    ).execute()
                    .path("issues")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(3, result.get("page").asInt(), "Expected page to be 3")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the issues from the result
            val issuesData = result.get("data")
            assertEquals(0, issuesData.size(), "Expected 0 issues on page beyond available data, but got ${issuesData.size()}")
        }
    }

    @Nested
    inner class ErrorHandling : GraphQlControllerTest() {
        @Test
        fun `should throw exception for non-existent issue id`() {
            // Test with a non-existent issue ID
            val nonExistentId = "999"

            graphQlTester
                .document(
                    """
            query {
                issue(id: "$nonExistentId") {
                    id
                    iid
                    title
                }
            }
        """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Issue not found with id: $nonExistentId") ?: false
                }.verify()
        }

        @Test
        fun `should throw exception for invalid pagination parameters`() {
            // Test with invalid page parameter
            graphQlTester
                .document(
                    """
            query {
                issues(page: 0, perPage: 10) {
                    count
                    page
                    perPage
                    data {
                        id
                        iid
                        title
                    }
                }
            }
        """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Page must be greater than or equal to 1") ?: false
                }.verify()

            // Test with invalid perPage parameter
            graphQlTester
                .document(
                    """
            query {
                issues(page: 1, perPage: 0) {
                    count
                    page
                    perPage
                    data {
                        id
                        iid
                        title
                    }
                }
            }
        """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("PerPage must be greater than or equal to 1") ?: false
                }.verify()
        }
    }
}
