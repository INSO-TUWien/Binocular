package com.inso_world.binocular.web.graphql.integration.realdata.base

import com.fasterxml.jackson.databind.JsonNode

internal interface CompatibleGraphQlClient {
    fun execute(query: String): JsonNode = execute(query, emptyMap())

    fun execute(
        query: String,
        variables: Map<String, Any?>
    ): JsonNode
}
