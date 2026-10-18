package com.inso_world.binocular.web.graphql.integration.realdata.visualizations

import com.inso_world.binocular.web.graphql.integration.realdata.assertions.DateAssertions.assertIsoInstantEquals
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

internal class CommitsBaseInformationVisualizationRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `commits base info returns earliest date when ascending by default`() {
        val query =
            """
            {
              commits(page: 1, perPage: 1) {
                data {
                  date
                  __typename
                }
                __typename
              }
            }
            """.trimIndent()

        val root = client.execute(query)
        val commits = root.get("commits")
        val data = commits.get("data")

        assertEquals(1, data.size(), "commits.data should contain exactly one item when perPage=1")

        val first = data.get(0)
        assertIsoInstantEquals(first.get("date").asText(), "2016-11-16T13:22:07.000Z", "first commit date (ascending/default)")
        assertEquals("Commit", first.get("__typename").asText(), "first item __typename")
        assertEquals("PaginatedCommit", commits.get("__typename").asText(), "container __typename")
    }

    @Test
    fun `commits base info returns latest date when sorted descending`() {
        val query =
            """
            {
              commits(page: 1, perPage: 1, sort: "desc") {
                data {
                  date
                  __typename
                }
                __typename
              }
            }
            """.trimIndent()

        val root = client.execute(query)
        val commits = root.get("commits")
        val data = commits.get("data")

        assertEquals(1, data.size(), "commits.data should contain exactly one item when perPage=1")

        val first = data.get(0)
        assertIsoInstantEquals(first.get("date").asText(), "2025-11-14T12:09:10.000Z", "first commit date (descending)")
        assertEquals("Commit", first.get("__typename").asText(), "first item __typename")
        assertEquals("PaginatedCommit", commits.get("__typename").asText(), "container __typename")
    }
}
