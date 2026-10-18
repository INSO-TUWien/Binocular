package com.inso_world.binocular.web.graphql.integration.realdata.base.legacy

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.inso_world.binocular.web.graphql.integration.realdata.base.CompatibleGraphQlClient
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

internal class LegacyHttpGraphQlClient(
    private val baseUrl: String
) : CompatibleGraphQlClient {
    companion object {
        init {
            if (System.getProperty("graphql.target", "legacy").lowercase() == "legacy") {
                System.setProperty("java.net.preferIPv6Addresses", "true")
                println("[TEST-SETUP] Forcing JVM to prefer IPv6 addresses")
            }
        }
    }

    private val http =
        HttpClient
            .newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .version(HttpClient.Version.HTTP_1_1) // IMPORTANT - idk seems like java uses 2 by default but vite only proxies 1.1
            .build()

    private val mapper = ObjectMapper()

    override fun execute(
        query: String,
        variables: Map<String, Any?>
    ): JsonNode {
        val body: ObjectNode =
            mapper.createObjectNode().apply {
                put("query", query.trim())
                if (variables.isNotEmpty()) {
                    set<ObjectNode>("variables", mapper.valueToTree(variables))
                }
            }

        val payload = mapper.writeValueAsString(body)

        val request =
            HttpRequest
                .newBuilder()
                .uri(URI.create(baseUrl))
                .timeout(Duration.ofSeconds(10))
                // Browser-like headers, not sure but works
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("User-Agent", "curl/8.0.0")
                .header("Origin", "http://localhost:8080")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build()

        val response =
            try {
                http.send(request, HttpResponse.BodyHandlers.ofString())
            } catch (e: Exception) {
                throw IllegalStateException(
                    "Cannot reach legacy GraphQL endpoint at $baseUrl (${e::class.simpleName}: ${e.message})",
                    e
                )
            }

        if (response.statusCode() !in 200..299) {
            throw IllegalStateException(
                "Legacy GraphQL call failed: HTTP ${response.statusCode()} → ${response.body().take(500)}"
            )
        }

        val root = mapper.readTree(response.body())
        val dataNode =
            root["data"]
                ?: error("Legacy GraphQL response does not contain 'data': ${response.body()}")

        return if (dataNode.has("data")) dataNode["data"] else dataNode
    }
}
