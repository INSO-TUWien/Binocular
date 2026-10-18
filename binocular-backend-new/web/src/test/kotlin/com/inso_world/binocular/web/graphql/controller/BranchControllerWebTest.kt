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
 * Test class for BranchController.
 * Tests the functionality of retrieving branches with and without pagination,
 * as well as error handling for invalid requests.
 */
internal class BranchControllerWebTest : BaseIntegrationTest() {
    @Nested
    internal inner class BasicFunctionality : GraphQlControllerTest() {
        @Test
        fun `should return all branches`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                branches(page: 1, perPage: 100) {
                    count
                    page
                    perPage
                    data {
                        id
                        branch
                        active
                        tracksFileRenames
                        latestCommit
                    }
                }
            }
        """,
                    ).execute()
                    .path("branches")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(100, result.get("perPage").asInt(), "Expected perPage to be 100")

            // Get the branches from the result
            val branchesData = result.get("data")
            assertEquals(2, branchesData.size(), "Expected 2 branches, but got ${branchesData.size()}")

            // Check that the branches match the test data
            TestDataProvider.testBranches.asReversed().forEachIndexed { index, expectedBranch ->
                val actualBranch = branchesData.get(index)

                assertAll(
                    {
                        assertEquals(
                            expectedBranch.id,
                            actualBranch.get("id").asText(),
                            "Branch ID mismatch: expected ${expectedBranch.id}, got ${actualBranch.get("id").asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedBranch.name,
                            actualBranch.get("branch").asText(),
                            "Branch name mismatch: expected ${expectedBranch.name}, got ${actualBranch.get("branch").asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedBranch.active,
                            actualBranch.get("active").asBoolean(),
                            "Branch active mismatch: expected ${expectedBranch.active}, got ${actualBranch.get("active").asBoolean()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedBranch.tracksFileRenames,
                            actualBranch.get("tracksFileRenames").asBoolean(),
                            "Branch tracksFileRenames mismatch: expected ${expectedBranch.tracksFileRenames}, got ${actualBranch.get(
                                "tracksFileRenames",
                            ).asBoolean()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedBranch.latestCommit,
                            actualBranch.get("latestCommit").asText(),
                            "Branch latestCommit mismatch: expected ${expectedBranch.latestCommit}, got ${actualBranch.get(
                                "latestCommit",
                            ).asText()}",
                        )
                    },
                )
            }
        }

        @Test
        fun `should return branch by id`() {
            val expectedBranch = TestDataProvider.testBranches.first { it.id == "1" }

            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                branch(id: "1") {
                    id
                    branch
                    active
                    tracksFileRenames
                    latestCommit
                }
            }
        """,
                    ).execute()
                    .path("branch")
                    .entity(JsonNode::class.java)
                    .get()

            // Check that the branch matches the test data
            assertAll(
                {
                    assertEquals(
                        expectedBranch.id,
                        result.get("id").asText(),
                        "Branch ID mismatch: expected ${expectedBranch.id}, got ${result.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.name,
                        result.get("branch").asText(),
                        "Branch name mismatch: expected ${expectedBranch.name}, got ${result.get("branch").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.active,
                        result.get("active").asBoolean(),
                        "Branch active mismatch: expected ${expectedBranch.active}, got ${result.get("active").asBoolean()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.tracksFileRenames,
                        result.get("tracksFileRenames").asBoolean(),
                        "Branch tracksFileRenames mismatch: expected ${expectedBranch.tracksFileRenames}, got ${result.get(
                            "tracksFileRenames",
                        ).asBoolean()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.latestCommit,
                        result.get("latestCommit").asText(),
                        "Branch latestCommit mismatch: expected ${expectedBranch.latestCommit}, got ${result.get("latestCommit").asText()}",
                    )
                },
            )
        }
    }

    @Nested
    inner class Pagination : GraphQlControllerTest() {
        @Test
        fun `should return branches with pagination`() {
            // Test with page=1, perPage=1 (should return only the first branch)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                branches(page: 1, perPage: 1) {
                    count
                    page
                    perPage
                    data {
                        id
                        branch
                        active
                        tracksFileRenames
                    }
                }
            }
        """,
                    ).execute()
                    .path("branches")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the branches from the result
            val branchesData = result.get("data")
            assertEquals(1, branchesData.size(), "Expected 1 branch, but got ${branchesData.size()}")

            // Check that the branch matches the first test branch
            val expectedBranch =
                TestDataProvider.testBranches
                    .sortedBy { it.name ?: "" }
                    .first()
            val actualBranch = branchesData.get(0)

            assertAll(
                {
                    assertEquals(
                        expectedBranch.id,
                        actualBranch.get("id").asText(),
                        "Branch ID mismatch: expected ${expectedBranch.id}, got ${actualBranch.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.name,
                        actualBranch.get("branch").asText(),
                        "Branch name mismatch: expected ${expectedBranch.name}, got ${actualBranch.get("branch").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.active,
                        actualBranch.get("active").asBoolean(),
                        "Branch active mismatch: expected ${expectedBranch.active}, got ${actualBranch.get("active").asBoolean()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.tracksFileRenames,
                        actualBranch.get("tracksFileRenames").asBoolean(),
                        "Branch tracksFileRenames mismatch: expected ${expectedBranch.tracksFileRenames}, got ${actualBranch.get(
                            "tracksFileRenames",
                        ).asBoolean()}",
                    )
                },
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
                branches {
                    count
                    page
                    perPage
                    data {
                        id
                        branch
                        active
                    }
                }
            }
        """,
                    ).execute()
                    .path("branches")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1 (default)")
            assertEquals(20, result.get("perPage").asInt(), "Expected perPage to be 20 (default)")

            // Get the branches from the result
            val branchesData = result.get("data")
            assertEquals(2, branchesData.size(), "Expected 2 branches, but got ${branchesData.size()}")
        }

        @Test
        fun `should return second page of branches`() {
            // Test with page=2, perPage=1 (should return only the second branch)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                branches(page: 2, perPage: 1) {
                    count
                    page
                    perPage
                    data {
                        id
                        branch
                        active
                    }
                }
            }
        """,
                    ).execute()
                    .path("branches")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(2, result.get("page").asInt(), "Expected page to be 2")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the branches from the result
            val branchesData = result.get("data")
            assertEquals(1, branchesData.size(), "Expected 1 branch, but got ${branchesData.size()}")

            // Check that the branch matches the second test branch
            val expectedBranch =
                TestDataProvider.testBranches
                    .sortedBy { it.name ?: "" }
                    .drop(1)
                    .first()
            val actualBranch = branchesData.get(0)

            assertAll(
                {
                    assertEquals(
                        expectedBranch.id,
                        actualBranch.get("id").asText(),
                        "Branch ID mismatch: expected ${expectedBranch.id}, got ${actualBranch.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.name,
                        actualBranch.get("branch").asText(),
                        "Branch name mismatch: expected ${expectedBranch.name}, got ${actualBranch.get("branch").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedBranch.active,
                        actualBranch.get("active").asBoolean(),
                        "Branch active mismatch: expected ${expectedBranch.active}, got ${actualBranch.get("active").asBoolean()}",
                    )
                },
            )
        }

        @Test
        fun `should return empty list for page beyond available data`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
              query {
                  branches(page: 3, perPage: 1) {
                      count
                      page
                      perPage
                      data {
                          id
                          branch
                          active
                      }
                  }
              }
          """,
                    ).execute()
                    .path("branches")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(3, result.get("page").asInt(), "Expected page to be 3")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the branches from the result
            val branchesData = result.get("data")
            assertEquals(0, branchesData.size(), "Expected 0 branches on page beyond available data, but got ${branchesData.size()}")
        }
    }

    @Nested
    inner class ErrorHandling : GraphQlControllerTest() {
        @Test
        fun `should throw exception for non-existent branch id`() {
            // Test with a non-existent branch ID
            val nonExistentId = "999"

            graphQlTester
                .document(
                    """
            query {
                branch(id: "$nonExistentId") {
                    id
                    branch
                    active
                }
            }
        """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Branch not found with id: $nonExistentId") ?: false
                }.verify()
        }

        @Test
        fun `should throw exception for invalid pagination parameters`() {
            // Test with invalid page parameter
            graphQlTester
                .document(
                    """
            query {
                branches(page: 0, perPage: 10) {
                    count
                    page
                    perPage
                    data {
                        id
                        branch
                        active
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
                branches(page: 1, perPage: 0) {
                    count
                    page
                    perPage
                    data {
                        id
                        branch
                        active
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
