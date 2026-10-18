package unit

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.inso_world.binocular.github.client.GraphQlClient
import com.inso_world.binocular.github.dto.issue.GraphQlIssueResponse
import com.inso_world.binocular.github.dto.issue.ItsReferencedEvent
import com.inso_world.binocular.github.dto.user.GraphQlUserResponse
import com.inso_world.binocular.github.service.GitHubService
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.core.io.ClassPathResource
import reactor.core.publisher.Mono
import reactor.test.StepVerifier

class GitHubServiceTest {
    private val graphQLClient = Mockito.mock(GraphQlClient::class.java)
    private val gitHubService = GitHubService(graphQLClient)

    private val mapper = jacksonObjectMapper()

    @Nested
    inner class LoadUsers {
        private fun loadUserResponse(filename: String): GraphQlUserResponse {
            val resource = ClassPathResource("response/$filename")
            return mapper.readValue(resource.file)
        }

        @Test
        fun `should load all assignable users with pagination`() {
            val responsePage1 = loadUserResponse("MockUsersHasNextPage.json")
            val responsePage2 = loadUserResponse("MockUsersNoNextPage.json")

            // mock response page 1
            whenever(
                graphQLClient.execute(
                    any(),
                    argThat { arg -> arg != null && arg["cursor"] == null },
                    eq(GraphQlUserResponse::class.java)
                )
            ).thenReturn(Mono.just(responsePage1))

            // mock response page 2
            whenever(
                graphQLClient.execute(
                    any(),
                    argThat { arg -> arg != null && arg["cursor"] == "Y3Vyc29yOm1vY2s=" },
                    eq(GraphQlUserResponse::class.java)
                )
            ).thenReturn(Mono.just(responsePage2))

            val resultMono = gitHubService.loadAllAssignableUsers("INSO-World", "Binocular")

            // verify that all users have been correctly loaded (login and id are not blank)
            StepVerifier
                .create(resultMono)
                .expectNextMatches { users ->
                    users.size == 150 &&
                        users[0].login == "user001" &&
                        users.last().login == "user150"
                    users.all {
                        it.login.isNotBlank() &&
                            it.id.isNotBlank()
                    }
                }.verifyComplete()
        }

        @Test
        fun `should load all assignable users without pagination`() {
            val responsePage = loadUserResponse("MockUsersNoNextPage.json")

            // mock response page 1
            whenever(
                graphQLClient.execute(
                    any(),
                    argThat { arg -> arg != null && arg["cursor"] == null },
                    eq(GraphQlUserResponse::class.java)
                )
            ).thenReturn(Mono.just(responsePage))

            val resultMono = gitHubService.loadAllAssignableUsers("INSO-World", "Binocular")

            // verify that all users have been correctly loaded (login and id are not blank)
            StepVerifier
                .create(resultMono)
                .expectNextMatches { users ->
                    users.size == 50 &&
                        users[0].login == "user101" &&
                        users.last().login == "user150"
                    users.all {
                        it.login.isNotBlank() &&
                            it.id.isNotBlank()
                    }
                }.verifyComplete()
        }
    }

    @Nested
    inner class LoadIssues {
        private fun loadIssueResponse(filename: String): GraphQlIssueResponse {
            val resource = ClassPathResource("response/$filename")
            return mapper.readValue(resource.file)
        }

        @Test
        fun `should load all issues without pagination`() {
            val responsePage = loadIssueResponse("BinocularIssuesSmall.json")

            // mock response page 1
            whenever(
                graphQLClient.execute(
                    any(),
                    argThat { arg -> arg != null && arg["cursor"] == null },
                    eq(GraphQlIssueResponse::class.java)
                )
            ).thenReturn(Mono.just(responsePage))

            val resultMono = gitHubService.loadIssuesWithEvents("INSO-World", "Binocular")

            StepVerifier
                .create(resultMono)
                .expectNextMatches { issues ->
                    issues.size == 12 &&
                        issues[0].number == 177 &&
                        issues.last().number == 205
                    issues.all {
                        it.id.isNotBlank() &&
                            it.title.isNotBlank()
                    }

                    // get all commits (only referenced events)
                    val allCommits =
                        issues
                            .flatMap { issue -> issue.timelineItems?.nodes ?: emptyList() }
                            .filterIsInstance<ItsReferencedEvent>()
                            .mapNotNull { it.commit }

                    // verify that all mapped commits have oids
                    allCommits.isNotEmpty() &&
                        allCommits.all { it.oid.isNotBlank() }

                    // get all users
                    val allUsers =
                        issues
                            .flatMap { it.assignees?.nodes ?: emptyList() }

                    // verify that all users have a login
                    allUsers.isNotEmpty() &&
                        allUsers.all { it.login.isNotBlank() }

                    // get all labels
                    val allLabels =
                        issues
                            .flatMap { it.labels?.nodes ?: emptyList() }

                    // verify that all labels have a name
                    allLabels.isNotEmpty() &&
                        allLabels.all { it.name.isNotBlank() }
                }.verifyComplete()
        }

        @Test
        fun `should load all issues with pagination`() {
            val responsePage1 = loadIssueResponse("BinocularIssuesHasNextPage.json")
            val responsePage2 = loadIssueResponse("BinocularIssuesNoNextPage.json")

            // mock response page 1
            whenever(
                graphQLClient.execute(
                    any(),
                    argThat { arg -> arg != null && arg["cursor"] == null },
                    eq(GraphQlIssueResponse::class.java)
                )
            ).thenReturn(Mono.just(responsePage1))

            // mock response page 2
            whenever(
                graphQLClient.execute(
                    any(),
                    argThat { arg -> arg != null && arg["cursor"] == "Y3Vyc29yOnYyOpK5MjAyMy0xMS0wMlQxNDowMjo0OCswMTowMM51q_K6" },
                    eq(GraphQlIssueResponse::class.java)
                )
            ).thenReturn(Mono.just(responsePage2))

            val resultMono = gitHubService.loadIssuesWithEvents("INSO-World", "Binocular")

            StepVerifier
                .create(resultMono)
                .expectNextMatches { issues ->
                    issues.size == 181 &&
                        issues[0].number == 2 &&
                        issues.last().number == 339
                    issues.all {
                        it.id.isNotBlank() &&
                            it.title.isNotBlank()
                    }

                    // get all commits (only referenced events)
                    val allCommits =
                        issues
                            .flatMap { issue -> issue.timelineItems?.nodes ?: emptyList() }
                            .filterIsInstance<ItsReferencedEvent>()
                            .mapNotNull { it.commit }

                    // verify that all mapped commits have oids
                    allCommits.isNotEmpty() &&
                        allCommits.all { it.oid.isNotBlank() }

                    // get all users
                    val allUsers =
                        issues
                            .flatMap { it.assignees?.nodes ?: emptyList() }

                    // verify that all users have a login
                    allUsers.isNotEmpty() &&
                        allUsers.all { it.login.isNotBlank() }

                    // get all labels
                    val allLabels =
                        issues
                            .flatMap { it.labels?.nodes ?: emptyList() }

                    // verify that all labels have a name
                    allLabels.isNotEmpty() &&
                        allLabels.all { it.name.isNotBlank() }
                }.verifyComplete()
        }
    }
}
