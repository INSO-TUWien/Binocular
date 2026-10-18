package com.inso_world.binocular.web.graphql.integration.realdata.base.spring

import com.fasterxml.jackson.databind.JsonNode
import com.inso_world.binocular.web.graphql.integration.realdata.base.CompatibleGraphQlClient
import org.springframework.graphql.test.tester.GraphQlTester

internal class SpringTesterGraphQlClient(
    private val tester: GraphQlTester
) : CompatibleGraphQlClient {
    override fun execute(
        query: String,
        variables: Map<String, Any?>
    ): JsonNode {
        var req = tester.document(query)
        variables.forEach { (k, v) ->
            req = req.variable(k, v)
        }
        return req
            .execute()
            .path("")
            .entity(JsonNode::class.java)
            .get()
    }
}
