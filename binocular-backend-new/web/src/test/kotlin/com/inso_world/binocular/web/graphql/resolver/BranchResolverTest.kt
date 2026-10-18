package com.inso_world.binocular.web.graphql.resolver

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import com.inso_world.binocular.web.graphql.model.BranchDto
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

/**
 * Test class for verifying the Branch resolver functionality.
 * This class extends GraphQlControllerTest to leverage the test data setup.
 */
internal class BranchResolverTest : GraphQlControllerTest() {
    @Autowired
    private lateinit var branchResolver: BranchResolver

    @Nested
    inner class BasicFunctionality {
        @Test
        fun `should retrieve branch with all fields`() {
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

            // Verify branch data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Branch ID mismatch") },
                { assertEquals("main", result.get("branch").asText(), "Branch name mismatch") },
                { assertEquals(true, result.get("active").asBoolean(), "Branch active status mismatch") },
                { assertEquals(true, result.get("tracksFileRenames").asBoolean(), "Branch tracksFileRenames mismatch") },
                {
                    assertEquals(
                        "abc1230000000000000000000000000000000000",
                        result.get("latestCommit").asText(),
                        "Branch latestCommit mismatch"
                    )
                },
            )
        }
    }

    @Nested
    inner class RelationshipTests {
        @Test
        fun `should retrieve branch with related files`() {
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
                        files {
                            count
                            page
                            perPage
                            data {
                                file {
                                    id
                                    path
                                    webUrl
                                }
                            }
                        }
                    }
                }
            """,
                    ).execute()
                    .path("branch")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify branch data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Branch ID mismatch") },
                { assertEquals("main", result.get("branch").asText(), "Branch name mismatch") },
                { assertEquals(true, result.get("active").asBoolean(), "Branch active status mismatch") },
                { assertEquals(true, result.get("tracksFileRenames").asBoolean(), "Branch tracksFileRenames mismatch") },
                {
                    assertEquals(
                        "abc1230000000000000000000000000000000000",
                        result.get("latestCommit").asText(),
                        "Branch latestCommit mismatch"
                    )
                },
            )

            // Verify files (paginated connection)
            val filesConnection = result.get("files")
            assertNotNull(filesConnection, "Files connection should not be null")
            val files = filesConnection.get("data")
            assertNotNull(files, "Files data should not be null")
            assertEquals(2, files.size(), "Should have 2 files")

            // Create a list of file paths from the result
            val filePaths =
                (0 until files.size()).map {
                    files
                        .get(it)
                        .get("file")
                        .get("path")
                        .asText()
                }

            // Verify that both files are present
            assertAll(
                { assertTrue(filePaths.contains("src/main/kotlin/com/example/Main.kt"), "Should contain Main.kt file") },
                { assertTrue(filePaths.contains("src/main/kotlin/com/example/Utils.kt"), "Should contain Utils.kt file") },
            )
        }

        @Test
        fun `should retrieve second branch with related files`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    branch(id: "2") {
                        id
                        branch
                        active
                        tracksFileRenames
                        latestCommit
                        files {
                            count
                            page
                            perPage
                            data {
                                file {
                                    id
                                    path
                                    webUrl
                                }
                            }
                        }
                    }
                }
            """,
                    ).execute()
                    .path("branch")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify branch data
            assertAll(
                { assertEquals("2", result.get("id").asText(), "Branch ID mismatch") },
                { assertEquals("feature/new-feature", result.get("branch").asText(), "Branch name mismatch") },
                { assertEquals(true, result.get("active").asBoolean(), "Branch active status mismatch") },
                { assertEquals(false, result.get("tracksFileRenames").asBoolean(), "Branch tracksFileRenames mismatch") },
                {
                    assertEquals(
                        "def4560000000000000000000000000000000000",
                        result.get("latestCommit").asText(),
                        "Branch latestCommit mismatch"
                    )
                },
            )

            // Verify files (paginated connection)
            val filesConnection = result.get("files")
            assertNotNull(filesConnection, "Files connection should not be null")
            val files = filesConnection.get("data")
            assertNotNull(files, "Files data should not be null")
            assertTrue(files.size() >= 1, "Should have at least 1 file")

            // Ensure expected file is present among results
            val filePaths =
                (0 until files.size()).map {
                    files
                        .get(it)
                        .get("file")
                        .get("path")
                        .asText()
                }
            assertTrue(filePaths.contains("src/main/kotlin/com/example/Utils.kt"), "Should contain Utils.kt file")
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `files should return empty list when branch id is null`() {
            // Arrange
            val branch = BranchDto(id = null, branch = "main")

            // Act
            val result = branchResolver.files(branch, null, null, null)

            // Assert
            assertTrue(result.data.isEmpty(), "Files list should be empty when branch ID is null")
            assertEquals(0, result.count, "Count should be 0")
        }

        @Test
        fun `should handle non-existent branch`() {
            // Create a test query for a branch that doesn't exist in the test data
            // This should return an error
            graphQlTester
                .document(
                    """
                query {
                    branch(id: "999") {
                        id
                        branch
                        files {
                            count
                            data { file { id path } }
                        }
                    }
                }
            """,
                ).execute()
                .errors()
                .expect { error -> error.message?.contains("Branch not found") == true }
                .verify()
        }
    }
}
