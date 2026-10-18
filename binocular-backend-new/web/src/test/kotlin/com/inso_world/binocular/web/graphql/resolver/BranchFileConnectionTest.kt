package com.inso_world.binocular.web.graphql.resolver

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.core.integration.base.TestDataProvider
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/**
 * Test class for verifying the BranchFileConnection edge relationship.
 * This class extends GraphQlControllerTest to leverage the test data setup.
 */
internal class BranchFileConnectionTest : GraphQlControllerTest() {
    @Nested
    inner class BranchToFileRelationship {
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
                                    maxLength
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
                { assertEquals(TestDataProvider.testBranches[0].id, result.get("id").asText(), "Branch ID mismatch") },
                { assertEquals(TestDataProvider.testBranches[0].name, result.get("branch").asText(), "Branch name mismatch") },
                {
                    assertEquals(
                        TestDataProvider.testBranches[0].active,
                        result.get("active").asBoolean(),
                        "Branch active status mismatch",
                    )
                },
                {
                    assertEquals(
                        TestDataProvider.testBranches[0].tracksFileRenames,
                        result.get("tracksFileRenames").asBoolean(),
                        "Branch tracksFileRenames mismatch",
                    )
                },
                {
                    assertEquals(
                        TestDataProvider.testBranches[0].latestCommit,
                        result.get("latestCommit").asText(),
                        "Branch latestCommit mismatch",
                    )
                },
            )

            // Verify files (paginated connection)
            val filesConnection = result.get("files")
            assertNotNull(filesConnection, "Files connection should not be null")
            val files = filesConnection.get("data")
            assertNotNull(files, "Files data should not be null")
            assertEquals(2, files.size(), "Should have 2 files")

            // Create a list of file IDs from the result
            val fileIds =
                (0 until files.size()).map {
                    files
                        .get(it)
                        .get("file")
                        .get("id")
                        .asText()
                }

            // Verify that the file IDs match the expected file IDs
            assertAll(
                { assertTrue(fileIds.contains(TestDataProvider.testFiles[0].id), "Should contain first test file ID") },
                { assertTrue(fileIds.contains(TestDataProvider.testFiles[1].id), "Should contain second test file ID") },
            )
        }

        @Test
        fun `should retrieve second branch with only one file`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    branch(id: "2") {
                        id
                        branch
                        files {
                            data {
                                file {
                                    id
                                    path
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
                { assertEquals(TestDataProvider.testBranches[1].id, result.get("id").asText(), "Branch ID mismatch") },
                { assertEquals(TestDataProvider.testBranches[1].name, result.get("branch").asText(), "Branch name mismatch") },
            )

            // Verify files (paginated connection)
            val filesConnection = result.get("files")
            assertNotNull(filesConnection, "Files connection should not be null")
            val files = filesConnection.get("data")
            assertNotNull(files, "Files data should not be null")
            assertEquals(1, files.size(), "Should have 1 file")

            // Verify the file data
            val file = files.get(0).get("file")
            assertAll(
                { assertEquals(TestDataProvider.testFiles[1].id, file.get("id").asText(), "File ID mismatch") },
                { assertEquals(TestDataProvider.testFiles[1].path, file.get("path").asText(), "File path mismatch") },
            )
        }
    }

    @Nested
    inner class FileToBranchRelationship {
        @Test
        fun `should retrieve file with related branches`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    file(id: "1") {
                        id
                        path
                        webUrl
                        branches {
                            id
                            branch
                        }
                    }
                }
            """,
                    ).execute()
                    .path("file")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify file data
            assertAll(
                { assertEquals(TestDataProvider.testFiles[0].id, result.get("id").asText(), "File ID mismatch") },
                { assertEquals(TestDataProvider.testFiles[0].path, result.get("path").asText(), "File path mismatch") },
                { assertEquals(TestDataProvider.testFiles[0].webUrl, result.get("webUrl").asText(), "File webUrl mismatch") },
            )

            // Verify branches
            val branches = result.get("branches")
            assertNotNull(branches, "Branches should not be null")
            assertEquals(1, branches.size(), "Should have 1 branch")

            // Verify the branch data
            val branch = branches.get(0)
            assertAll(
                { assertEquals(TestDataProvider.testBranches[0].id, branch.get("id").asText(), "Branch ID mismatch") },
                { assertEquals(TestDataProvider.testBranches[0].name, branch.get("branch").asText(), "Branch name mismatch") },
            )
        }

        @Test
        fun `should retrieve second file with related branches`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    file(id: "2") {
                        id
                        path
                        webUrl
                        branches {
                            id
                            branch
                        }
                    }
                }
            """,
                    ).execute()
                    .path("file")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify file data
            assertAll(
                { assertEquals(TestDataProvider.testFiles[1].id, result.get("id").asText(), "File ID mismatch") },
                { assertEquals(TestDataProvider.testFiles[1].path, result.get("path").asText(), "File path mismatch") },
                { assertEquals(TestDataProvider.testFiles[1].webUrl, result.get("webUrl").asText(), "File webUrl mismatch") },
            )

            // Verify branches
            val branches = result.get("branches")
            assertNotNull(branches, "Branches should not be null")
            assertEquals(2, branches.size(), "Should have 2 branches")

            // Create a list of branch IDs from the result
            val branchIds = (0 until branches.size()).map { branches.get(it).get("id").asText() }

            // Verify that the branch IDs match the expected branch IDs
            assertAll(
                { assertTrue(branchIds.contains(TestDataProvider.testBranches[0].id), "Should contain first test branch ID") },
                { assertTrue(branchIds.contains(TestDataProvider.testBranches[1].id), "Should contain second test branch ID") },
            )
        }
    }
}
