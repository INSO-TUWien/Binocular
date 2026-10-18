package com.inso_world.binocular.cli.service

import com.inso_world.binocular.cli.exception.ServiceException
import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.exception.BinocularInfrastructureException
import com.inso_world.binocular.core.service.CommitInfrastructurePort
import com.inso_world.binocular.core.service.RepositoryInfrastructurePort
import com.inso_world.binocular.core.service.exception.NotFoundException
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Repository
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.util.stream.Collectors
import kotlin.streams.asSequence

@Service
class CommitService(
    @Autowired private val commitPort: CommitInfrastructurePort,
    @Autowired private val repositoryPort: RepositoryInfrastructurePort,
) {
    companion object {
        val logger by logger()
    }

    fun checkExisting(
        repo: Repository,
        minedCommits: Collection<Commit>,
    ): Pair<Collection<Commit>, Collection<Commit>> {
        val allShas: Set<String> =
            minedCommits
                .stream()
                .map { m -> m.sha }
                .collect(Collectors.toSet())

        val existingEntities: Sequence<Commit> =
            try {
                repositoryPort.findExistingCommits(repo, allShas)
//                commitPort.findExistingSha(repo, allShas)
            } catch (_: NotFoundException) {
                sequenceOf()
            }

        val refIdsToRemove = existingEntities.map { it.sha }.asSequence()
        val missingShas = minedCommits.filterNot { it.sha in refIdsToRemove } // .stream().collect(Collectors.toSet())

        return Pair(existingEntities.toList(), missingShas.toList())
    }

    fun findAll(
        repo: Repository,
        @Min(0) page: Int = 0,
        @Min(0) @Max(2048) perPage: Int = 100,
    ): Iterable<Commit> {
        logger.trace("Loading all commits...")
        val page = if (page < 0) 0 else page
        val perPage = if (perPage < 0) 0 else perPage
        logger.debug("page is $page, perPage is $perPage")
        val pageable: Pageable = PageRequest.of(page, perPage)

        try {
            return commitPort.findAll(repo, pageable)
        } catch (e: BinocularInfrastructureException) {
            throw ServiceException(e)
        }
    }

    fun findHeadForBranch(
        repo: Repository,
        branch: String,
    ): Commit? {
        logger.trace("Finding head for branch $branch in repository ${repo.localPath}...")
        return commitPort.findHeadForBranch(repo, branch)
    }
}
