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
 * Test class for MergeRequestController.
 * Tests the functionality of retrieving merge requests with and without pagination,
 * as well as error handling for invalid requests.
 */
internal class MergeRequestControllerWebTest : BaseIntegrationTest() {
    @Nested
    inner class BasicFunctionality : GraphQlControllerTest() {
        @Test
        fun `should return all merge requests`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                mergeRequests(page: 1, perPage: 100) {
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
                    .path("mergeRequests")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(100, result.get("perPage").asInt(), "Expected perPage to be 100")

            // Get the merge requests from the result
            val mergeRequestsData = result.get("data")
            assertEquals(2, mergeRequestsData.size(), "Expected 2 merge requests, but got ${mergeRequestsData.size()}")

            // Check that the merge requests match the test data
            TestDataProvider.testMergeRequests.forEachIndexed { index, expectedMergeRequest ->
                val actualMergeRequest = mergeRequestsData.get(index)

                assertAll(
                    {
                        assertEquals(
                            expectedMergeRequest.id,
                            actualMergeRequest.get("id").asText(),
                            "MergeRequest ID mismatch: expected ${expectedMergeRequest.id}, got ${actualMergeRequest.get("id").asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedMergeRequest.platformIid,
                            actualMergeRequest.get("iid").asInt(),
                            "MergeRequest IID mismatch: expected ${expectedMergeRequest.platformIid}, got ${actualMergeRequest.get("iid").asInt()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedMergeRequest.title,
                            actualMergeRequest.get("title").asText(),
                            "MergeRequest title mismatch: expected ${expectedMergeRequest.title}, got ${actualMergeRequest.get(
                                "title",
                            ).asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedMergeRequest.description,
                            actualMergeRequest.get("description").asText(),
                            "MergeRequest description mismatch: expected ${expectedMergeRequest.description}, got ${actualMergeRequest.get(
                                "description",
                            ).asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedMergeRequest.state,
                            actualMergeRequest.get("state").asText(),
                            "MergeRequest state mismatch: expected ${expectedMergeRequest.state}, got ${actualMergeRequest.get(
                                "state",
                            ).asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedMergeRequest.webUrl,
                            actualMergeRequest.get("webUrl").asText(),
                            "MergeRequest webUrl mismatch: expected ${expectedMergeRequest.webUrl}, got ${actualMergeRequest.get(
                                "webUrl",
                            ).asText()}",
                        )
                    },
                    // Note: labels is an array, so we need to handle it differently
                )
            }
        }

        @Test
        fun `should return merge request by id`() {
            val expectedMergeRequest = TestDataProvider.testMergeRequests.first { it.id == "1" }

            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                mergeRequest(id: "1") {
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
                    .path("mergeRequest")
                    .entity(JsonNode::class.java)
                    .get()

            // Check that the merge request matches the test data
            assertAll(
                {
                    assertEquals(
                        expectedMergeRequest.id,
                        result.get("id").asText(),
                        "MergeRequest ID mismatch: expected ${expectedMergeRequest.id}, got ${result.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.platformIid,
                        result.get("iid").asInt(),
                        "MergeRequest IID mismatch: expected ${expectedMergeRequest.platformIid}, got ${result.get("iid").asInt()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.title,
                        result.get("title").asText(),
                        "MergeRequest title mismatch: expected ${expectedMergeRequest.title}, got ${result.get("title").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.description,
                        result.get("description").asText(),
                        "MergeRequest description mismatch: expected ${expectedMergeRequest.description}, got ${result.get(
                            "description",
                        ).asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.state,
                        result.get("state").asText(),
                        "MergeRequest state mismatch: expected ${expectedMergeRequest.state}, got ${result.get("state").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.webUrl,
                        result.get("webUrl").asText(),
                        "MergeRequest webUrl mismatch: expected ${expectedMergeRequest.webUrl}, got ${result.get("webUrl").asText()}",
                    )
                },
                // Note: labels is an array, so we need to handle it differently
            )
        }
    }

    @Nested
    inner class Pagination : GraphQlControllerTest() {
        @Test
        fun `should return merge requests with pagination`() {
            // Test with page=1, perPage=1 (should return only the first merge request)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                mergeRequests(page: 1, perPage: 1) {
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
                    .path("mergeRequests")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the merge requests from the result
            val mergeRequestsData = result.get("data")
            assertEquals(1, mergeRequestsData.size(), "Expected 1 merge request, but got ${mergeRequestsData.size()}")

            // Check that the merge request matches the first test merge request
            val expectedMergeRequest = TestDataProvider.testMergeRequests.first()
            val actualMergeRequest = mergeRequestsData.get(0)

            assertAll(
                {
                    assertEquals(
                        expectedMergeRequest.id,
                        actualMergeRequest.get("id").asText(),
                        "MergeRequest ID mismatch: expected ${expectedMergeRequest.id}, got ${actualMergeRequest.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.platformIid,
                        actualMergeRequest.get("iid").asInt(),
                        "MergeRequest IID mismatch: expected ${expectedMergeRequest.platformIid}, got ${actualMergeRequest.get("iid").asInt()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.title,
                        actualMergeRequest.get("title").asText(),
                        "MergeRequest title mismatch: expected ${expectedMergeRequest.title}, got ${actualMergeRequest.get(
                            "title",
                        ).asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.description,
                        actualMergeRequest.get("description").asText(),
                        "MergeRequest description mismatch: expected ${expectedMergeRequest.description}, got ${actualMergeRequest.get(
                            "description",
                        ).asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.state,
                        actualMergeRequest.get("state").asText(),
                        "MergeRequest state mismatch: expected ${expectedMergeRequest.state}, got ${actualMergeRequest.get(
                            "state",
                        ).asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.webUrl,
                        actualMergeRequest.get("webUrl").asText(),
                        "MergeRequest webUrl mismatch: expected ${expectedMergeRequest.webUrl}, got ${actualMergeRequest.get(
                            "webUrl",
                        ).asText()}",
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
                mergeRequests {
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
                    .path("mergeRequests")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1 (default)")
            assertEquals(20, result.get("perPage").asInt(), "Expected perPage to be 20 (default)")

            // Get the merge requests from the result
            val mergeRequestsData = result.get("data")
            assertEquals(2, mergeRequestsData.size(), "Expected 2 merge requests, but got ${mergeRequestsData.size()}")
        }

        @Test
        fun `should return second page of merge requests`() {
            // Test with page=2, perPage=1 (should return only the second merge request)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                mergeRequests(page: 2, perPage: 1) {
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
                    .path("mergeRequests")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(2, result.get("page").asInt(), "Expected page to be 2")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the merge requests from the result
            val mergeRequestsData = result.get("data")
            assertEquals(1, mergeRequestsData.size(), "Expected 1 merge request, but got ${mergeRequestsData.size()}")

            // Check that the merge request matches the second test merge request
            val expectedMergeRequest = TestDataProvider.testMergeRequests[1]
            val actualMergeRequest = mergeRequestsData.get(0)

            assertAll(
                {
                    assertEquals(
                        expectedMergeRequest.id,
                        actualMergeRequest.get("id").asText(),
                        "MergeRequest ID mismatch: expected ${expectedMergeRequest.id}, got ${actualMergeRequest.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.platformIid,
                        actualMergeRequest.get("iid").asInt(),
                        "MergeRequest IID mismatch: expected ${expectedMergeRequest.platformIid}, got ${actualMergeRequest.get("iid").asInt()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.title,
                        actualMergeRequest.get("title").asText(),
                        "MergeRequest title mismatch: expected ${expectedMergeRequest.title}, got ${actualMergeRequest.get(
                            "title",
                        ).asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.description,
                        actualMergeRequest.get("description").asText(),
                        "MergeRequest description mismatch: expected ${expectedMergeRequest.description}, got ${actualMergeRequest.get(
                            "description",
                        ).asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.state,
                        actualMergeRequest.get("state").asText(),
                        "MergeRequest state mismatch: expected ${expectedMergeRequest.state}, got ${actualMergeRequest.get(
                            "state",
                        ).asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedMergeRequest.webUrl,
                        actualMergeRequest.get("webUrl").asText(),
                        "MergeRequest webUrl mismatch: expected ${expectedMergeRequest.webUrl}, got ${actualMergeRequest.get(
                            "webUrl",
                        ).asText()}",
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
                  mergeRequests(page: 3, perPage: 1) {
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
                    .path("mergeRequests")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(3, result.get("page").asInt(), "Expected page to be 3")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the merge requests from the result
            val mergeRequestsData = result.get("data")
            assertEquals(
                0,
                mergeRequestsData.size(),
                "Expected 0 merge requests on page beyond available data, but got ${mergeRequestsData.size()}",
            )
        }
    }

    @Nested
    inner class ErrorHandling : GraphQlControllerTest() {
        @Test
        fun `should throw exception for non-existent merge request id`() {
            // Test with a non-existent merge request ID
            val nonExistentId = "999"

            graphQlTester
                .document(
                    """
            query {
                mergeRequest(id: "$nonExistentId") {
                    id
                    iid
                    title
                }
            }
        """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("MergeRequest not found with id: $nonExistentId") ?: false
                }.verify()
        }

        @Test
        fun `should throw exception for invalid pagination parameters`() {
            // Test with invalid page parameter
            graphQlTester
                .document(
                    """
            query {
                mergeRequests(page: 0, perPage: 10) {
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
                mergeRequests(page: 1, perPage: 0) {
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
