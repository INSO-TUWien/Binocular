package com.inso_world.binocular.web.graphql.integration.realdata.local_test

import org.junit.jupiter.api.Assumptions
import org.junit.jupiter.api.Test
import java.net.ConnectException
import java.net.URL

internal class LegacyReachabilityIT {
    private val candidates =
        listOfNotNull(
            System.getProperty("graphql.legacy.url"), // explicit override
            "http://localhost:8080/graphQl",
            "http://[::1]:8080/graphQl",
            "http://localhost:9123/graphQl",
            "http://[::1]:9123/graphQl",
            "http://localhost:48763/graphQl"
        )

    @Test
    fun `verify legacy is reachable`() {
        var reachableResponse: String?
        var reachableEndpoint = false

        for (endpoint in candidates) {
            try {
                val text = URL(endpoint).readText()
                reachableResponse = text.take(200)
                reachableEndpoint = true

                println("[LEGACY-REACHABILITY] SUCCESS → $endpoint")
                println("[LEGACY-REACHABILITY] RESPONSE → $reachableResponse")
            } catch (e: ConnectException) {
                println("[LEGACY-REACHABILITY] FAILED  → $endpoint (${e.message})")
            } catch (e: Exception) {
                println("[LEGACY-REACHABILITY] ERROR   → $endpoint (${e::class.simpleName}: ${e.message})")
            }
        }

        // Skip test if nothing reachable
        Assumptions.assumeTrue(
            reachableEndpoint,
            "Legacy GraphQL endpoint not reachable via: $candidates"
        )
    }
}
