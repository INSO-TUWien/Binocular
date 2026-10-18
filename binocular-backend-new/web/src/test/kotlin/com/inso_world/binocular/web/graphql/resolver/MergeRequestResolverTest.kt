package com.inso_world.binocular.web.graphql.resolver

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import com.inso_world.binocular.web.graphql.model.MergeRequestDto
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

/**
 * Test class for verifying the MergeRequest resolver functionality.
 * This class extends GraphQlControllerTest to leverage the test data setup.
 */
internal class MergeRequestResolverTest : GraphQlControllerTest() {
    @Autowired
    private lateinit var mergeRequestResolver: MergeRequestResolver

    @Nested
    inner class BasicFunctionality {
        @Test
        fun `should retrieve merge request with all fields`() {
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
                        createdAt
                        updatedAt
                        closedAt
                        labels
                    }
                }
            """,
                    ).execute()
                    .path("mergeRequest")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify merge request data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "MergeRequest ID mismatch") },
                { assertEquals(201, result.get("iid").asInt(), "MergeRequest IID mismatch") },
                { assertEquals("Implement user authentication", result.get("title").asText(), "MergeRequest title mismatch") },
                { assertEquals("Add JWT auth", result.get("description").asText(), "MergeRequest description mismatch") },
                { assertEquals("open", result.get("state").asText(), "MergeRequest state mismatch") },
                { assertEquals("https://example.com/merge_requests/201", result.get("webUrl").asText(), "MergeRequest webUrl mismatch") },
                { assertTrue(result.get("labels").isArray(), "Labels should be an array") },
                { assertEquals("feature", result.get("labels").get(0).asText(), "First label mismatch") },
                { assertEquals("security", result.get("labels").get(1).asText(), "Second label mismatch") },
            )
        }
    }

    @Nested
    inner class RelationshipTests {
        @Test
        fun `should retrieve merge request with related accounts`() {
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
                        accounts {
                            id
                            platform
                            login
                            name
                        }
                    }
                }
            """,
                    ).execute()
                    .path("mergeRequest")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify merge request data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "MergeRequest ID mismatch") },
                { assertEquals(201, result.get("iid").asInt(), "MergeRequest IID mismatch") },
                { assertEquals("Implement user authentication", result.get("title").asText(), "MergeRequest title mismatch") },
                { assertEquals("Add JWT auth", result.get("description").asText(), "MergeRequest description mismatch") },
                { assertEquals("open", result.get("state").asText(), "MergeRequest state mismatch") },
                { assertEquals("https://example.com/merge_requests/201", result.get("webUrl").asText(), "MergeRequest webUrl mismatch") },
            )

            // Verify accounts
            val accounts = result.get("accounts")
            assertNotNull(accounts, "Accounts should not be null")
            assertEquals(1, accounts.size(), "Should have 1 account")

            val account = accounts.get(0)
            assertAll(
                { assertEquals("1", account.get("id").asText(), "Account ID mismatch") },
                { assertEquals("GitHub", account.get("platform").asText(), "Account platform mismatch") },
                { assertEquals("user1", account.get("login").asText(), "Account login mismatch") },
                { assertEquals("User One", account.get("name").asText(), "Account name mismatch") },
            )
        }

        @Test
        fun `should retrieve merge request with related milestones`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    mergeRequest(id: "1") {
                        id
                        iid
                        title
                        milestones {
                            id
                            iid
                            title
                            description
                        }
                    }
                }
            """,
                    ).execute()
                    .path("mergeRequest")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify merge request data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "MergeRequest ID mismatch") },
                { assertEquals(201, result.get("iid").asInt(), "MergeRequest IID mismatch") },
                { assertEquals("Implement user authentication", result.get("title").asText(), "MergeRequest title mismatch") },
            )

            // Verify milestones
            val milestones = result.get("milestones")
            assertNotNull(milestones, "Milestones should not be null")
            assertEquals(1, milestones.size(), "Should have 1 milestone")

            val milestone = milestones.get(0)
            assertAll(
                { assertEquals("1", milestone.get("id").asText(), "Milestone ID mismatch") },
                { assertEquals(201, milestone.get("iid").asInt(), "Milestone IID mismatch") },
                { assertEquals("Release 1.0", milestone.get("title").asText(), "Milestone title mismatch") },
                { assertEquals("First stable release", milestone.get("description").asText(), "Milestone description mismatch") },
            )
        }

        @Test
        fun `should retrieve merge request with related notes`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    mergeRequest(id: "1") {
                        id
                        iid
                        title
                        notes {
                            id
                            body
                        }
                    }
                }
            """,
                    ).execute()
                    .path("mergeRequest")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify merge request data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "MergeRequest ID mismatch") },
                { assertEquals(201, result.get("iid").asInt(), "MergeRequest IID mismatch") },
                { assertEquals("Implement user authentication", result.get("title").asText(), "MergeRequest title mismatch") },
            )

            // Verify notes
            val notes = result.get("notes")
            assertNotNull(notes, "Notes should not be null")
            assertEquals(1, notes.size(), "Should have 1 note")

            val note = notes.get(0)
            assertAll(
                { assertEquals("1", note.get("id").asText(), "Note ID mismatch") },
                { assertEquals("This is a comment", note.get("body").asText(), "Note body mismatch") },
            )
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `accounts should return empty list when merge request id is null`() {
            // Arrange
            val mergeRequest = MergeRequestDto(id = null, title = "Test Merge Request")

            // Act
            val result = mergeRequestResolver.accounts(mergeRequest)

            // Assert
            assertTrue(result.isEmpty(), "Accounts list should be empty when merge request ID is null")
        }

        @Test
        fun `milestones should return empty list when merge request id is null`() {
            // Arrange
            val mergeRequest = MergeRequestDto(id = null, title = "Test Merge Request")

            // Act
            val result = mergeRequestResolver.milestones(mergeRequest)

            // Assert
            assertTrue(result.isEmpty(), "Milestones list should be empty when merge request ID is null")
        }

        @Test
        fun `notes should return empty list when merge request id is null`() {
            // Arrange
            val mergeRequest = MergeRequestDto(id = null, title = "Test Merge Request")

            // Act
            val result = mergeRequestResolver.notes(mergeRequest)

            // Assert
            assertTrue(result.isEmpty(), "Notes list should be empty when merge request ID is null")
        }

        @Test
        fun `should handle non-existent merge request`() {
            // Create a test query for a merge request that doesn't exist in the test data
            // This should return an error
            graphQlTester
                .document(
                    """
                query {
                    mergeRequest(id: "999") {
                        id
                        iid
                        title
                    }
                }
            """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("MergeRequest not found with id: 999") ?: false
                }.verify()
        }
    }
}
