package com.inso_world.binocular.web.graphql.resolver

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import com.inso_world.binocular.web.graphql.model.MilestoneDto
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

/**
 * Test class for verifying the Milestone resolver functionality.
 * This class extends GraphQlControllerTest to leverage the test data setup.
 */
internal class MilestoneResolverTest : GraphQlControllerTest() {
    @Autowired
    private lateinit var milestoneResolver: MilestoneResolver

    @Nested
    inner class BasicFunctionality {
        @Test
        fun `should retrieve milestone with all fields`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    milestone(id: "1") {
                        id
                        iid
                        title
                        description
                        createdAt
                        updatedAt
                        startDate
                        dueDate
                        state
                        expired
                        webUrl
                    }
                }
            """,
                    ).execute()
                    .path("milestone")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify milestone data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Milestone ID mismatch") },
                { assertEquals(201, result.get("iid").asInt(), "Milestone IID mismatch") },
                { assertEquals("Release 1.0", result.get("title").asText(), "Milestone title mismatch") },
                { assertEquals("First stable release", result.get("description").asText(), "Milestone description mismatch") },
                { assertEquals("2023-01-01T10:00:00.000Z", result.get("createdAt").asText(), "Milestone createdAt mismatch") },
                { assertEquals("2023-01-10T15:30:00.000Z", result.get("updatedAt").asText(), "Milestone updatedAt mismatch") },
                { assertEquals("2023-01-15T00:00:00.000Z", result.get("startDate").asText(), "Milestone startDate mismatch") },
                { assertEquals("2023-02-15T00:00:00.000Z", result.get("dueDate").asText(), "Milestone dueDate mismatch") },
                { assertEquals("active", result.get("state").asText(), "Milestone state mismatch") },
                { assertEquals(false, result.get("expired").asBoolean(), "Milestone expired mismatch") },
                { assertEquals("https://example.com/milestones/1", result.get("webUrl").asText(), "Milestone webUrl mismatch") },
            )
        }
    }

    @Nested
    inner class RelationshipTests {
        @Test
        fun `should retrieve milestone with related issues`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    milestone(id: "1") {
                        id
                        iid
                        title
                        description
                        state
                        webUrl
                        issues {
                            id
                            iid
                            title
                            description
                        }
                    }
                }
            """,
                    ).execute()
                    .path("milestone")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify milestone data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Milestone ID mismatch") },
                { assertEquals(201, result.get("iid").asInt(), "Milestone IID mismatch") },
                { assertEquals("Release 1.0", result.get("title").asText(), "Milestone title mismatch") },
                { assertEquals("First stable release", result.get("description").asText(), "Milestone description mismatch") },
                { assertEquals("active", result.get("state").asText(), "Milestone state mismatch") },
                { assertEquals("https://example.com/milestones/1", result.get("webUrl").asText(), "Milestone webUrl mismatch") },
            )

            // Verify issues
            val issues = result.get("issues")
            assertNotNull(issues, "Issues should not be null")
            assertEquals(1, issues.size(), "Should have 1 issue")

            val issue = issues.get(0)
            assertAll(
                { assertEquals("1", issue.get("id").asText(), "Issue ID mismatch") },
                { assertEquals(101, issue.get("iid").asInt(), "Issue IID mismatch") },
                { assertEquals("Fix bug in login flow", issue.get("title").asText(), "Issue title mismatch") },
                { assertEquals("Users are unable to log in...", issue.get("description").asText(), "Issue description mismatch") },
            )
        }

        @Test
        fun `should retrieve milestone with related merge requests`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    milestone(id: "1") {
                        id
                        iid
                        title
                        description
                        mergeRequests {
                            id
                            iid
                            title
                            description
                        }
                    }
                }
            """,
                    ).execute()
                    .path("milestone")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify milestone data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Milestone ID mismatch") },
                { assertEquals(201, result.get("iid").asInt(), "Milestone IID mismatch") },
                { assertEquals("Release 1.0", result.get("title").asText(), "Milestone title mismatch") },
                { assertEquals("First stable release", result.get("description").asText(), "Milestone description mismatch") },
            )

            // Verify merge requests
            val mergeRequests = result.get("mergeRequests")
            assertNotNull(mergeRequests, "Merge requests should not be null")
            assertEquals(1, mergeRequests.size(), "Should have 1 merge request")

            val mergeRequest = mergeRequests.get(0)
            assertAll(
                { assertEquals("1", mergeRequest.get("id").asText(), "Merge request ID mismatch") },
                { assertEquals(201, mergeRequest.get("iid").asInt(), "Merge request IID mismatch") },
                { assertEquals("Implement user authentication", mergeRequest.get("title").asText(), "Merge request title mismatch") },
                { assertEquals("Add JWT auth", mergeRequest.get("description").asText(), "Merge request description mismatch") },
            )
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `issues should return empty list when milestone id is null`() {
            // Arrange
            val milestone = MilestoneDto(id = null, title = "Test Milestone")

            // Act
            val result = milestoneResolver.issues(milestone)

            // Assert
            assertTrue(result.isEmpty(), "Issues list should be empty when milestone ID is null")
        }

        @Test
        fun `mergeRequests should return empty list when milestone id is null`() {
            // Arrange
            val milestone = MilestoneDto(id = null, title = "Test Milestone")

            // Act
            val result = milestoneResolver.mergeRequests(milestone)

            // Assert
            assertTrue(result.isEmpty(), "Merge requests list should be empty when milestone ID is null")
        }

        @Test
        fun `should handle non-existent milestone`() {
            // Create a test query for a milestone that doesn't exist in the test data
            // This should return an error
            graphQlTester
                .document(
                    """
                query {
                    milestone(id: "999") {
                        id
                        iid
                        title
                    }
                }
            """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Milestone not found with id: 999") ?: false
                }.verify()
        }
    }
}
