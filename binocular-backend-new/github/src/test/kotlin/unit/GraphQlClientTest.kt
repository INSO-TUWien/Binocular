package unit

import com.inso_world.binocular.github.client.GraphQlClient
import com.inso_world.binocular.github.config.BinocularRcLoader
import com.inso_world.binocular.github.exception.ServiceException
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import kotlin.test.assertEquals

class GraphQlClientTest {
    private lateinit var webClient: WebClient
    private lateinit var configLoader: BinocularRcLoader
    private lateinit var client: GraphQlClient

    // WebClient mocks
    private lateinit var requestBodyUriSpec: WebClient.RequestBodyUriSpec
    private lateinit var requestHeadersSpec: WebClient.RequestHeadersSpec<*>
    private lateinit var responseSpec: WebClient.ResponseSpec

    @BeforeEach
    fun setUp() {
        webClient = mock()
        configLoader = mock()
        requestBodyUriSpec = mock()
        requestHeadersSpec = mock()
        responseSpec = mock()

        // mock WebClient calls
        whenever(webClient.post()).thenReturn(requestBodyUriSpec)
        whenever(requestBodyUriSpec.uri(any<String>())).thenReturn(requestBodyUriSpec)
        whenever(requestBodyUriSpec.header(any(), any())).thenReturn(requestBodyUriSpec)
        whenever(requestBodyUriSpec.bodyValue(any())).thenReturn(requestHeadersSpec)
        whenever(requestHeadersSpec.retrieve()).thenReturn(responseSpec)
        whenever(responseSpec.onStatus(any(), any())).thenReturn(responseSpec)

        client = GraphQlClient(webClient, configLoader)
    }

    @Test
    fun `execute should return successful response`() {
        // arrange query, variables and expected response
        val query = "query { viewer { login } }"
        val variables = emptyMap<String, Any?>()
        val expectedResponse = GitHubViewerResponse(data = ViewerData(viewer = Viewer(login = "testuser")))

        whenever(configLoader.loadGitHubToken()).thenReturn("fake_token")
        whenever(responseSpec.bodyToMono(GitHubViewerResponse::class.java)).thenReturn(Mono.just(expectedResponse))

        // execute the query
        val result = client.execute(query, variables, GitHubViewerResponse::class.java).block()

        // assert
        assertEquals("testuser", result?.data?.viewer?.login)
    }

    @Test
    fun `execute should throw ServiceException on server error`() {
        val query = "query { viewer { login } }"
        val variables = emptyMap<String, Any?>()

        whenever(configLoader.loadGitHubToken()).thenReturn("fake_token")

        // mock error mono response
        whenever(responseSpec.bodyToMono(Any::class.java)).thenReturn(
            Mono.error(ServiceException("GitHub API error 500: Internal Server Error"))
        )

        // execute the query
        val mono = client.execute(query, variables, Any::class.java)

        // assert that exception is thrown with correct messages
        StepVerifier
            .create(mono)
            .expectErrorSatisfies { error ->
                assert(error is ServiceException)
                assert(error.message!!.contains("500"))
                assert(error.message!!.contains("Internal Server Error"))
            }.verify()
    }

    // data classes for deserialization
    data class GitHubViewerResponse(
        val data: ViewerData
    )

    data class ViewerData(
        val viewer: Viewer
    )

    data class Viewer(
        val login: String
    )
}
