package com.inso_world.binocular.github.client

import com.inso_world.binocular.github.config.BinocularRcLoader
import com.inso_world.binocular.github.exception.ServiceException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.time.Duration

@Component
class GraphQlClient(
    private val webClient: WebClient,
    private val configLoader: BinocularRcLoader
) {
    private val logger = LoggerFactory.getLogger(GraphQlClient::class.java)

    fun <T> execute(
        query: String,
        variables: Map<String, Any?> = emptyMap(),
        responseType: Class<T>,
    ): Mono<T> {
        val request =
            mapOf(
                "query" to query,
                "variables" to variables,
            )

        return webClient
            .post()
            .uri("https://api.github.com/graphql")
            .header("Authorization", "Bearer ${configLoader.loadGitHubToken()}")
            .bodyValue(request)
            .retrieve()
            .onStatus({ it.is4xxClientError || it.is5xxServerError }) { response ->
                logger.error("GitHub API returned error: ${response.statusCode()}")
                response.bodyToMono(String::class.java).map { body ->
                    ServiceException("GitHub API error ${response.statusCode()}: $body")
                }
            }.bodyToMono(responseType)
            .timeout(Duration.ofSeconds(90)) // to prevent time out for answer
    }
}
