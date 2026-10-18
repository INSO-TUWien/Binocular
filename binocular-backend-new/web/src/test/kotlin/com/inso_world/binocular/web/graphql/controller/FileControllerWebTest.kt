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
 * Test class for FileController.
 * Tests the functionality of retrieving files with and without pagination,
 * as well as error handling for invalid requests.
 */
internal class FileControllerWebTest : BaseIntegrationTest() {
    @Nested
    inner class BasicFunctionality : GraphQlControllerTest() {
        @Test
        fun `should return all files`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                files(page: 1, perPage: 100) {
                    count
                    page
                    perPage
                    data {
                        id
                        path
                        webUrl
                    }
                }
            }
        """,
                    ).execute()
                    .path("files")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(100, result.get("perPage").asInt(), "Expected perPage to be 100")

            // Get the files from the result
            val filesData = result.get("data")
            assertEquals(2, filesData.size(), "Expected 2 files, but got ${filesData.size()}")

            // Check that the files match the test data
            TestDataProvider.testFiles.reversed().forEachIndexed { index, expectedFile ->
                val actualFile = filesData.get(index)

                assertAll(
                    {
                        assertEquals(
                            expectedFile.id,
                            actualFile.get("id").asText(),
                            "File ID mismatch: expected ${expectedFile.id}, got ${actualFile.get("id").asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedFile.path,
                            actualFile.get("path").asText(),
                            "File path mismatch: expected ${expectedFile.path}, got ${actualFile.get("path").asText()}",
                        )
                    },
                    {
                        assertEquals(
                            expectedFile.webUrl,
                            actualFile.get("webUrl").asText(),
                            "File webUrl mismatch: expected ${expectedFile.webUrl}, got ${actualFile.get("webUrl").asText()}",
                        )
                    },
                )
            }
        }

        @Test
        fun `should return file by id`() {
            val expectedFile = TestDataProvider.testFiles.first { it.id == "1" }

            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                file(id: "1") {
                    id
                    path
                    webUrl
                }
            }
        """,
                    ).execute()
                    .path("file")
                    .entity(JsonNode::class.java)
                    .get()

            // Check that the file matches the test data
            assertAll(
                {
                    assertEquals(
                        expectedFile.id,
                        result.get("id").asText(),
                        "File ID mismatch: expected ${expectedFile.id}, got ${result.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedFile.path,
                        result.get("path").asText(),
                        "File path mismatch: expected ${expectedFile.path}, got ${result.get("path").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedFile.webUrl,
                        result.get("webUrl").asText(),
                        "File webUrl mismatch: expected ${expectedFile.webUrl}, got ${result.get("webUrl").asText()}",
                    )
                },
            )
        }
    }

    @Nested
    inner class Pagination : GraphQlControllerTest() {
        @Test
        fun `should return files with pagination`() {
            // Test with page=1, perPage=1 (should return only the first file)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                files(page: 1, perPage: 1) {
                    count
                    page
                    perPage
                    data {
                        id
                        path
                        webUrl
                    }
                }
            }
        """,
                    ).execute()
                    .path("files")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the files from the result
            val filesData = result.get("data")
            assertEquals(1, filesData.size(), "Expected 1 file, but got ${filesData.size()}")

            // With new default sort (path DESC), compute expected first item accordingly
            val expectedFile = TestDataProvider.testFiles.maxByOrNull { it.path ?: "" }!!
            val actualFile = filesData.get(0)

            assertAll(
                {
                    assertEquals(
                        expectedFile.id,
                        actualFile.get("id").asText(),
                        "File ID mismatch: expected ${expectedFile.id}, got ${actualFile.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedFile.path,
                        actualFile.get("path").asText(),
                        "File path mismatch: expected ${expectedFile.path}, got ${actualFile.get("path").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedFile.webUrl,
                        actualFile.get("webUrl").asText(),
                        "File webUrl mismatch: expected ${expectedFile.webUrl}, got ${actualFile.get("webUrl").asText()}",
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
                files {
                    count
                    page
                    perPage
                    data {
                        id
                        path
                        webUrl
                    }
                }
            }
        """,
                    ).execute()
                    .path("files")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1 (default)")
            assertEquals(20, result.get("perPage").asInt(), "Expected perPage to be 20 (default)")

            // Get the files from the result
            val filesData = result.get("data")
            assertEquals(2, filesData.size(), "Expected 2 files, but got ${filesData.size()}")
        }

        @Test
        fun `should return second page of files`() {
            // Test with page=2, perPage=1 (should return only the second file)
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
            query {
                files(page: 2, perPage: 1) {
                    count
                    page
                    perPage
                    data {
                        id
                        path
                        webUrl
                    }
                }
            }
        """,
                    ).execute()
                    .path("files")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(2, result.get("page").asInt(), "Expected page to be 2")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the files from the result
            val filesData = result.get("data")
            assertEquals(1, filesData.size(), "Expected 1 file, but got ${filesData.size()}")

            // With new default sort (path DESC), compute expected second item accordingly
            val expectedFile =
                TestDataProvider.testFiles
                    .sortedByDescending { it.path ?: "" }
                    .drop(1)
                    .first()
            val actualFile = filesData.get(0)

            assertAll(
                {
                    assertEquals(
                        expectedFile.id,
                        actualFile.get("id").asText(),
                        "File ID mismatch: expected ${expectedFile.id}, got ${actualFile.get("id").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedFile.path,
                        actualFile.get("path").asText(),
                        "File path mismatch: expected ${expectedFile.path}, got ${actualFile.get("path").asText()}",
                    )
                },
                {
                    assertEquals(
                        expectedFile.webUrl,
                        actualFile.get("webUrl").asText(),
                        "File webUrl mismatch: expected ${expectedFile.webUrl}, got ${actualFile.get("webUrl").asText()}",
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
                  files(page: 3, perPage: 1) {
                      count
                      page
                      perPage
                      data {
                          id
                          path
                          webUrl
                      }
                  }
              }
          """,
                    ).execute()
                    .path("files")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(3, result.get("page").asInt(), "Expected page to be 3")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the files from the result
            val filesData = result.get("data")
            assertEquals(0, filesData.size(), "Expected 0 files on page beyond available data, but got ${filesData.size()}")
        }
    }

    @Nested
    inner class ErrorHandling : GraphQlControllerTest() {
        @Test
        fun `should throw exception for non-existent file id`() {
            // Test with a non-existent file ID
            val nonExistentId = "999"

            graphQlTester
                .document(
                    """
            query {
                file(id: "$nonExistentId") {
                    id
                    path
                    webUrl
                }
            }
        """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("File not found with id: $nonExistentId") ?: false
                }.verify()
        }

        @Test
        fun `should throw exception for invalid pagination parameters`() {
            // Test with invalid page parameter
            graphQlTester
                .document(
                    """
            query {
                files(page: 0, perPage: 10) {
                    count
                    page
                    perPage
                    data {
                        id
                        path
                        webUrl
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
                files(page: 1, perPage: 0) {
                    count
                    page
                    perPage
                    data {
                        id
                        path
                        webUrl
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
