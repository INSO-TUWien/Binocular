package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class CommitsCommitByFileCVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `page 1 commits summary returns expected snapshot header items`() {
        val query =
            $$"""
            query ($page: Int, $perPage: Int) {
              commits(page: $page, perPage: $perPage) {
                count
                page
                perPage
                data {
                  sha
                  date
                  messageHeader
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
            )

        val root = client.execute(query, variables)
        val commits = root.get("commits")

        assertEquals(3599, commits.get("count").asInt(), "commits.count")
        assertEquals(1, commits.get("page").asInt(), "commits.page")
        assertEquals(1000, commits.get("perPage").asInt(), "commits.perPage")

        val data = commits.get("data")
        assertTrue(data.size() > 2, "commits.data should contain at least 3 items for the snapshot checks")

        run {
            val first = data.get(0)
            assertEquals("945935697466022f2ddf7b1ea4f8cf9587b12a18", first.get("sha").asText(), "data[0].sha")
            assertIsoInstantEquals(first.get("date").asText(), "2016-11-16T13:22:07.000Z", "data[0].date")
            assertEquals("Initial commit", first.get("messageHeader").asText(), "data[0].messageHeader")
            assertEquals("Commit", first.get("__typename").asText(), "data[0].__typename")
        }

        run {
            val second = data.get(1)
            assertEquals("2c58aacb573d02bf41c5e4930210264db31b8b7b", second.get("sha").asText(), "data[1].sha")
            assertIsoInstantEquals(second.get("date").asText(), "2016-11-16T13:30:59.000Z", "data[1].date")
            assertEquals("Added support for yarn package manager", second.get("messageHeader").asText(), "data[1].messageHeader")
            assertEquals("Commit", second.get("__typename").asText(), "data[1].__typename")
        }

        run {
            val third = data.get(2)
            assertEquals("fb900694931dc9de03d9dd065491290d1b814aa0", third.get("sha").asText(), "data[2].sha")
            assertIsoInstantEquals(third.get("date").asText(), "2016-11-16T13:53:00.000Z", "data[2].date")
            assertEquals("Added basic config structure", third.get("messageHeader").asText(), "data[2].messageHeader")
            assertEquals("Commit", third.get("__typename").asText(), "data[2].__typename")
        }

        assertEquals("PaginatedCommit", commits.get("__typename").asText(), "commits.__typename")
    }

    @Test
    fun `page 2 commits summary returns expected first item`() {
        val query =
            """
            query (${'$'}page: Int, ${'$'}perPage: Int) {
              commits(page: ${'$'}page, perPage: ${'$'}perPage) {
                count
                page
                perPage
                data {
                  sha
                  date
                  messageHeader
                  __typename
                }
                __typename
              }
            }
            """.trimIndent()

        val variables =
            mapOf(
                "page" to 2,
                "perPage" to 1000,
            )

        val root = client.execute(query, variables)
        val commits = root.get("commits")

        assertEquals(3599, commits.get("count").asInt(), "commits.count")
        assertEquals(2, commits.get("page").asInt(), "commits.page")
        assertEquals(1000, commits.get("perPage").asInt(), "commits.perPage")

        val data = commits.get("data")
        assertTrue(data.size() > 0, "commits.data should contain at least one item on page 2")

        val first = data.get(0)
        assertEquals("7003efc75c5be029cfd767dfdf24a1163279f7f7", first.get("sha").asText(), "data[0].sha")
        assertIsoInstantEquals(first.get("date").asText(), "2022-09-21T09:16:31.000Z", "data[0].date")
        assertEquals("#51: Gitlab pipeline and SEPM integration", first.get("messageHeader").asText(), "data[0].messageHeader")
        assertEquals("Commit", first.get("__typename").asText(), "data[0].__typename")

        assertEquals("PaginatedCommit", commits.get("__typename").asText(), "commits.__typename")
    }

    @Test
    fun `GetCommitFiles returns expected files and pagination`() {
        val query =
            $$"""
            query GetCommitFiles($page: Int, $perPage: Int, $sha: String!) {
              commit(sha: $sha) {
                files(page: $page, perPage: $perPage) {
                  data {
                    file { path __typename }
                    stats { additions deletions __typename }
                    __typename
                  }
                  count
                  page
                  perPage
                  __typename
                }
                __typename
              }
            }
            """.trimIndent()

        val variables =
            mapOf(
                "sha" to "aac5d1d489204b7963689ec2963ab39cceec45f2",
                "page" to 1,
                "perPage" to 1000,
            )

        val root = client.execute(query, variables)
        val commit = root.get("commit")
        val files = commit.get("files")

        val data = files.get("data")
        assertEquals(2, data.size(), "files.data size")

        run {
            val item = data.get(0)
            val file = item.get("file")
            assertEquals(
                "binocular-frontend-new/src/components/infoTooltip/infoTooltip.module.scss",
                file.get("path").asText(),
                "data[0].file.path"
            )
            assertEquals("File", file.get("__typename").asText(), "data[0].file.__typename")
            val stats = item.get("stats")
            assertEquals(11, stats.get("additions").asInt(), "data[0].stats.additions")
            assertEquals(1, stats.get("deletions").asInt(), "data[0].stats.deletions")
            assertEquals("Stats", stats.get("__typename").asText(), "data[0].stats.__typename")
            assertEquals("FileInCommit", item.get("__typename").asText(), "data[0].__typename")
        }

        run {
            val item = data.get(1)
            val file = item.get("file")
            assertEquals(
                "binocular-frontend-new/src/components/infoTooltip/infoTooltipHelper.ts",
                file.get("path").asText(),
                "data[1].file.path"
            )
            assertEquals("File", file.get("__typename").asText(), "data[1].file.__typename")
            val stats = item.get("stats")
            assertEquals(17, stats.get("additions").asInt(), "data[1].stats.additions")
            assertEquals(9, stats.get("deletions").asInt(), "data[1].stats.deletions")
            assertEquals("Stats", stats.get("__typename").asText(), "data[1].stats.__typename")
            assertEquals("FileInCommit", item.get("__typename").asText(), "data[1].__typename")
        }

        assertEquals(2, files.get("count").asInt(), "files.count")
        assertEquals(1, files.get("page").asInt(), "files.page")
        assertEquals(1000, files.get("perPage").asInt(), "files.perPage")
        assertEquals("PaginatedFileInCommit", files.get("__typename").asText(), "files.__typename")
        assertEquals("Commit", commit.get("__typename").asText(), "commit.__typename")
    }
}
