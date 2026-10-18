package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class BuildsBuildVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `builds query returns expected snapshot for first item`() {
        val query =
            $$"""
            query (
              $page: Int,
              $perPage: Int,
              $since: Timestamp,
              $until: Timestamp,
              $sort: Sort
            ) {
              builds(
                page: $page
                perPage: $perPage
                since: $since
                until: $until
                sort: $sort
              ) {
                count
                page
                perPage
                data {
                  id
                  committedAt
                  createdAt
                  duration
                  finishedAt
                  jobs {
                    id
                    name
                    status
                    stage
                    createdAt
                    finishedAt
                    __typename
                  }
                  startedAt
                  status
                  updatedAt
                  commit {
                    user { id gitSignature __typename }
                    __typename
                  }
                  __typename
                }
                __typename
              }
            }
            """.trimIndent()

        val variables =
            mapOf(
                "page" to 1,
                "perPage" to 1000,
                // NOTE: For Builds, the provided snapshot uses epoch millis for Timestamp
                "since" to 1723078800000,
                "until" to 1765191626000,
                "sort" to "ASC",
            )

        val root = client.execute(query, variables)
        val builds = root.get("builds")

        // Container checks
        assertEquals(1811, builds.get("count").asInt(), "builds.count should match expected snapshot")
        assertEquals(1, builds.get("page").asInt(), "builds.page should be 1")
        assertEquals(1000, builds.get("perPage").asInt(), "builds.perPage should be 1000")
        assertEquals("PaginatedBuild", builds.get("__typename").asText(), "builds.__typename")

        val data = builds.get("data")
        assertTrue(data.size() > 0, "builds.data should contain at least one item")

        val first = data.get(0)
        // assertEquals("6660824", first.get("id").asText(), "build.id")
        assertIsoInstantEquals(first.get("committedAt").asText(), "2024-10-17T12:47:21.000Z", "build.committedAt")
        assertIsoInstantEquals(first.get("createdAt").asText(), "2024-10-17T12:47:31.000Z", "build.createdAt")
        assertIsoInstantEquals(first.get("finishedAt").asText(), "2024-10-17T12:48:18.000Z", "build.finishedAt")
        assertEquals(46, first.get("duration").asInt(), "build.duration")

        val jobs = first.get("jobs")
        assertEquals(1, jobs.size(), "build.jobs size")
        val job0 = jobs.get(0)
        assertEquals(31674694324L, job0.get("id").asLong(), "build.jobs[0].id")
        assertEquals("bastianferch", job0.get("name").asText(), "build.jobs[0].name")
        assertEquals("success", job0.get("status").asText(), "build.jobs[0].status")
        assertEquals("success", job0.get("stage").asText(), "build.jobs[0].stage")
        assertIsoInstantEquals(job0.get("createdAt").asText(), "2024-10-17T12:47:32.000Z", "build.jobs[0].createdAt")
        assertIsoInstantEquals(job0.get("finishedAt").asText(), "2024-10-17T12:48:18.000Z", "build.jobs[0].finishedAt")
        assertEquals("Job", job0.get("__typename").asText(), "build.jobs[0].__typename")

        assertIsoInstantEquals(first.get("startedAt").asText(), "2024-10-17T12:47:31.000Z", "build.startedAt")
        assertIsoInstantEquals(first.get("updatedAt").asText(), "2025-11-22T08:59:56.000Z", "build.updatedAt")
        assertEquals("success", first.get("status").asText(), "build.status")

        val commit = first.get("commit")
        val user = commit.get("user")
        // assertEquals("6861170", user.get("id").asText(), "build.commit.user.id")
        assertEquals(
            "Bastian Ferch <bastian.ferch@gmail.com>",
            user.get("gitSignature").asText(),
            "build.commit.user.gitSignature"
        )
        assertEquals("User", user.get("__typename").asText(), "build.commit.user.__typename")
        assertEquals("Commit", commit.get("__typename").asText(), "build.commit.__typename")

        assertEquals("Build", first.get("__typename").asText(), "build.__typename")
    }
}
