package com.inso_world.binocular.cli.service.its

import com.inso_world.binocular.cli.service.ProjectService
import com.inso_world.binocular.cli.service.VcsService
import com.inso_world.binocular.github.service.GitHubService
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Project
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

/**
 * Service for indexing ITS data.
 */
@Service
class ItsService(
    private val gitHubService: GitHubService,
    private val accountService: AccountService,
    private val projectService: ProjectService,
) {
    private var logger: Logger = LoggerFactory.getLogger(VcsService::class.java)

    fun indexAccountsFromGitHub(
        owner: String,
        repo: String,
        project: Project
    ): Mono<List<Account>> {
        logger.info("Indexing accounts from GitHub for $owner/$repo")

        return gitHubService
            .loadAllAssignableUsers(owner, repo)
            .map { users ->
                users.map { it.toDomain(project) }
            }.flatMap { accounts ->
                val (existing, missing) = accountService.checkExisting(accounts)
                logger.debug("Found ${existing.size} existing accounts, ${missing.size} new accounts to be added")

                if (missing.isNotEmpty()) {
                    // new accounts to save
                    logger.debug("Saving ${missing.size} new accounts")
                    accountService.saveAll(missing as List<Account>).map { saved ->
                        saved + existing
                    }
                } else {
                    Mono.just(existing.toList())
                }
            }
    }

    // TODO index issues
    fun indexIssuesFromGitHub(
        owner: String,
        repo: String,
        project: Project
    ) {
        logger.trace(">>> indexIssuesFromGitHub({}, {}, {})", owner, repo, project)

        // get issues from ITS GitHub
        val itsGitHubIssues = gitHubService.loadIssuesWithEvents(owner, repo).block()

        val issueIds = itsGitHubIssues!!.map { it.id }

        logger.debug("Found ${ issueIds.size } issues from GitHub for $owner/$repo")

        // TODO check what is really needed for this func
        this.projectService.addIssues(itsGitHubIssues, project, repo, owner)

        logger.trace("<<< indexIssuesFromGitHub({}, {}, {})", owner, repo, project)
    }
}
