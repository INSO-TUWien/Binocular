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
 * Test class for BuildController.
 * Tests the functionality of retrieving builds with and without pagination,
 * as well as error handling for invalid requests.
 */
internal class BuildControllerWebTest : BaseIntegrationTest() {
    @Nested
    inner class BasicFunctionality : GraphQlControllerTest() {
        @Test
        fun `should return all builds`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
              query {
                  builds(page: 1, perPage: 100) {
                      count
                      page
                      perPage
                      data {
                          id
                          sha
                          ref
                          status
                          tag
                          user
                          userFullName
                          createdAt
                          updatedAt
                          startedAt
                          finishedAt
                          committedAt
                          duration
                          webUrl
                          jobs {
                              id
                              name
                              status
                              stage
                              createdAt
                              finishedAt
                              webUrl
                          }
                      }
                  }
              }
          """,
                    ).execute()
                    .path("builds")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(100, result.get("perPage").asInt(), "Expected perPage to be 100")

            // Get the builds from the result
            val buildsData = result.get("data")
            assertEquals(2, buildsData.size(), "Expected 2 builds, but got ${buildsData.size()}")

            buildsData.reversed().forEachIndexed { index, actualBuild ->
                val expectedBuild = TestDataProvider.testBuilds[index]

                assertAll(
                    { assertEquals(expectedBuild.id, actualBuild.get("id").asText(), "Build id mismatch at index $index") },
                    { assertEquals(expectedBuild.sha, actualBuild.get("sha").asText(), "Build sha mismatch at index $index") },
                    { assertEquals(expectedBuild.ref, actualBuild.get("ref").asText(), "Build ref mismatch at index $index") },
                    { assertEquals(expectedBuild.status, actualBuild.get("status").asText(), "Build status mismatch at index $index") },
                    { assertEquals(expectedBuild.tag, actualBuild.get("tag").asText(), "Build tag mismatch at index $index") },
                    { assertEquals(expectedBuild.user, actualBuild.get("user").asText(), "Build user mismatch at index $index") },
                    {
                        assertEquals(
                            expectedBuild.userFullName,
                            actualBuild.get("userFullName").asText(),
                            "Build userFullName mismatch at index $index",
                        )
                    },
                    {
                        assertEquals(
                            expectedBuild.duration,
                            actualBuild.get("duration").asInt(),
                            "Build duration mismatch at index $index",
                        )
                    },
                    { assertEquals(expectedBuild.webUrl, actualBuild.get("webUrl").asText(), "Build webUrl mismatch at index $index") },
                )

                val jobs = actualBuild.get("jobs")
                assertEquals(expectedBuild.jobs?.size, jobs.size(), "Job list size mismatch at index $index")

                jobs.reversed().forEachIndexed { jobIndex, actualJob ->
                    val expectedJob = expectedBuild.jobs!![jobIndex]

                    assertAll(
                        { assertEquals(expectedJob.id, actualJob.get("id").asText(), "Job id mismatch at build $index, job $jobIndex") },
                        {
                            assertEquals(
                                expectedJob.name,
                                actualJob.get("name").asText(),
                                "Job name mismatch at build $index, job $jobIndex",
                            )
                        },
                        {
                            assertEquals(
                                expectedJob.status,
                                actualJob.get("status").asText(),
                                "Job status mismatch at build $index, job $jobIndex",
                            )
                        },
                        {
                            assertEquals(
                                expectedJob.stage,
                                actualJob.get("stage").asText(),
                                "Job stage mismatch at build $index, job $jobIndex",
                            )
                        },
                        {
                            assertEquals(
                                expectedJob.webUrl,
                                actualJob.get("webUrl").asText(),
                                "Job webUrl mismatch at build $index, job $jobIndex",
                            )
                        },
                    )
                }
            }
        }

        @Test
        fun `should return build by id`() {
            val expectedBuild = TestDataProvider.testBuilds.first { it.id == "1" }

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
                      createdAt
                      updatedAt
                      startedAt
                      finishedAt
                      committedAt
                      duration
                      webUrl
                      jobs {
                          id
                          name
                          status
                          stage
                          createdAt
                          finishedAt
                          webUrl
                      }
                  }
              }
          """,
                    ).execute()
                    .path("build")
                    .entity(JsonNode::class.java)
                    .get()

            assertAll(
                { assertEquals(expectedBuild.id, result.get("id").asText(), "Build id mismatch") },
                { assertEquals(expectedBuild.sha, result.get("sha").asText(), "Build sha mismatch") },
                { assertEquals(expectedBuild.ref, result.get("ref").asText(), "Build ref mismatch") },
                { assertEquals(expectedBuild.status, result.get("status").asText(), "Build status mismatch") },
                { assertEquals(expectedBuild.tag, result.get("tag").asText(), "Build tag mismatch") },
                { assertEquals(expectedBuild.user, result.get("user").asText(), "Build user mismatch") },
                { assertEquals(expectedBuild.userFullName, result.get("userFullName").asText(), "Build userFullName mismatch") },
                { assertEquals(expectedBuild.duration, result.get("duration").asInt(), "Build duration mismatch") },
                { assertEquals(expectedBuild.webUrl, result.get("webUrl").asText(), "Build webUrl mismatch") },
            )

            val jobs = result.get("jobs")
            assertEquals(expectedBuild.jobs?.size, jobs.size(), "Job list size mismatch")

