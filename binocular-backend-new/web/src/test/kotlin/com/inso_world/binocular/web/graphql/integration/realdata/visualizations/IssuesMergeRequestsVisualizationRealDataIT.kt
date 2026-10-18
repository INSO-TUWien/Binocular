package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class IssuesMergeRequestsVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `merge requests query returns expected snapshot for first item`() {
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
        val createdAt = first.get("createdAt").asText()
        assertIsoInstantEquals(createdAt, "2024-09-14T10:54:33Z", "data[0].createdAt")
        val closedAt = first.get("closedAt").asText()
        assertIsoInstantEquals(closedAt, "2024-09-25T08:22:36Z", "data[0].closedAt")
        val updatedAt = first.get("updatedAt").asText()
        assertIsoInstantEquals(updatedAt, "2024-09-25T08:22:37Z", "data[0].updatedAt")

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

        // Assignee is expected to be null and arrays empty
        assertTrue(first.get("assignee").isNull, "data[0].assignee should be null")
        assertEquals(0, first.get("assignees").size(), "data[0].assignees should be empty array")
        assertEquals(0, first.get("notes").size(), "data[0].notes should be empty array")

        assertEquals("mergeRequest", first.get("__typename").asText(), "data[0].__typename")
        assertEquals("PaginatedmergeRequest", mr.get("__typename").asText(), "mergeRequests.__typename")
    }
}
