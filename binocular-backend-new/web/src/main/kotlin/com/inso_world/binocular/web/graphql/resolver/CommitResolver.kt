package com.inso_world.binocular.web.graphql.resolver

import com.inso_world.binocular.core.service.CommitInfrastructurePort
import com.inso_world.binocular.model.FileOwnership
import com.inso_world.binocular.model.Stats
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.*
import com.inso_world.binocular.web.util.PaginationUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller
import java.time.LocalDateTime

@Controller
class CommitResolver(
    private val commitService: CommitInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private val logger: Logger = LoggerFactory.getLogger(CommitResolver::class.java)

    /**
     * Resolves ownership for a FileInCommit.
     */
    @SchemaMapping(typeName = "FileInCommit", field = "ownership")
    fun ownership(fileInCommit: CommitFile): List<FileOwnership> {
        val commitId = fileInCommit.commitId ?: return emptyList()
        val fileId = fileInCommit.file?.id ?: return emptyList()
        return commitService.findFileOwnershipByCommitAndFile(commitId, fileId)
    }

    /**
     * Resolves the builds field for a Commit in GraphQL.
     *
     * This method retrieves all builds associated with the given commit.
     * If the commit ID is null, an empty list is returned.
     *
     * @param commit The commit for which to retrieve builds
     * @return A list of builds associated with the commit, or an empty list if the commit ID is null
     */
    @SchemaMapping(typeName = "Commit", field = "builds")
    fun builds(commit: CommitDto): List<BuildDto> {
        val id = commit.id ?: return emptyList()
        logger.info("Resolving builds for commit: $id")
        // Get all connections for this commit and extract the builds
        return commitService.findBuildsByCommitId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the files field for a Commit in GraphQL.
     *
     * This method retrieves all files associated with the given commit.
     * If the commit ID is null, an empty list is returned.
     *
     * @param commit The commit for which to retrieve files
     * @return A list of files associated with the commit, or an empty list if the commit ID is null
     */
    @SchemaMapping(typeName = "Commit", field = "files")
    fun files(
        commit: CommitDto,
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?
    ): CommitFileConnection {
        val currentPage = (page ?: 1).coerceAtLeast(1)
        val pageSize = perPage ?: 1000
        if (commit.id == null) {
            return CommitFileConnection(
                count = 0,
                page = currentPage,
                perPage = pageSize,
                data = emptyList()
            )
        }
        val id = requireNotNull(commit.id)

        logger.info("Resolving files for commit: $id (page=$page, perPage=$perPage, sort=$sort)")

        val fileStatsById = commitService.findFileStatsByCommitId(id)
        val fileActionsById = commitService.findFileActionsByCommitId(id)

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = currentPage,
                size = pageSize,
                sort = sort ?: Sort.DESC,
                sortBy = "id",
            )
        val pageResult = commitService.findFilesByCommitId(id, pageable)

        val data =
            pageResult.content.map { f ->
                val stats = f.id?.let { fileStatsById[it] } ?: Stats(additions = 0, deletions = 0)
                val additions = (stats.additions ?: 0).toInt()
                val deletions = (stats.deletions ?: 0).toInt()
                val hunks =
                    listOf(
                        Hunk(
                            newStart = 1,
                            newLines = additions,
                            oldStart = 0,
                            oldLines = deletions,
                        )
                    )
                val action = f.id?.let { fileActionsById[it] }
                CommitFile(
                    file = mapper.toDto(f),
                    stats = mapper.toDto(stats),
                    action = action,
                    hunks = hunks,
                    commitId = id,
                )
            }

        return CommitFileConnection(
            count = pageResult.totalElements.toInt(),
            page = currentPage,
            perPage = pageSize,
            data = data
        )
    }

    /**
     * Resolves the modules field for a Commit in GraphQL.
     *
     * This method retrieves all modules associated with the given commit.
     * If the commit ID is null, an empty list is returned.
     *
     * @param commit The commit for which to retrieve modules
     * @return A list of modules associated with the commit, or an empty list if the commit ID is null
     */
    @SchemaMapping(typeName = "Commit", field = "modules")
    fun modules(commit: CommitDto): List<ModuleDto> {
        val id = commit.id ?: return emptyList()
        logger.info("Resolving modules for commit: $id")
        // Get all connections for this commit and extract the modules
        return commitService.findModulesByCommitId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the users field for a Commit in GraphQL.
     *
     * This method retrieves all users associated with the given commit.
     * If the commit ID is null, an empty list is returned.
     *
     * @param commit The commit for which to retrieve users
     * @return A list of users associated with the commit, or an empty list if the commit ID is null
     */
    @SchemaMapping(typeName = "Commit", field = "users")
    fun users(commit: CommitDto): List<UserDto> {
        val id = commit.id ?: return emptyList()
        logger.info("Resolving users for commit: $id")
        // Get all connections for this commit and extract the users
        return commitService.findUsersByCommitId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the issues field for a Commit in GraphQL.
     *
     * This method retrieves all issues associated with the given commit.
     * If the commit ID is null, an empty list is returned.
     *
     * @param commit The commit for which to retrieve issues
     * @return A list of issues associated with the commit, or an empty list if the commit ID is null
     */
    @SchemaMapping(typeName = "Commit", field = "issues")
    fun issues(commit: CommitDto): List<IssueDto> {
        val id = commit.id ?: return emptyList()
        logger.info("Resolving issues for commit: $id")
        // Get all connections for this commit and extract the issues
        return commitService.findIssuesByCommitId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the parents field for a Commit in GraphQL.
     *
     * This method retrieves all parent commits associated with the given commit and returns them as strings.
     * Each string contains the commit ID, SHA, and short SHA.
     * If the commit ID is null, an empty list is returned.
     *
     * @param commit The commit for which to retrieve parent commits
     * @return A list of strings representing parent commits, or an empty list if the commit ID is null
     */
    @SchemaMapping(typeName = "Commit", field = "parents")
    fun parents(commit: CommitDto): List<String> {
        val id = commit.id ?: return emptyList()
        logger.info("Resolving parent commits for commit: $id")
        // Get all parent commits for this commit and return their SHAs
        val parentCommits = commitService.findParentCommitsByChildCommitId(id)
        return parentCommits.map { it.sha }
    }

    /**
     * Resolves the children field for a Commit in GraphQL.
     *
     * This method retrieves all child commits associated with the given commit.
     * If the commit ID is null, an empty list is returned.
     *
     * @param commit The commit for which to retrieve child commits
     * @return A list of child commits associated with the commit, or an empty list if the commit ID is null
     */
    @SchemaMapping(typeName = "Commit", field = "children")
    fun children(commit: CommitDto): List<CommitDto> {
        val id = commit.id ?: return emptyList()
        logger.info("Resolving child commits for commit: $id")
        // Get all connections for this commit and extract the child commits
        return commitService.findChildCommitsByParentCommitId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the shortSha field for a Commit in GraphQL.
     *
     * This method returns a shortened version of the commit's SHA.
     * If the commit SHA is null, an empty string is returned.
     *
     * @param commit The commit for which to get the short SHA
     * @return A shortened version of the commit's SHA, or an empty string if the SHA is null
     */
    @SchemaMapping(typeName = "Commit", field = "shortSha")
    fun shortSha(commit: CommitDto): String {
        val sha = commit.sha ?: return ""
        logger.info("Resolving shortSha for commit: ${commit.id}")
        // Return the first 7 characters of the SHA, which is a common convention for short SHAs
        return sha.take(7)
    }

    /**
     * Resolves the messageHeader field for a Commit in GraphQL.
     *
     * This method returns the first line of the commit's message.
     * If the commit message is null, an empty string is returned.
     *
     * @param commit The commit for which to get the message header
     * @return The first line of the commit's message, or an empty string if the message is null
     */
    @SchemaMapping(typeName = "Commit", field = "messageHeader")
    fun messageHeader(commit: CommitDto): String {
        val message = commit.message ?: return ""
        logger.info("Resolving messageHeader for commit: ${commit.id}")
        // Return the first line of the message
        return message.split("\n").first()
    }

    /**
     * Resolves the date field for a Commit in GraphQL.
     * commit.commitDateTime => date
     */
    @SchemaMapping(typeName = "Commit", field = "date")
    fun date(commit: CommitDto): LocalDateTime? = commit.commitDateTime

    /**
     * Resolves the user field for a Commit in GraphQL.
     *
     * This method returns the first user associated with the commit.
     * If the commit ID is null or there are no users associated with the commit, null is returned.
     *
     * @param commit The commit for which to get the user
     * @return The first user associated with the commit, or null if there are no users
     */
    @SchemaMapping(typeName = "Commit", field = "user")
    fun user(commit: CommitDto): UserDto? {
        val id = commit.id ?: return null
        logger.info("Resolving user for commit: $id")
        val users = commitService.findUsersByCommitId(id)
        val selected = users.firstOrNull()
        return selected?.let { mapper.toDto(it) }
    }

    /**
     * Resolves the parentShas field for a Commit in GraphQL.
     *
     * This method returns an array of SHAs of the parent commits.
     * If the commit ID is null or there are no parent commits, an empty list is returned.
     *
     * @param commit The commit for which to get the parent SHAs
     * @return A list of SHAs of the parent commits, or an empty list if there are no parent commits
     */
    @SchemaMapping(typeName = "Commit", field = "parentShas")
    fun parentShas(commit: CommitDto): List<String> {
        val id = commit.id ?: return emptyList()
        logger.info("Resolving parentShas for commit: $id")
        // Get all parent commits for this commit and extract their SHAs
        val parentCommits = commitService.findParentCommitsByChildCommitId(id)
        return parentCommits.mapNotNull { it.sha }
    }

    /**
     * Resolves the parentsScalar field for a Commit in GraphQL.
     *
     * This method returns a string representation of the parent commits.
     * If the commit ID is null or there are no parent commits, an empty string is returned.
     * This field is provided as a scalar alternative to the parents field for clients
     * that don't want to provide a subselection.
     *
     * @param commit The commit for which to get the parent commits as a scalar
     * @return A string representation of the parent commits, or an empty string if there are no parent commits
     */
    @SchemaMapping(typeName = "Commit", field = "parentsScalar")
    fun parentsScalar(commit: CommitDto): String {
        val id = commit.id ?: return ""
        logger.info("Resolving parentsScalar for commit: $id")
        // Get all parent commits for this commit
        val parentCommits = commitService.findParentCommitsByChildCommitId(id)
        // Return a JSON-like string representation of the parent commits
        return parentCommits.joinToString(", ") {
            "{id: ${it.id ?: "null"}, sha: ${it.sha ?: "null"}, shortSha: ${it.sha?.take(7) ?: "null"}}"
        }
    }
}