            jobs.forEachIndexed { index, actualJob ->
                val expectedJob = expectedBuild.jobs!![index]

                assertAll(
                    { assertEquals(expectedJob.id, actualJob.get("id").asText(), "Job id mismatch at job $index") },
                    { assertEquals(expectedJob.name, actualJob.get("name").asText(), "Job name mismatch at job $index") },
                    { assertEquals(expectedJob.status, actualJob.get("status").asText(), "Job status mismatch at job $index") },
                    { assertEquals(expectedJob.stage, actualJob.get("stage").asText(), "Job stage mismatch at job $index") },
                    { assertEquals(expectedJob.webUrl, actualJob.get("webUrl").asText(), "Job webUrl mismatch at job $index") },
                )
            }
        }
    }

    @Nested
    inner class Pagination : GraphQlControllerTest() {
        @Test
        fun `should return builds with pagination`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
              query {
                  builds(page: 1, perPage: 1) {
                      count
                      page
                      perPage
                      data {
                          id
                          sha
                          ref
                          status
                      }
                  }
              }
          """,
                    ).execute()
                    .path("builds")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the builds from the result
            val buildsData = result.get("data")
            assertEquals(1, buildsData.size(), "Expected 1 build on first page, but got ${buildsData.size()}")

            val actualBuild = buildsData.get(0)
            val expectedBuild = TestDataProvider.testBuilds.maxByOrNull { it.id?.toInt() ?: Int.MIN_VALUE }!!

            assertAll(
                { assertEquals(expectedBuild.id, actualBuild.get("id").asText(), "Build id mismatch") },
                { assertEquals(expectedBuild.sha, actualBuild.get("sha").asText(), "Build sha mismatch") },
                { assertEquals(expectedBuild.ref, actualBuild.get("ref").asText(), "Build ref mismatch") },
                { assertEquals(expectedBuild.status, actualBuild.get("status").asText(), "Build status mismatch") },
            )
        }

        @Test
        fun `should handle null pagination parameters`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
              query {
                  builds {
                      count
                      page
                      perPage
                      data {
                          id
                          sha
                      }
                  }
              }
          """,
                    ).execute()
                    .path("builds")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(1, result.get("page").asInt(), "Expected page to be 1 (default)")
            assertEquals(20, result.get("perPage").asInt(), "Expected perPage to be 20 (default)")

            // Get the builds from the result
            val buildsData = result.get("data")
            assertEquals(2, buildsData.size(), "Expected 2 builds with default pagination, but got ${buildsData.size()}")
        }

        @Test
        fun `should return second page of builds`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
              query {
                  builds(page: 2, perPage: 1) {
                      count
                      page
                      perPage
                      data {
                          id
                          sha
                          ref
                          status
                      }
                  }
              }
          """,
                    ).execute()
                    .path("builds")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(2, result.get("page").asInt(), "Expected page to be 2")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the builds from the result
            val buildsData = result.get("data")
            assertEquals(1, buildsData.size(), "Expected 1 build on second page, but got ${buildsData.size()}")

            val actualBuild = buildsData.get(0)
            val expectedBuild =
                TestDataProvider.testBuilds
                    .sortedByDescending { it.id?.toInt() ?: Int.MIN_VALUE }
                    .drop(1)
                    .first()

            assertAll(
                { assertEquals(expectedBuild.id, actualBuild.get("id").asText(), "Build id mismatch on page 2") },
                { assertEquals(expectedBuild.sha, actualBuild.get("sha").asText(), "Build sha mismatch on page 2") },
                { assertEquals(expectedBuild.ref, actualBuild.get("ref").asText(), "Build ref mismatch on page 2") },
                { assertEquals(expectedBuild.status, actualBuild.get("status").asText(), "Build status mismatch on page 2") },
            )
        }

        @Test
        fun `should return empty list for page beyond available data`() {
            val result: JsonNode =
                graphQlTester
                    .document(
                        """
              query {
                  builds(page: 3, perPage: 1) {
                      count
                      page
                      perPage
                      data {
                          id
                          sha
                          ref
                          status
                      }
                  }
              }
          """,
                    ).execute()
                    .path("builds")
                    .entity(JsonNode::class.java)
                    .get()

            // Check pagination metadata
            assertEquals(2, result.get("count").asInt(), "Expected count to be 2")
            assertEquals(3, result.get("page").asInt(), "Expected page to be 3")
            assertEquals(1, result.get("perPage").asInt(), "Expected perPage to be 1")

            // Get the builds from the result
            val buildsData = result.get("data")
            assertEquals(0, buildsData.size(), "Expected 0 builds on page beyond available data, but got ${buildsData.size()}")
        }
    }

    @Nested
    inner class ErrorHandling : GraphQlControllerTest() {
        @Test
        fun `should throw exception for non-existent build id`() {
            val nonExistentId = "999"

            graphQlTester
                .document(
                    """
              query {
                  build(id: "$nonExistentId") {
                      id
                      sha
                  }
              }
          """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Build not found with id: $nonExistentId") ?: false
                }.verify()
        }

        @Test
        fun `should throw exception for invalid pagination parameters`() {
            graphQlTester
                .document(
                    """
              query {
                  builds(page: 0, perPage: 10) {
                      count
                      page
                      perPage
                      data {
                          id
                          sha
                      }
                  }
              }
          """,
                ).execute()
                .errors()
                .expect { error ->
                    error.message?.contains("Page must be greater than or equal to 1") ?: false
                }.verify()

            graphQlTester
                .document(
                    """
              query {
                  builds(page: 1, perPage: 0) {
                      count
                      page
                      perPage
                      data {
                          id
                          sha
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
