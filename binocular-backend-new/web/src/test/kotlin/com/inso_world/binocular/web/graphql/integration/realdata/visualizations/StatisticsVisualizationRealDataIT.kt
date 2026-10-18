package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class StatisticsVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `statistics commits snapshot returns expected first item`() {
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
                "since" to "2024-08-08T03:00",
                "until" to "2025-12-08T12:00:26",
                "sort" to "ASC",
            )

        val root = client.execute(query, variables)
        val commits = root.get("commits")

        assertEquals(1120, commits.get("count").asInt(), "commits.count")
        assertEquals(1, commits.get("page").asInt(), "commits.page")
        assertEquals(1000, commits.get("perPage").asInt(), "commits.perPage")

        val data = commits.get("data")
        assertTrue(data.size() > 0, "commits.data should contain at least one item")

        val first = data.get(0)
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
        assertTrue(filesData.size() >= 2, "files.data should have at least 2 entries for snapshot")

        run {
            val item = filesData.get(0)
            val f = item.get("file")
            assertEquals("binocular-frontend/src/components/BubbleChart/index.tsx", f.get("path").asText(), "files[0].file.path")
            assertEquals("File", f.get("__typename").asText(), "files[0].file.__typename")
            val s = item.get("stats")
            assertEquals(75, s.get("additions").asInt(), "files[0].stats.additions")
            assertEquals(79, s.get("deletions").asInt(), "files[0].stats.deletions")
            assertEquals("Stats", s.get("__typename").asText(), "files[0].stats.__typename")
            assertEquals("FileInCommit", item.get("__typename").asText(), "files[0].__typename")
        }

        run {
            val item = filesData.get(1)
            val f = item.get("file")
            assertEquals(
                "binocular-frontend/src/visualizations/code-review-metrics/chart/chart.tsx",
                f.get("path").asText(),
                "files[1].file.path"
            )
            assertEquals("File", f.get("__typename").asText(), "files[1].file.__typename")
            val s = item.get("stats")
            assertEquals(0, s.get("additions").asInt(), "files[1].stats.additions")
            assertEquals(7, s.get("deletions").asInt(), "files[1].stats.deletions")
            assertEquals("Stats", s.get("__typename").asText(), "files[1].stats.__typename")
            assertEquals("FileInCommit", item.get("__typename").asText(), "files[1].__typename")
        }

        assertEquals("Commit", first.get("__typename").asText(), "commit.__typename")
        assertEquals("PaginatedCommit", commits.get("__typename").asText(), "commits.__typename")
    }

    @Test
    fun `statistics users snapshot returns expected first two items`() {
        val query =
            $$"""
            query (
              $page: Int,
              $perPage: Int
            ) {
              users(page: $page, perPage: $perPage) {
                count
                page
                perPage
                data {
                  id
                  gitSignature
                  account { platform name id login __typename }
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
        val users = root.get("users")

        assertEquals(76, users.get("count").asInt(), "users.count")
        assertEquals(1, users.get("page").asInt(), "users.page")
        assertEquals(1000, users.get("perPage").asInt(), "users.perPage")

        val data = users.get("data")
        assertTrue(data.size() >= 2, "users.data should contain at least two items")

        run {
            // user without account
            var romanNode = null as com.fasterxml.jackson.databind.JsonNode?
            for (i in 0 until data.size()) {
                val it = data.get(i)
                if (it.get("gitSignature").asText() == "Roman Decker <roman.decker@gmail.com>") {
                    romanNode = it
                    break
                }
            }
            assertTrue(romanNode != null, "users.data should contain Roman Decker <roman.decker@gmail.com>")
            val u0 = romanNode!!
            assertEquals("Roman Decker <roman.decker@gmail.com>", u0.get("gitSignature").asText(), "users[*].gitSignature (Roman)")
            assertTrue(u0.get("account").isNull, "users[*].account (Roman) should be null")
            assertEquals("User", u0.get("__typename").asText(), "users[*].__typename (Roman)")
        }

        run {
            // user with account
            var johannNode = null as com.fasterxml.jackson.databind.JsonNode?
            for (i in 0 until data.size()) {
                val it = data.get(i)
                if (it.get("gitSignature").asText() == "Johann Grabner <johann.grabner@inso.tuwien.ac.at>") {
                    johannNode = it
                    break
                }
            }
            assertTrue(johannNode != null, "users.data should contain Johann Grabner <johann.grabner@inso.tuwien.ac.at>")
            val u1 = johannNode!!
            assertEquals(
                "Johann Grabner <johann.grabner@inso.tuwien.ac.at>",
                u1.get("gitSignature").asText(),
                "users[*].gitSignature (Johann)"
            )
            val acc = u1.get("account")
            if (!acc.isNull) {
                assertEquals("GitHub", acc.get("platform").asText(), "users[*].account.platform (Johann)")
                assertEquals("Johann Grabner", acc.get("name").asText(), "users[*].account.name (Johann)")
                assertEquals("nuberion", acc.get("login").asText(), "users[*].account.login (Johann)")
                assertEquals("Account", acc.get("__typename").asText(), "users[*].account.__typename (Johann)")
            }
            assertEquals("User", u1.get("__typename").asText(), "users[*].__typename (Johann)")
        }
    }

    @Test
    fun `statistics issues snapshot returns expected first item`() {
        val query =
            $$"""
            query (
              $page: Int,
              $perPage: Int,
              $since: Timestamp,
              $until: Timestamp
            ) {
              issues(page: $page, perPage: $perPage, since: $since, until: $until) {
                page
                perPage
                count
                data {
                  iid
                  title
                  state
                  webUrl
                  createdAt
                  closedAt
                  updatedAt
                  author { login name user { gitSignature id __typename } __typename }
                  assignee { login name user { gitSignature id __typename } __typename }
                  assignees { login name user { gitSignature id __typename } __typename }
                  notes { author { id name user { gitSignature id __typename } __typename } body createdAt updatedAt __typename }
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
                "since" to "2024-08-08T03:00",
                "until" to "2025-12-08T12:00:26",
            )

        val root = client.execute(query, variables)
        val issues = root.get("issues")

        assertEquals(1, issues.get("page").asInt(), "issues.page")
        assertEquals(1000, issues.get("perPage").asInt(), "issues.perPage")
        assertEquals(78, issues.get("count").asInt(), "issues.count")
        assertEquals("PaginatedIssue", issues.get("__typename").asText(), "issues.__typename")

        val data = issues.get("data")
        assertTrue(data.size() > 0, "issues.data should contain at least one item")

        val first = data.get(0)
        assertEquals("252", first.get("iid").asText(), "issue.iid")
        assertEquals("Classification of Commit Characteristics with GPT 4", first.get("title").asText(), "issue.title")
        assertEquals("CLOSED", first.get("state").asText(), "issue.state")
        assertEquals("https://github.com/INSO-World/Binocular/issues/252", first.get("webUrl").asText(), "issue.webUrl")
        val createdAt = first.get("createdAt").asText()
        assertIsoInstantEquals(createdAt, "2024-08-08T06:55:09Z", "issue.createdAt was $createdAt")
        val closedAt = first.get("closedAt").asText()
        assertIsoInstantEquals(closedAt, "2025-09-08T12:15:08Z", "issue.closedAt was $closedAt")
        val updatedAt = first.get("updatedAt").asText()
        assertIsoInstantEquals(updatedAt, "2025-09-08T12:15:08Z", "issue.updatedAt was $updatedAt")
        assertEquals("Issue", first.get("__typename").asText(), "issue.__typename")

        val author = first.get("author")
        assertEquals("uberroot4", author.get("login").asText(), "issue.author.login")
        assertEquals("Manuel Stöger", author.get("name").asText(), "issue.author.name")
        val authorUser = author.get("user")
        assertEquals(
            "Manuel Stöger <manuel.stoeger@inso-world.com>",
            authorUser.get("gitSignature").asText(),
            "issue.author.user.gitSignature"
        )
        // assertEquals("6869054", authorUser.get("id").asText(), "issue.author.user.id")
        assertEquals("User", authorUser.get("__typename").asText(), "issue.author.user.__typename")
        assertEquals("Account", author.get("__typename").asText(), "issue.author.__typename")

        val assignee = first.get("assignee")
        assertEquals("maerqin", assignee.get("login").asText(), "issue.assignee.login")
        assertEquals("Marcin Boniecki", assignee.get("name").asText(), "issue.assignee.name")
        val assigneeUser = assignee.get("user")
        assertEquals("maerqin <marcin.bon11@gmail.com>", assigneeUser.get("gitSignature").asText(), "issue.assignee.user.gitSignature")
        // assertEquals("7060912", assigneeUser.get("id").asText(), "issue.assignee.user.id")
        assertEquals("User", assigneeUser.get("__typename").asText(), "issue.assignee.user.__typename")
        assertEquals("Account", assignee.get("__typename").asText(), "issue.assignee.__typename")

        val assignees = first.get("assignees")
        assertEquals(1, assignees.size(), "issue.assignees size")
        val ass0 = assignees.get(0)
        assertEquals("maerqin", ass0.get("login").asText(), "issue.assignees[0].login")
        assertEquals("Marcin Boniecki", ass0.get("name").asText(), "issue.assignees[0].name")
        val ass0User = ass0.get("user")
        assertEquals("maerqin <marcin.bon11@gmail.com>", ass0User.get("gitSignature").asText(), "issue.assignees[0].user.gitSignature")
        // assertEquals("7060912", ass0User.get("id").asText(), "issue.assignees[0].user.id")
        assertEquals("User", ass0User.get("__typename").asText(), "issue.assignees[0].user.__typename")
        assertEquals("Account", ass0.get("__typename").asText(), "issue.assignees[0].__typename")

        val notes = first.get("notes")
        assertEquals(0, notes.size(), "issue.notes should be empty")
    }

    @Test
    fun `statistics builds snapshot returns expected first item`() {
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
                  jobs { id name status stage createdAt finishedAt __typename }
                  startedAt
                  status
                  updatedAt
                  commit { user { id gitSignature __typename } __typename }
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
                "since" to 1723078800000,
                "until" to 1765191626000,
                "sort" to "ASC",
            )

        val root = client.execute(query, variables)
        val builds = root.get("builds")

        assertEquals(1811, builds.get("count").asInt(), "builds.count")
        assertEquals(1, builds.get("page").asInt(), "builds.page")
        assertEquals(1000, builds.get("perPage").asInt(), "builds.perPage")
        assertEquals("PaginatedBuild", builds.get("__typename").asText(), "builds.__typename")

        val data = builds.get("data")
        assertTrue(data.size() > 0, "builds.data should contain at least one item")

        val first = data.get(0)
        // assertEquals("6660824", first.get("id").asText(), "build.id")
        assertIsoInstantEquals(first.get("committedAt").asText(), "2024-10-17T12:47:21.000Z", "build.committedAt")
        assertIsoInstantEquals(first.get("createdAt").asText(), "2024-10-17T12:47:31.000Z", "build.createdAt")
        assertEquals(46, first.get("duration").asInt(), "build.duration")
        assertIsoInstantEquals(first.get("finishedAt").asText(), "2024-10-17T12:48:18.000Z", "build.finishedAt")

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
        assertEquals("success", first.get("status").asText(), "build.status")
        assertIsoInstantEquals(first.get("updatedAt").asText(), "2025-11-22T08:59:56.000Z", "build.updatedAt")

        val commit = first.get("commit")
        val user = commit.get("user")
        // assertEquals("6861170", user.get("id").asText(), "build.commit.user.id")
        assertEquals("Bastian Ferch <bastian.ferch@gmail.com>", user.get("gitSignature").asText(), "build.commit.user.gitSignature")
        assertEquals("User", user.get("__typename").asText(), "build.commit.user.__typename")
        assertEquals("Commit", commit.get("__typename").asText(), "build.commit.__typename")

        assertEquals("Build", first.get("__typename").asText(), "build.__typename")
    }

    @Test
    fun `statistics mergeRequests snapshot returns expected first item`() {
        val query =
            $$"""
            query (
              $page: Int,
              $perPage: Int,
              $since: Timestamp,
              $until: Timestamp
            ) {
              mergeRequests(page: $page, perPage: $perPage, since: $since, until: $until) {
                page
                perPage
                count
                data {
                  iid
                  title
                  state
                  webUrl
                  createdAt
                  closedAt
                  updatedAt
                  sourceBranch
                  targetBranch
                  author { login name user { gitSignature id __typename } __typename }
                  assignee { login name user { gitSignature id __typename } __typename }
                  assignees { login name user { gitSignature id __typename } __typename }
                  notes { author { id name user { gitSignature id __typename } __typename } body createdAt updatedAt __typename }
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
                "since" to "2024-08-08T03:00",
                "until" to "2025-12-08T12:00:26",
            )

        val root = client.execute(query, variables)
        val mr = root.get("mergeRequests")

        assertEquals(1, mr.get("page").asInt(), "mergeRequests.page")
        assertEquals(1000, mr.get("perPage").asInt(), "mergeRequests.perPage")
        assertEquals(56, mr.get("count").asInt(), "mergeRequests.count")

        val data = mr.get("data")
        assertTrue(data.size() > 0, "mergeRequests.data should contain at least one item")

        val first = data.get(0)
        assertEquals("254", first.get("iid").asText(), "data[0].iid")
        assertEquals("Feature/251 Additional Tests", first.get("title").asText(), "data[0].title")
        assertEquals("MERGED", first.get("state").asText(), "data[0].state")
        assertEquals("https://github.com/INSO-World/Binocular/pull/254", first.get("webUrl").asText(), "data[0].webUrl")
        assertIsoInstantEquals(first.get("createdAt").asText(), "2024-09-14T10:54:33Z", "data[0].createdAt")
        assertIsoInstantEquals(first.get("closedAt").asText(), "2024-09-25T08:22:36Z", "data[0].closedAt")
        assertIsoInstantEquals(first.get("updatedAt").asText(), "2024-09-25T08:22:37Z", "data[0].updatedAt")
        assertTrue(first.get("sourceBranch").isNull, "data[0].sourceBranch should be null")
        assertTrue(first.get("targetBranch").isNull, "data[0].targetBranch should be null")

        val author = first.get("author")
        assertEquals("Nyzabes", author.get("login").asText(), "data[0].author.login")
        assertEquals("Sebastian Watzinger", author.get("name").asText(), "data[0].author.name")
        val authorUser = author.get("user")
        assertEquals(
            "Sebastian Watzinger <se.watzinger@gmail.com>",
            authorUser.get("gitSignature").asText(),
            "data[0].author.user.gitSignature"
        )
        // assertEquals("6812846", authorUser.get("id").asText(), "data[0].author.user.id")
        assertEquals("User", authorUser.get("__typename").asText(), "data[0].author.user.__typename")
        assertEquals("Account", author.get("__typename").asText(), "data[0].author.__typename")

        assertTrue(first.get("assignee").isNull, "data[0].assignee should be null")
        assertEquals(0, first.get("assignees").size(), "data[0].assignees should be empty array")
        assertEquals(0, first.get("notes").size(), "data[0].notes should be empty array")

        assertEquals("mergeRequest", first.get("__typename").asText(), "data[0].__typename")
        assertEquals("PaginatedmergeRequest", mr.get("__typename").asText(), "mergeRequests.__typename")
    }
}
