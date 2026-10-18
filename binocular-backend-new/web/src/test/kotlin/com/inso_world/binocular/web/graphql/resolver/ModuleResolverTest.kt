package com.inso_world.binocular.web.graphql.resolver

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import com.inso_world.binocular.web.graphql.model.ModuleDto
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

/**
 * Test class for verifying the Module resolver functionality.
 * This class extends GraphQlControllerTest to leverage the test data setup.
 */
internal class ModuleResolverTest : GraphQlControllerTest() {
    @Autowired
    private lateinit var moduleResolver: ModuleResolver

    @Nested
    inner class BasicFunctionality {
        @Test
        fun `should retrieve module with all fields`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    module(id: "1") {
                        id
                        path
                    }
                }
            """,
                    ).execute()
                    .path("module")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify module data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Module ID mismatch") },
                { assertEquals("src/main/kotlin/com/example/core", result.get("path").asText(), "Module path mismatch") },
            )
        }
    }

    @Nested
    inner class RelationshipTests {
        @Test
        fun `should retrieve module with related commits`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    module(id: "1") {
                        id
                        path
                        commits {
                            id
                            sha
                            message
                        }
                    }
                }
            """,
                    ).execute()
                    .path("module")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify module data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Module ID mismatch") },
                { assertEquals("src/main/kotlin/com/example/core", result.get("path").asText(), "Module path mismatch") },
            )

            // Verify commits
            val commits = result.get("commits")
            assertNotNull(commits, "Commits should not be null")
            assertEquals(1, commits.size(), "Should have 1 commit")

            val commit = commits.get(0)
            assertAll(
                { assertEquals("1", commit.get("id").asText(), "Commit ID mismatch") },
                { assertEquals("abc1230000000000000000000000000000000000", commit.get("sha").asText(), "Commit SHA mismatch") },
                { assertEquals("First commit", commit.get("message").asText(), "Commit message mismatch") },
            )
        }

        @Test
        fun `should retrieve module with related files`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    module(id: "1") {
                        id
                        path
                        files {
                            id
                            path
                            webUrl
                        }
                    }
                }
            """,
                    ).execute()
                    .path("module")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify module data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Module ID mismatch") },
                { assertEquals("src/main/kotlin/com/example/core", result.get("path").asText(), "Module path mismatch") },
            )

            // Verify files
            val files = result.get("files")
            assertNotNull(files, "Files should not be null")
            assertEquals(1, files.size(), "Should have 1 file")

            val file = files.get(0)
            assertAll(
                { assertEquals("1", file.get("id").asText(), "File ID mismatch") },
                { assertEquals("src/main/kotlin/com/example/Main.kt", file.get("path").asText(), "File path mismatch") },
                { assertEquals("https://example.com/files/Main.kt", file.get("webUrl").asText(), "File webUrl mismatch") },
            )
        }

        @Test
        fun `should retrieve module with child modules`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    module(id: "1") {
                        id
                        path
                        childModules {
                            id
                            path
                        }
                    }
                }
            """,
                    ).execute()
                    .path("module")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify module data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Module ID mismatch") },
                { assertEquals("src/main/kotlin/com/example/core", result.get("path").asText(), "Module path mismatch") },
            )

            // Verify child modules
            val childModules = result.get("childModules")
            assertNotNull(childModules, "Child modules should not be null")
            assertEquals(1, childModules.size(), "Should have 1 child module")

            val childModule = childModules.get(0)
            assertAll(
                { assertEquals("2", childModule.get("id").asText(), "Child module ID mismatch") },
                { assertEquals("src/main/kotlin/com/example/api", childModule.get("path").asText(), "Child module path mismatch") },
            )
        }

        @Test
        fun `should retrieve module with parent modules`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    module(id: "2") {
                        id
                        path
                        parentModules {
                            id
                            path
                        }
                    }
                }
            """,
                    ).execute()
                    .path("module")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify module data
            assertAll(
                { assertEquals("2", result.get("id").asText(), "Module ID mismatch") },
                { assertEquals("src/main/kotlin/com/example/api", result.get("path").asText(), "Module path mismatch") },
            )

            // Verify parent modules
            val parentModules = result.get("parentModules")
            assertNotNull(parentModules, "Parent modules should not be null")
            assertEquals(1, parentModules.size(), "Should have 1 parent module")

            val parentModule = parentModules.get(0)
            assertAll(
                { assertEquals("1", parentModule.get("id").asText(), "Parent module ID mismatch") },
                { assertEquals("src/main/kotlin/com/example/core", parentModule.get("path").asText(), "Parent module path mismatch") },
            )
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `commits should return empty list when module id is null`() {
            // Arrange
            val module = ModuleDto(id = null, path = "src/main")

            // Act
            val result = moduleResolver.commits(module)

            // Assert
            assertTrue(result.isEmpty(), "Commits list should be empty when module ID is null")
        }

        @Test
        fun `files should return empty list when module id is null`() {
            // Arrange
            val module = ModuleDto(id = null, path = "src/main")

            // Act
            val result = moduleResolver.files(module)

            // Assert
            assertTrue(result.isEmpty(), "Files list should be empty when module ID is null")
        }

        @Test
        fun `childModules should return empty list when module id is null`() {
            // Arrange
            val module = ModuleDto(id = null, path = "src/main")

            // Act
            val result = moduleResolver.childModules(module)

            // Assert
            assertTrue(result.isEmpty(), "Child modules list should be empty when module ID is null")
        }

        @Test
        fun `parentModules should return empty list when module id is null`() {
            // Arrange
            val module = ModuleDto(id = null, path = "src/main")

            // Act
            val result = moduleResolver.parentModules(module)

            // Assert
            assertTrue(result.isEmpty(), "Parent modules list should be empty when module ID is null")
        }

        @Test
        fun `should handle non-existent module`() {
            // Create a test query for a module that doesn't exist in the test data
            // This should return an error
            graphQlTester
                .document(
                    """
                query {
                    module(id: "999") {
                        id
                        path
                    }
                }
            """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Module not found with id: 999") ?: false
                }.verify()
        }
    }
}
