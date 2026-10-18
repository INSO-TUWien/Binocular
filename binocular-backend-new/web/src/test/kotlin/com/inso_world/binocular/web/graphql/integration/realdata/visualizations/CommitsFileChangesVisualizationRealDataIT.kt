package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class CommitsFileChangesVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `file commits for README md returns expected snapshot for first item`() {
        val query =
            $$"""
            query (
              $page: Int,
              $perPage: Int,
              $file: String!
            ) {
              file(path: $file) {
                commits(page: $page, perPage: $perPage) {
                  data {
                    commit {
                      sha
                      shortSha
                      message
                      messageHeader
                      user { id gitSignature __typename }
                      branch
                      parents
                      date
                      webUrl
                      stats { additions deletions __typename }
                      files(page: 1, perPage: 1000) {
                        data {
                          file { path __typename }
                          hunks { newStart newLines oldStart oldLines __typename }
                          __typename
                        }
                        __typename
                      }
                      __typename
                    }
                    __typename
                  }
                }
              }
            }
            """.trimIndent()

        val variables =
            mapOf(
                "page" to 1,
                "perPage" to 1000,
                "file" to "README.md",
            )

        val root = client.execute(query, variables)
        val file = root.get("file")
        val commits = file.get("commits")
        val dataArr = commits.get("data")
        assertTrue(dataArr.size() > 0, "file.commits.data should contain at least one item")

        val firstItem = dataArr.get(0)
        assertEquals("CommitInFile", firstItem.get("__typename").asText(), "file.commits.data[0].__typename")

        val commit = firstItem.get("commit")
        assertEquals("61903bc02d5c48923c1274800dfee13168d17f93", commit.get("sha").asText(), "commit.sha")
        assertEquals("61903bc", commit.get("shortSha").asText(), "commit.shortSha")
        assertEquals(":memo: Add documentation\n\nIssue: #65 - Add some documentation\n", commit.get("message").asText(), "commit.message")
        assertEquals(":memo: Add documentation", commit.get("messageHeader").asText(), "commit.messageHeader")
        assertEquals("main", commit.get("branch").asText(), "commit.branch")
        assertIsoInstantEquals(commit.get("date").asText(), "2018-03-27T08:18:46.000Z", "commit.date")
        assertEquals(
            "https://github.com/INSO-World/Binocular/commit/61903bc02d5c48923c1274800dfee13168d17f93",
            commit.get("webUrl").asText(),
            "commit.webUrl"
        )
        assertEquals("Commit", commit.get("__typename").asText(), "commit.__typename")

        val parents = commit.get("parents")
        assertEquals(1, parents.size(), "commit.parents size")
        assertEquals("24136db1695de8a0bd4a55066359a336ef1c2b7f", parents.get(0).asText(), "commit.parents[0]")

        val user = commit.get("user")
        // assertEquals("6599256", user.get("id").asText(), "commit.user.id")
        assertEquals("Roman Decker <roman.decker@gmail.com>", user.get("gitSignature").asText(), "commit.user.gitSignature")
        assertEquals("User", user.get("__typename").asText(), "commit.user.__typename")

        val stats = commit.get("stats")
        assertEquals(1285, stats.get("additions").asInt(), "commit.stats.additions")
        assertEquals(0, stats.get("deletions").asInt(), "commit.stats.deletions")
        assertEquals("Stats", stats.get("__typename").asText(), "commit.stats.__typename")

        val filesContainer = commit.get("files")
        assertEquals("PaginatedFileInCommit", filesContainer.get("__typename").asText(), "commit.files.__typename")
        val filesData = filesContainer.get("data")
        assertTrue(filesData.size() >= 4, "commit.files.data should have at least 4 entries as per snapshot")

        // Order-agnostic assertions for commit.files.data
        val expected =
            mapOf(
                "docs/zivsed-architecture.png" to 655,
                "docs/cors.png" to 400,
                "docs/CONTRIBUTING.md" to 124,
                "README.md" to 106,
            )

        // Collect all file paths returned by the API
        // since the old graphql impl returns it in some strange order (i have no idea how),
        // it is needed to compare and verify without checking the order
        val paths = mutableListOf<String>()
        for (i in 0 until filesData.size()) {
            val p =
                filesData
                    .get(i)
                    .get("file")
                    .get("path")
                    .asText()
            paths.add(p)
        }

        // Each expected path must appear exactly once
        expected.keys.forEach { p ->
            val count = paths.count { it == p }
            assertEquals(1, count, "Expected file path '$p' exactly once, but found $count")
        }

        var validated = 0
        for (i in 0 until filesData.size()) {
            val item = filesData.get(i)
            val fileNode = item.get("file")
            val path = fileNode.get("path").asText()

            if (path == "docs/zivsed-architecture.png") {
                assertEquals("FileInCommit", item.get("__typename").asText(), "files.data[*].__typename for docs/zivsed-architecture.png")
                assertEquals(
                    "docs/zivsed-architecture.png",
                    fileNode.get("path").asText(),
                    "files.data[*].file.path for docs/zivsed-architecture.png"
                )
                assertEquals("File", fileNode.get("__typename").asText(), "files.data[*].file.__typename for docs/zivsed-architecture.png")

                val hunks = item.get("hunks")
                assertEquals(1, hunks.size(), "files.data[*].hunks size for docs/zivsed-architecture.png")
                val h0 = hunks.get(0)
                assertEquals(1, h0.get("newStart").asInt(), "files.data[*].hunks[0].newStart for docs/zivsed-architecture.png")
                assertEquals(655, h0.get("newLines").asInt(), "files.data[*].hunks[0].newLines for docs/zivsed-architecture.png")
                assertEquals(0, h0.get("oldStart").asInt(), "files.data[*].hunks[0].oldStart for docs/zivsed-architecture.png")
                assertEquals(0, h0.get("oldLines").asInt(), "files.data[*].hunks[0].oldLines for docs/zivsed-architecture.png")
                assertEquals("Hunk", h0.get("__typename").asText(), "files.data[*].hunks[0].__typename for docs/zivsed-architecture.png")
                validated++
            }
            if (path == "docs/cors.png") {
                assertEquals("FileInCommit", item.get("__typename").asText(), "files.data[*].__typename for docs/cors.png")
                assertEquals("docs/cors.png", fileNode.get("path").asText(), "files.data[*].file.path for docs/cors.png")
                assertEquals("File", fileNode.get("__typename").asText(), "files.data[*].file.__typename for docs/cors.png")

                val hunks = item.get("hunks")
                assertEquals(1, hunks.size(), "files.data[*].hunks size for docs/cors.png")
                val h0 = hunks.get(0)
                assertEquals(1, h0.get("newStart").asInt(), "files.data[*].hunks[0].newStart for docs/cors.png")
                assertEquals(400, h0.get("newLines").asInt(), "files.data[*].hunks[0].newLines for docs/cors.png")
                assertEquals(0, h0.get("oldStart").asInt(), "files.data[*].hunks[0].oldStart for docs/cors.png")
                assertEquals(0, h0.get("oldLines").asInt(), "files.data[*].hunks[0].oldLines for docs/cors.png")
                assertEquals("Hunk", h0.get("__typename").asText(), "files.data[*].hunks[0].__typename for docs/cors.png")
                validated++
            }
            if (path == "docs/CONTRIBUTING.md") {
                assertEquals("FileInCommit", item.get("__typename").asText(), "files.data[*].__typename for docs/CONTRIBUTING.md")
                assertEquals("docs/CONTRIBUTING.md", fileNode.get("path").asText(), "files.data[*].file.path for docs/CONTRIBUTING.md")
                assertEquals("File", fileNode.get("__typename").asText(), "files.data[*].file.__typename for docs/CONTRIBUTING.md")

                val hunks = item.get("hunks")
                assertEquals(1, hunks.size(), "files.data[*].hunks size for docs/CONTRIBUTING.md")
                val h0 = hunks.get(0)
                assertEquals(1, h0.get("newStart").asInt(), "files.data[*].hunks[0].newStart for docs/CONTRIBUTING.md")
                assertEquals(124, h0.get("newLines").asInt(), "files.data[*].hunks[0].newLines for docs/CONTRIBUTING.md")
                assertEquals(0, h0.get("oldStart").asInt(), "files.data[*].hunks[0].oldStart for docs/CONTRIBUTING.md")
                assertEquals(0, h0.get("oldLines").asInt(), "files.data[*].hunks[0].oldLines for docs/CONTRIBUTING.md")
                assertEquals("Hunk", h0.get("__typename").asText(), "files.data[*].hunks[0].__typename for docs/CONTRIBUTING.md")
                validated++
            }
            if (path == "README.md") {
                assertEquals("FileInCommit", item.get("__typename").asText(), "files.data[*].__typename for README.md")
                assertEquals("README.md", fileNode.get("path").asText(), "files.data[*].file.path for README.md")
                assertEquals("File", fileNode.get("__typename").asText(), "files.data[*].file.__typename for README.md")

                val hunks = item.get("hunks")
                assertEquals(1, hunks.size(), "files.data[*].hunks size for README.md")
                val h0 = hunks.get(0)
                assertEquals(1, h0.get("newStart").asInt(), "files.data[*].hunks[0].newStart for README.md")
                assertEquals(106, h0.get("newLines").asInt(), "files.data[*].hunks[0].newLines for README.md")
                assertEquals(0, h0.get("oldStart").asInt(), "files.data[*].hunks[0].oldStart for README.md")
                assertEquals(0, h0.get("oldLines").asInt(), "files.data[*].hunks[0].oldLines for README.md")
                assertEquals("Hunk", h0.get("__typename").asText(), "files.data[*].hunks[0].__typename for README.md")
                validated++
            }

            if (validated == 4) break
        }
    }
}
