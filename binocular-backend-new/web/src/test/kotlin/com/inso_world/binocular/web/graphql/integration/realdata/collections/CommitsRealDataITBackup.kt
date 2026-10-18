package com.inso_world.binocular.web.graphql.integration.realdata.collections

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

internal class CommitsRealDataITBackup : BaseGraphQlCompatibilityIT() {
    @Test
    fun `should execute a simple commits query`() {
        val result: JsonNode =
            client
                .execute(
                    """
            query {
                commits(page: 1, perPage: 1) {
                    count
                    page
                    perPage
                    data { sha }
                }
            }
            """
                ).get("commits")

        Assertions.assertTrue(result.has("count"), "commits.count should be present")
        Assertions.assertTrue(result.get("count").asInt() >= 0, "commits.count should be >= 0")
        Assertions.assertEquals(3599, result.get("count").asInt(), "commits.count should be 1")
    }
}
