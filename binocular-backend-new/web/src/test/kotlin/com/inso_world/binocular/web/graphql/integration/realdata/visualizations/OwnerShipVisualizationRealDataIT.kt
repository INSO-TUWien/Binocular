package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class OwnerShipVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `branches sorted ascending returns expected snapshot for first items`() {
        val query =
            """
            {
              branches(sort: "ASC") {
                data {
                  branch
                  active
                  tracksFileRenames
                  latestCommit
                  __typename
                }
                __typename
              }
            }
            """.trimIndent()

        val root = client.execute(query)
        val branches = root.get("branches")
        val data = branches.get("data")
        assertTrue(data.size() >= 3, "branches.data should contain at least three items for snapshot checks")

        run {
            val b = data.get(0)
            assertEquals("159", b.get("branch").asText(), "branches.data[0].branch")
            assertEquals("false", b.get("active").asText(), "branches.data[0].active")
            assertEquals("false", b.get("tracksFileRenames").asText(), "branches.data[0].tracksFileRenames")
            assertEquals("ab4ae24df323c40d58515e26ee14045999b745bf", b.get("latestCommit").asText(), "branches.data[0].latestCommit")
            assertEquals("Branch", b.get("__typename").asText(), "branches.data[0].__typename")
        }

        run {
            val b = data.get(1)
            assertEquals("2888", b.get("branch").asText(), "branches.data[1].branch")
            assertEquals("false", b.get("active").asText(), "branches.data[1].active")
            assertEquals("false", b.get("tracksFileRenames").asText(), "branches.data[1].tracksFileRenames")
            assertEquals("0f19849be9b57d56285a57ea31f3622f8ddecdf6", b.get("latestCommit").asText(), "branches.data[1].latestCommit")
            assertEquals("Branch", b.get("__typename").asText(), "branches.data[1].__typename")
        }

        run {
            val b = data.get(2)
            assertEquals("feature/175-jira-mining", b.get("branch").asText(), "branches.data[2].branch")
            assertEquals("false", b.get("active").asText(), "branches.data[2].active")
            assertEquals("false", b.get("tracksFileRenames").asText(), "branches.data[2].tracksFileRenames")
            assertEquals("990fe7f8c3cc00bdaf2e96a2b2581e76f3065b48", b.get("latestCommit").asText(), "branches.data[2].latestCommit")
            assertEquals("Branch", b.get("__typename").asText(), "branches.data[2].__typename")
        }
    }

    @Test
    fun `full commits ascending returns expected earliest commit snapshot including files`() {
        val query =
            $$"""
            query (
              $page: Int,
              $perPage: Int,
              $since: Timestamp,
              $until: Timestamp,
              $sort: Sort
            ) {
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
                  user { id gitSignature __typename }
                  branch
                  parents
                  date
                  webUrl
                  stats { additions deletions __typename }
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
                "perPage" to 1000,
                "since" to "1970-01-01T00:00:00.000Z",
                "until" to "2025-12-17T21:50:38.008Z",
                "sort" to "ASC",
            )

        val root = client.execute(query, variables)
        val commits = root.get("commits")

        assertEquals(3599, commits.get("count").asInt(), "commits.count")
        assertEquals(1, commits.get("page").asInt(), "commits.page")
        assertEquals(1000, commits.get("perPage").asInt(), "commits.perPage")

        val data = commits.get("data")
        assertTrue(data.size() > 0, "commits.data should contain at least one item")

        val first = data.get(0)
        assertEquals("945935697466022f2ddf7b1ea4f8cf9587b12a18", first.get("sha").asText(), "commit.sha")
        assertEquals("9459356", first.get("shortSha").asText(), "commit.shortSha")
        assertEquals(
            "Initial commit\n\nBasic setup for:\n * basic npm skeleton\n * gitignore\n * linters (jscs, jshint)\n * nvm\n\nIssue: #1\n",
            first.get("message").asText(),
            "commit.message"
        )
        assertEquals("Initial commit", first.get("messageHeader").asText(), "commit.messageHeader")

        val user = first.get("user")
        // assertEquals("6599256", user.get("id").asText(), "commit.user.id")
        assertEquals("Roman Decker <roman.decker@gmail.com>", user.get("gitSignature").asText(), "commit.user.gitSignature")
        assertEquals("User", user.get("__typename").asText(), "commit.user.__typename")

        assertEquals("main", first.get("branch").asText(), "commit.branch")
        assertEquals(0, first.get("parents").size(), "commit.parents should be empty for initial commit")
        assertIsoInstantEquals(first.get("date").asText(), "2016-11-16T13:22:07.000Z", "commit.date")
        assertEquals(
            "https://github.com/INSO-World/Binocular/commit/945935697466022f2ddf7b1ea4f8cf9587b12a18",
            first.get("webUrl").asText(),
            "commit.webUrl"
        )

        val stats = first.get("stats")
        assertEquals(197, stats.get("additions").asInt(), "commit.stats.additions")
        assertEquals(0, stats.get("deletions").asInt(), "commit.stats.deletions")
        assertEquals("Stats", stats.get("__typename").asText(), "commit.stats.__typename")

        val files = first.get("files")
        assertEquals("PaginatedFileInCommit", files.get("__typename").asText(), "commit.files.__typename")
        val fdata = files.get("data")
        assertEquals(7, fdata.size(), "commit.files.data size should be 7 for snapshot")

        val filesByPath =
            fdata.associateBy {
                it.get("file").get("path").asText()
            }

        assertEquals(7, filesByPath.size, "commit.files.data size")

        val expectedPaths =
            setOf(
                ".nvmrc",
                "pupil.js",
                "package.json",
                ".jshintrc",
                ".editorconfig",
                ".gitignore",
                ".jscsrc",
            )

        assertEquals(expectedPaths, filesByPath.keys, "commit.files paths")

        fun assertFile(
            path: String,
            add: Int,
            del: Int,
        ) {
            val item =
                filesByPath[path]
                    ?: error("Missing file in commit snapshot: $path")

            val file = item.get("file")
            assertEquals("File", file.get("__typename").asText(), "file.__typename")

            val stats = item.get("stats")
            assertEquals(add, stats.get("additions").asInt(), "stats.additions for $path")
            assertEquals(del, stats.get("deletions").asInt(), "stats.deletions for $path")
            assertEquals("Stats", stats.get("__typename").asText(), "stats.__typename for $path")

            assertEquals("FileInCommit", item.get("__typename").asText(), "__typename for $path")
        }

        assertFile(".nvmrc", 2, 0)
        assertFile("pupil.js", 4, 0)
        assertFile("package.json", 19, 0)
        assertFile(".jshintrc", 77, 0)
        assertFile(".editorconfig", 13, 0)
        assertFile(".gitignore", 2, 0)
        assertFile(".jscsrc", 80, 0)

        assertEquals("Commit", first.get("__typename").asText(), "commit.__typename")
        assertEquals("PaginatedCommit", commits.get("__typename").asText(), "commits.__typename")
    }

    @Test
    fun `branch by name returns files including newly added tests`() {
        val query =
            """
            {
              branch(branchName: "feature/363_add_tests_wip") {
                files {
                  data {
                    file { path __typename }
                    __typename
                  }
                  __typename
                }
                __typename
              }
            }
            """.trimIndent()

        val root = client.execute(query)
        val branch = root.get("branch")
        assertEquals("Branch", branch.get("__typename").asText(), "branch.__typename")

        val files = branch.get("files")
        assertEquals("PaginatedFileInBranch", files.get("__typename").asText(), "branch.files.__typename")

        val data = files.get("data")
        assertTrue(data.size() >= 2, "branch.files.data should contain at least two items for snapshot checks")

        // order should not matter
        val filesByPath =
            data.associateBy {
                it.get("file").get("path").asText()
            }

        fun assertFile(path: String) {
            val item =
                filesByPath[path]
                    ?: error("Missing expected file in branch snapshot: $path")

            val file = item.get("file")
            assertEquals("File", file.get("__typename").asText(), "file.__typename for $path")
            assertEquals("FileInBranch", item.get("__typename").asText(), "__typename for $path")
        }

        assertFile(
            "binocular-backend-new/web/src/test/kotlin/com/inso_world/binocular/web/graphql/integration/realdata/GraphQLIntegrationTestRealData.kt"
        )

        assertFile(
            "binocular-backend-new/infrastructure-sql/src/main/resources/db/changelog/2025/11/04-issues-and-mrs.yaml"
        )
    }

    @Test
    fun `commit ownership returns expected snapshot for known sha`() {
        val query =
            """
            query {
              commit(sha: "ec1444a4e2f37a0bdffca6c67d0bb9c8d696704d") {
                files {
                  data {
                    file { path }
                    ownership {
                      user
                      hunks {
                        originalCommit
                        lines { from to }
                        __typename
                      }
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

        val root = client.execute(query)
        val commit = root.get("commit")
        val files = commit.get("files").get("data")

        val filesByPath = files.associateBy { it.get("file").get("path").asText() }
        val contributing =
            filesByPath["docs/CONTRIBUTING.md"]
                ?: error("Missing docs/CONTRIBUTING.md in commit files")

        val ownership = contributing.get("ownership")
        assertTrue(ownership.isArray(), "ownership field should be an array for docs/CONTRIBUTING.md")

        if (ownership.size() > 0) {
            for (i in 0 until ownership.size()) {
                val o = ownership.get(i)
                val sig = o.get("user").asText()
                assertTrue(sig.isNotBlank(), "ownership.user signature should be non-blank")
                val hunks = o.get("hunks")
                assertTrue(hunks.size() >= 1, "each ownership entry should have at least one hunk when present")
                val firstHunk = hunks.get(0)
                val lines = firstHunk.get("lines")
                assertTrue(lines.size() >= 1, "each hunk should have at least one line range when present")
                val line0 = lines.get(0)
                line0.get("from").asInt()
                line0.get("to").asInt()
            }
        }

        val gqlFile =
            filesByPath["lib/endpoints/graphQl.js"]
                ?: error("Missing lib/endpoints/graphQl.js in commit files")
        val gqlOwnership = gqlFile.get("ownership")
        assertTrue(gqlOwnership.isArray(), "ownership field should be an array for lib/endpoints/graphQl.js")
    }
}
