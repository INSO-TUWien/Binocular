package com.inso_world.binocular.web.graphql.resolver

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.web.graphql.base.GraphQlControllerTest
import com.inso_world.binocular.web.graphql.model.BuildDto
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

/**
 * Test class for verifying the Build resolver functionality.
 * This class extends BaseDbTest to leverage the test data setup.
 */
internal class BuildResolverTest : GraphQlControllerTest() {
    @Autowired
    private lateinit var buildResolver: BuildResolver

    @Nested
    inner class BasicFunctionality {
        @Test
        fun `should retrieve build with all fields`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    build(id: "1") {
                        id
                        sha
                        ref
                        status
                        tag
                        user
                        userFullName
                        duration
                        webUrl
                        jobs {
                            id
                            name
                            status
                            stage
                            webUrl
                        }
                    }
                }
            """,
                    ).execute()
                    .path("build")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify build data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Build ID mismatch") },
                {
                    assertTrue(
                        result.get("sha").asText().startsWith("abc1230000000000000000000000000000000000"),
                        "Build SHA should start with short hash"
                    )
                },
                { assertEquals("main", result.get("ref").asText(), "Build ref mismatch") },
                { assertEquals("success", result.get("status").asText(), "Build status mismatch") },
                { assertEquals("v0.0.1-rc", result.get("tag").asText(), "Build tag mismatch") },
                { assertEquals("user1", result.get("user").asText(), "Build user mismatch") },
                { assertEquals("User One", result.get("userFullName").asText(), "Build userFullName mismatch") },
                { assertEquals(120, result.get("duration").asInt(), "Build duration mismatch") },
                { assertEquals("https://example.com/builds/1", result.get("webUrl").asText(), "Build webUrl mismatch") },
            )

            // Verify jobs
            val jobs = result.get("jobs")
            assertNotNull(jobs, "Jobs should not be null")
            assertEquals(1, jobs.size(), "Should have 1 job")

            // Verify the job data
            val job = jobs.get(0)
            assertAll(
                { assertEquals("job1", job.get("id").asText(), "Job ID mismatch") },
                { assertEquals("test", job.get("name").asText(), "Job name mismatch") },
                { assertEquals("success", job.get("status").asText(), "Job status mismatch") },
                { assertEquals("test", job.get("stage").asText(), "Job stage mismatch") },
                { assertEquals("https://example.com/jobs/job1", job.get("webUrl").asText(), "Job webUrl mismatch") },
            )
        }
    }

    @Nested
    inner class RelationshipTests {
        @Test
        fun `should retrieve build with related commits`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    build(id: "1") {
                        id
                        sha
                        ref
                        status
                        userFullName
                        user
                        commits {
                            id
                            sha
                            message
                        }
                    }
                }
            """,
                    ).execute()
                    .path("build")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify build data
            assertAll(
                { assertEquals("1", result.get("id").asText(), "Build ID mismatch") },
                {
                    assertTrue(
                        result.get("sha").asText().startsWith("abc1230000000000000000000000000000000000"),
                        "Build SHA should start with short hash"
                    )
                },
                { assertEquals("main", result.get("ref").asText(), "Build ref mismatch") },
                { assertEquals("success", result.get("status").asText(), "Build status mismatch") },
                { assertEquals("User One", result.get("userFullName").asText(), "Build userFullName mismatch") },
                { assertEquals("user1", result.get("user").asText(), "Build user mismatch") },
            )

            // Verify commits
            val commits = result.get("commits")
            assertNotNull(commits, "Commits should not be null")
            assertEquals(1, commits.size(), "Should have 1 commit")

            // Verify the commit data
            val commit = commits.get(0)
            assertAll(
                { assertEquals("1", commit.get("id").asText(), "Commit ID mismatch") },
                {
                    assertTrue(
                        commit.get("sha").asText().startsWith("abc1230000000000000000000000000000000000"),
                        "Commit SHA should start with short hash"
                    )
                },
                { assertEquals("First commit", commit.get("message").asText(), "Commit message mismatch") },
            )
        }

        @Test
        fun `should retrieve build with no related commits`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
                query {
                    build(id: "2") {
                        id
                        sha
                        ref
                        status
                        tag
                        userFullName
                        user
                        commits {
                            id
                            sha
                            message
                        }
                    }
                }
            """,
                    ).execute()
                    .path("build")
                    .entity(JsonNode::class.java)
                    .get()

            // Verify build data
            assertAll(
                { assertEquals("2", result.get("id").asText(), "Build ID mismatch") },
                { assertEquals("def4560000000000000000000000000000000000", result.get("sha").asText(), "Build SHA mismatch") },
                { assertEquals("feature/new-feature", result.get("ref").asText(), "Build ref mismatch") },
                { assertEquals("failed", result.get("status").asText(), "Build status mismatch") },
                { assertEquals("v1.0.0", result.get("tag").asText(), "Build tag mismatch") },
                { assertEquals("User Two", result.get("userFullName").asText(), "Build userFullName mismatch") },
                { assertEquals("user2", result.get("user").asText(), "Build user mismatch") },
            )

            // Verify commits (should be empty array)
            val commits = result.get("commits")
            assertNotNull(commits, "Commits should not be null")
            assertEquals(0, commits.size(), "Should have 0 commits")
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `commits should return empty list when build id is null`() {
            // Arrange
            val build = BuildDto(id = null, sha = "abc")

            // Act
            val result = buildResolver.commits(build)

            // Assert
            assertTrue(result.isEmpty(), "Commits list should be empty when build ID is null")
        }

        @Test
        fun `should handle non-existent build`() {
            // Create a test query for a build that doesn't exist in the test data
            // This should return an error
            graphQlTester
                .document(
                    """
                query {
                    build(id: "999") {
                        id
                        sha
                        ref
                    }
                }
            """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Build not found with id: 999") ?: false
                }.verify()
        }
    }
}
