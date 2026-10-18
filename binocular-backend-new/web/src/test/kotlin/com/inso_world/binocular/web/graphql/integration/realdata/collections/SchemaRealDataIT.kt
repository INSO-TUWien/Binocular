package com.inso_world.binocular.web.graphql.integration.realdata.collections

import com.inso_world.binocular.web.graphql.integration.realdata.base.BaseGraphQlCompatibilityIT
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

internal class SchemaRealDataIT : BaseGraphQlCompatibilityIT() {
    @Test
    fun `schema exposes commits query`() {
        val data =
            client.execute(
                """
            { __schema { queryType { fields { name } } } }
            """
            )
        val fields =
            data
                .get("__schema")
                .get("queryType")
                .get("fields")
                .map { it.get("name").asText() }
        Assertions.assertTrue(fields.contains("commits"), "Schema should expose 'commits' root query")
    }
}
