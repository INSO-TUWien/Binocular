package com.inso_world.binocular.web.graphql.resolver

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import com.inso_world.binocular.web.graphql.model.NoteDto
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.Instant

/**
 * Test class for verifying the Note resolver functionality.
 * This class extends GraphQlControllerTest to leverage the test data setup.
 */
internal class NoteResolverTest : GraphQlControllerTest() {
    @Autowired
    private lateinit var noteResolver: NoteResolver

    @Nested
    inner class BasicFunctionality {
        @Test
        fun `should retrieve note with all fields`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    note(id: "1") {
                        id
                        body
                        createdAt
                        updatedAt
                        system
                        resolvable
                        internal
                        confidential
                        imported
                        importedFrom
                    }
                }
            """,
                    ).execute()
                    .path("note")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify note data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Note ID mismatch") },
                { assertEquals("This is a comment", result.get("body").asText(), "Note body mismatch") },
                {
                    val expected = Instant.parse("2023-01-01T10:00:00Z")
                    val actual = Instant.parse(result.get("createdAt").asText())
                    assertEquals(expected, actual, "Note createdAt mismatch")
                },
                {
                    val expected = Instant.parse("2023-01-01T10:00:00Z")
                    val actual = Instant.parse(result.get("updatedAt").asText())
                    assertEquals(expected, actual, "Note updatedAt mismatch")
                },
                { assertEquals(false, result.get("system").asBoolean(), "Note system mismatch") },
                { assertEquals(true, result.get("resolvable").asBoolean(), "Note resolvable mismatch") },
                { assertEquals(false, result.get("internal").asBoolean(), "Note internal mismatch") },
                { assertEquals(false, result.get("confidential").asBoolean(), "Note confidential mismatch") },
                { assertEquals(false, result.get("imported").asBoolean(), "Note imported mismatch") },
                { assertEquals("gitlab", result.get("importedFrom").asText(), "Note importedFrom mismatch") },
            )
        }
    }

    @Nested
    inner class RelationshipTests {
        @Test
        fun `should retrieve note with related accounts`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    note(id: "1") {
                        id
                        body
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
                    .path("note")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify note data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Note ID mismatch") },
                { assertEquals("This is a comment", result.get("body").asText(), "Note body mismatch") },
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
        fun `should retrieve note with related issues`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    note(id: "1") {
                        id
                        body
                        issues {
                            id
                            iid
                            title
                        }
                    }
                }
            """,
                    ).execute()
                    .path("note")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify note data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Note ID mismatch") },
                { assertEquals("This is a comment", result.get("body").asText(), "Note body mismatch") },
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
            )
        }

        @Test
        fun `should retrieve note with related merge requests`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    note(id: "1") {
                        id
                        body
                        mergeRequests {
                            id
                            iid
                            title
                        }
                    }
                }
            """,
                    ).execute()
                    .path("note")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify note data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Note ID mismatch") },
                { assertEquals("This is a comment", result.get("body").asText(), "Note body mismatch") },
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
            )
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `accounts should return empty list when note id is null`() {
            // Arrange
            val note = NoteDto(id = null, body = "Test Note")

            // Act
            val result = noteResolver.accounts(note)

            // Assert
            assertTrue(result.isEmpty(), "Accounts list should be empty when note ID is null")
        }

        @Test
        fun `issues should return empty list when note id is null`() {
            // Arrange
            val note = NoteDto(id = null, body = "Test Note")

            // Act
            val result = noteResolver.issues(note)

            // Assert
            assertTrue(result.isEmpty(), "Issues list should be empty when note ID is null")
        }

        @Test
        fun `mergeRequests should return empty list when note id is null`() {
            // Arrange
            val note = NoteDto(id = null, body = "Test Note")

            // Act
            val result = noteResolver.mergeRequests(note)

            // Assert
            assertTrue(result.isEmpty(), "Merge requests list should be empty when note ID is null")
        }

        @Test
        fun `should handle non-existent note`() {
            // Create a test query for a note that doesn't exist in the test data
            // This should return an error
            graphQlTester
                .document(
                    """
                query {
                    note(id: "999") {
                        id
                        body
                    }
                }
            """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Note not found with id: 999") ?: false
                }.verify()
        }
    }
}
