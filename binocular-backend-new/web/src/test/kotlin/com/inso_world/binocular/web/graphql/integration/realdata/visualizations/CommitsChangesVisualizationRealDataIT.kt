package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

internal class CommitsChangesVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `commits query returns expected real data snapshot for first item`() {
        val query =
            $$"""
            query ($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp, $sort: Sort) {
              commits(
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
                  sha
                  shortSha
                  message
                  messageHeader
                  user {
                    id
                    gitSignature
                    __typename
                  }
                  branch
                  parents
                  date
                  webUrl
                  stats {
                    additions
                    deletions
                    __typename
                  }
                  files {
                    data {
                      file { path __typename }
                      stats { additions deletions __typename }
                      __typename
                    }
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
                "perPage" to 1,
                "since" to "2024-08-08T03:00",
                "until" to "2025-12-08T12:00:26",
                "sort" to "ASC",
            )

        val data = client.execute(query, variables)
        val commits = data.get("commits")

        assertEquals(1120, commits.get("count").asInt(), "commits.count should match the expected snapshot")
        assertEquals(1, commits.get("page").asInt(), "commits.page should be 1")
        assertEquals(1, commits.get("perPage").asInt(), "commits.perPage should be 1")
        assertEquals(1, commits.get("data").size(), "commits.data should contain exactly 1 item when perPage=1")

        val first = commits.get("data").get(0)

        assertEquals("c44daad5df789734ed8d3867c24bf5ad06152268", first.get("sha").asText(), "sha")
        assertEquals("c44daad", first.get("shortSha").asText(), "shortSha")
        assertEquals("#233 updated grouping code\n", first.get("message").asText(), "message")
        assertEquals("#233 updated grouping code", first.get("messageHeader").asText(), "messageHeader")

        val user = first.get("user")
        // assertEquals("7067415", user.get("id").asText(), "user.id")
        assertEquals("maerzman <20152088@atn.ac.at>", user.get("gitSignature").asText(), "user.gitSignature")
        assertEquals("User", user.get("__typename").asText(), "user.__typename")

        assertEquals("feature/233-code-review-metrics", first.get("branch").asText(), "branch")

        val parents = first.get("parents")
        assertEquals(1, parents.size(), "parents size")
        assertEquals("e6c685f88ddf315c7081f9b17d9dbc680437a491", parents.get(0).asText(), "parents[0]")

        assertIsoInstantEquals(first.get("date").asText(), "2024-08-08T14:21:21.000Z", "date")
        assertEquals(
            "https://github.com/INSO-World/Binocular/commit/c44daad5df789734ed8d3867c24bf5ad06152268",
            first.get("webUrl").asText(),
            "webUrl"
        )

        val stats = first.get("stats")
        assertEquals(75, stats.get("additions").asInt(), "stats.additions")
        assertEquals(86, stats.get("deletions").asInt(), "stats.deletions")
        assertEquals("Stats", stats.get("__typename").asText(), "stats.__typename")

        val files = first.get("files")
        assertEquals("PaginatedFileInCommit", files.get("__typename").asText(), "files.__typename")

        val filesData = files.get("data")
        assertEquals(2, filesData.size(), "files.data size")

        val file0 = filesData.get(0)
        val file0File = file0.get("file")
        assertEquals("binocular-frontend/src/components/BubbleChart/index.tsx", file0File.get("path").asText(), "files.data[0].file.path")
        assertEquals("File", file0File.get("__typename").asText(), "files.data[0].file.__typename")
        val file0Stats = file0.get("stats")
        assertEquals(75, file0Stats.get("additions").asInt(), "files.data[0].stats.additions")
        assertEquals(79, file0Stats.get("deletions").asInt(), "files.data[0].stats.deletions")
        assertEquals("Stats", file0Stats.get("__typename").asText(), "files.data[0].stats.__typename")
        assertEquals("FileInCommit", file0.get("__typename").asText(), "files.data[0].__typename")

        val file1 = filesData.get(1)
        val file1File = file1.get("file")
        assertEquals(
            "binocular-frontend/src/visualizations/code-review-metrics/chart/chart.tsx",
            file1File.get("path").asText(),
            "files.data[1].file.path"
        )
        assertEquals("File", file1File.get("__typename").asText(), "files.data[1].file.__typename")
        val file1Stats = file1.get("stats")
        assertEquals(0, file1Stats.get("additions").asInt(), "files.data[1].stats.additions")
        assertEquals(7, file1Stats.get("deletions").asInt(), "files.data[1].stats.deletions")
        assertEquals("Stats", file1Stats.get("__typename").asText(), "files.data[1].stats.__typename")
        assertEquals("FileInCommit", file1.get("__typename").asText(), "files.data[1].__typename")

        assertEquals("Commit", first.get("__typename").asText(), "__typename")

        assertEquals("PaginatedCommit", commits.get("__typename").asText(), "commits.__typename")
    }
}
