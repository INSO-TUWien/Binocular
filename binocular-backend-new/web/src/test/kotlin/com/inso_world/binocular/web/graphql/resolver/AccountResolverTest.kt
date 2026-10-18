package com.inso_world.binocular.web.graphql.resolver

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.core.integration.base.TestDataProvider
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import com.inso_world.binocular.web.graphql.model.AccountDto
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

/**
 * Test class for verifying the Account resolver functionality.
 * This class extends BaseDbTest to leverage the test data setup.
 */
internal class AccountResolverTest : GraphQlControllerTest() {
    @Autowired
    private lateinit var accountResolver: AccountResolver

    @Nested
    inner class BasicFunctionality {
        @Test
        fun `should retrieve account with all fields`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    account(id: "1") {
                        id
                        platform
                        login
                        name
                        avatarUrl
                        url
                    }
                }
            """,
                    ).execute()
                    .path("account")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify account data
            val expectedAccount = TestDataProvider.testAccounts.first { it.id == "1" }

            assertAll(
                { assertEquals(expectedAccount.id, result.get("id").asText(), "Account ID mismatch") },
                { assertEquals(expectedAccount.platform.toString(), result.get("platform").asText(), "Account platform mismatch") },
                { assertEquals(expectedAccount.login, result.get("login").asText(), "Account login mismatch") },
                { assertEquals(expectedAccount.name, result.get("name").asText(), "Account name mismatch") },
                { assertEquals(expectedAccount.avatarUrl, result.get("avatarUrl").asText(), "Account avatarUrl mismatch") },
                { assertEquals(expectedAccount.url, result.get("url").asText(), "Account url mismatch") },
            )
        }
    }

    @Nested
    inner class RelationshipTests {
        @Test
        fun `should retrieve account with related issues`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    account(id: "1") {
                        id
                        platform
                        login
                        name
                        issues {
                            id
                            iid
                            title
                        }
                    }
                }
            """,
                    ).execute()
                    .path("account")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify account data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Account ID mismatch") },
                { assertEquals("GitHub", result.get("platform").asText(), "Account platform mismatch") },
                { assertEquals("user1", result.get("login").asText(), "Account login mismatch") },
                { assertEquals("User One", result.get("name").asText(), "Account name mismatch") },
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
        fun `should retrieve account with related merge requests`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    account(id: "1") {
                        id
                        platform
                        login
                        name
                        mergeRequests {
                            id
                            iid
                            title
                        }
                    }
                }
            """,
                    ).execute()
                    .path("account")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify account data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Account ID mismatch") },
                { assertEquals("GitHub", result.get("platform").asText(), "Account platform mismatch") },
                { assertEquals("user1", result.get("login").asText(), "Account login mismatch") },
                { assertEquals("User One", result.get("name").asText(), "Account name mismatch") },
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

        @Test
        fun `should retrieve account with related notes`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    account(id: "1") {
                        id
                        platform
                        login
                        name
                        notes {
                            id
                            body
                        }
                    }
                }
            """,
                    ).execute()
                    .path("account")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify account data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Account ID mismatch") },
                { assertEquals("GitHub", result.get("platform").asText(), "Account platform mismatch") },
                { assertEquals("user1", result.get("login").asText(), "Account login mismatch") },
                { assertEquals("User One", result.get("name").asText(), "Account name mismatch") },
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
        fun `issues should return empty list when account id is null`() {
            // Arrange
            val account = AccountDto(id = null, login = "test-user", name = "Test User")

            // Act
            val result = accountResolver.issues(account)

            // Assert
            assertTrue(result.isEmpty(), "Issues list should be empty when account ID is null")
        }

        @Test
        fun `mergeRequests should return empty list when account id is null`() {
            // Arrange
            val account = AccountDto(id = null, login = "test-user", name = "Test User")

            // Act
            val result = accountResolver.mergeRequests(account)

            // Assert
            assertTrue(result.isEmpty(), "Merge requests list should be empty when account ID is null")
        }

        @Test
        fun `notes should return empty list when account id is null`() {
            // Arrange
            val account = AccountDto(id = null, login = "test-user", name = "Test User")

            // Act
            val result = accountResolver.notes(account)

            // Assert
            assertTrue(result.isEmpty(), "Notes list should be empty when account ID is null")
        }
    }
}
