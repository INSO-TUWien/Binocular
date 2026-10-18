package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

internal class AuthorBehaviourCollaborationVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `accounts issues query returns expected snapshot for first account`() {
        val query =
            $$"""
            query getAccountsIssues(
              $page: Int,
              $perPage: Int,
              $from: Timestamp,
              $to: Timestamp
            ) {
              accounts(page: $page, perPage: $perPage) {
                count
                page
                perPage
                data {
                  platform
                  login
                  name
                  url
                  avatarUrl
                  issues(from: $from, to: $to) {
                    id
                    iid
                    title
                    description
                    createdAt
                    closedAt
                    state
                    webUrl
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
                "from" to "2024-08-08T03:00",
                "to" to "2025-12-08T12:00:26",
            )

        val root = client.execute(query, variables)
        val accounts = root.get("accounts")

        // Container checks
        assertEquals(54, accounts.get("count").asInt(), "accounts.count")
        assertEquals(1, accounts.get("page").asInt(), "accounts.page")
        assertEquals(1000, accounts.get("perPage").asInt(), "accounts.perPage")

        val data = accounts.get("data")
        assertTrue(data.size() > 0, "accounts.data should contain at least one item")

        val first = data.get(0)
        assertEquals("GitHub", first.get("platform").asText(), "first.platform")
        assertEquals("juliankotrba", first.get("login").asText(), "first.login")
        assertEquals("Julian Kotrba", first.get("name").asText(), "first.name")
        assertEquals("https://github.com/juliankotrba", first.get("url").asText(), "first.url")
        assertEquals(
            "https://avatars.githubusercontent.com/u/10738773?u=1f46ec19f2cdfdcc2b0389e3e66c65cfc78da310&v=4",
            first.get("avatarUrl").asText(),
            "first.avatarUrl"
        )

        val issues = first.get("issues")
        // assertEquals(0, issues.size(), "first.issues should be an empty array per snapshot")

        assertEquals("Account", first.get("__typename").asText(), "first.__typename")
    }
}
