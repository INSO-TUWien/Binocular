package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class IssuesIssuesVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `issues query returns expected snapshot for first item`() {
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
                  author {
                    login
                    name
                    user { gitSignature id __typename }
                    __typename
                  }
                  assignee {
                    login
                    name
                    user { gitSignature id __typename }
                    __typename
                  }
                  assignees {
                    login
                    name
                    user { gitSignature id __typename }
                    __typename
                  }
                  notes {
                    author { id name user { gitSignature id __typename } __typename }
                    body
                    createdAt
                    updatedAt
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
            )

        val root = client.execute(query, variables)
        val issues = root.get("issues")

        // Container checks
        assertEquals(1, issues.get("page").asInt(), "issues.page should be 1")
        assertEquals(1000, issues.get("perPage").asInt(), "issues.perPage should be 1000")
        assertEquals(78, issues.get("count").asInt(), "issues.count should match expected snapshot")
        assertEquals("PaginatedIssue", issues.get("__typename").asText(), "issues.__typename")

        val data = issues.get("data")
        assertTrue(data.size() > 0, "issues.data should contain at least one item")

        val first = data.get(0)
        assertEquals("252", first.get("iid").asText(), "issue.iid")
        assertEquals("Classification of Commit Characteristics with GPT 4", first.get("title").asText(), "issue.title")
        assertEquals("CLOSED", first.get("state").asText(), "issue.state")
        assertEquals("https://github.com/INSO-World/Binocular/issues/252", first.get("webUrl").asText(), "issue.webUrl")
        assertIsoInstantEquals(first.get("createdAt").asText(), "2024-08-08T06:55:09Z", "issue.createdAt")
        assertIsoInstantEquals(first.get("closedAt").asText(), "2025-09-08T12:15:08Z", "issue.closedAt")
        assertIsoInstantEquals(first.get("updatedAt").asText(), "2025-09-08T12:15:08Z", "issue.updatedAt")
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
        assertEquals(
            "maerqin <marcin.bon11@gmail.com>",
            assigneeUser.get("gitSignature").asText(),
            "issue.assignee.user.gitSignature"
        )
        // assertEquals("7060912", assigneeUser.get("id").asText(), "issue.assignee.user.id")
        assertEquals("User", assigneeUser.get("__typename").asText(), "issue.assignee.user.__typename")
        assertEquals("Account", assignee.get("__typename").asText(), "issue.assignee.__typename")

        val assignees = first.get("assignees")
        assertEquals(1, assignees.size(), "issue.assignees size")
        val assignees0 = assignees.get(0)
        assertEquals("maerqin", assignees0.get("login").asText(), "issue.assignees[0].login")
        assertEquals("Marcin Boniecki", assignees0.get("name").asText(), "issue.assignees[0].name")
        val assignees0User = assignees0.get("user")
        assertEquals(
            "maerqin <marcin.bon11@gmail.com>",
            assignees0User.get("gitSignature").asText(),
            "issue.assignees[0].user.gitSignature"
        )
        // assertEquals("7060912", assignees0User.get("id").asText(), "issue.assignees[0].user.id")
        assertEquals("User", assignees0User.get("__typename").asText(), "issue.assignees[0].user.__typename")
        assertEquals("Account", assignees0.get("__typename").asText(), "issue.assignees[0].__typename")

        val notes = first.get("notes")
        assertEquals(0, notes.size(), "issue.notes should be an empty array for this snapshot")
    }
}
