package com.inso_world.binocular.github.service

import com.inso_world.binocular.github.client.GraphQlClient
import com.inso_world.binocular.github.dto.PageInfo
import com.inso_world.binocular.github.dto.issue.GraphQlIssueResponse
import com.inso_world.binocular.github.dto.issue.ItsGitHubIssue
import com.inso_world.binocular.github.dto.user.GraphQlUserResponse
import com.inso_world.binocular.github.dto.user.ItsGitHubUser
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * Service for accessing GitHub API (GraphQl).
 */
@Service
class GitHubService(
    private val graphQLClient: GraphQlClient
) {
    private var logger: Logger = LoggerFactory.getLogger(GitHubService::class.java)

    /**
     * Load all assignable users from GitHub.
     *
     * @param owner the owner of the repository
     * @param repo the name of the GitHub repository
     * @return list of ItsGitHubUsers
     */
    fun loadAllAssignableUsers(
        owner: String,
        repo: String
    ): Mono<List<ItsGitHubUser>> {
        logger.trace("Load all assignable users from GitHub for $owner $repo")
        val allUsers = mutableListOf<ItsGitHubUser>()

        fun fetchPage(cursor: String?): Mono<Pair<List<ItsGitHubUser>, PageInfo>> {
            val query = """
            query(${"$"}cursor: String) {
              repository(owner: "$owner", name: "$repo") {
                assignableUsers(first: 100, after: ${"$"}cursor) {
                  nodes {
                    id
                    login
                    name
                    url
                    avatarUrl
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
        """
            val variables: Map<String, Any?> = mapOf("cursor" to cursor)

            return graphQLClient
                .execute(query, variables, GraphQlUserResponse::class.java)
                .map { res ->
                    val users = res.data.repository.assignableUsers.nodes
                    val pageInfo = res.data.repository.assignableUsers.pageInfo
                    logger.info("Received ${users.size} users, hasNextPage= ${pageInfo.hasNextPage}")
                    users to pageInfo
                }
        }

        fun fetchAllPages(cursor: String? = null): Mono<List<ItsGitHubUser>> =
            fetchPage(cursor).flatMap { (users, pageInfo) ->
                allUsers.addAll(users)
                if (pageInfo.hasNextPage) {
                    fetchAllPages(pageInfo.endCursor)
                } else {
                    Mono.just(allUsers)
                }
            }

        return fetchAllPages()
    }

    fun loadIssuesWithEvents(
        owner: String,
        repo: String
    ): Mono<List<ItsGitHubIssue>> {
        logger.trace("Load issues with events from GitHub for $owner $repo")
        val allIssues = mutableListOf<ItsGitHubIssue>()

        fun fetchPage(cursor: String?): Mono<Pair<List<ItsGitHubIssue>, PageInfo>> {
            val query = """
    query(${"$"}cursor: String) {
      repository(owner: "$owner", name: "$repo") {
        issues(first: 50, after: ${"$"}cursor) {
          totalCount
          nodes {
            id
            number
            title
            body
            state
            url
            closedAt
            createdAt
            updatedAt
            labels(first: 100) {
              nodes {
                id
                url
                name
                color
                isDefault
                description
              }
            }
            milestone {
              id
              url
              number
              state
              title
              description
              creator {
                login
              }
              createdAt
              updatedAt
              closedAt
              dueOn
            }
            author {
              login
            }
            assignees(first: 100) {
              nodes {
                login
              }
            }
            timelineItems(first: 200, itemTypes: [CLOSED_EVENT, REFERENCED_EVENT]) {
              totalCount
              nodes {
                ... on ReferencedEvent {
                  createdAt
                  commit {
                    oid
                  }
                }
                ... on ClosedEvent {
                  createdAt
                  actor {
                    login
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
"""
            val variables = mapOf("cursor" to cursor)

            return graphQLClient
                .execute(query, variables, GraphQlIssueResponse::class.java)
                .map { res ->
                    val issuesConnection = res.data.repository.issues
                    val issues = issuesConnection.nodes
                    val pageInfo = issuesConnection.pageInfo
                    logger.info("Fetched ${issues.size} issues, hasNextPage=${pageInfo.hasNextPage}")
                    issues to pageInfo
                }
        }

        fun fetchAllPages(cursor: String? = null): Mono<List<ItsGitHubIssue>> =
            fetchPage(cursor).flatMap { (issues, pageInfo) ->
                allIssues.addAll(issues)
                if (pageInfo.hasNextPage) {
                    fetchAllPages(pageInfo.endCursor)
                } else {
                    Mono.just(allIssues)
                }
            }

        return fetchAllPages()
    }
}
