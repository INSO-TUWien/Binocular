package com.inso_world.binocular.cli.service

import com.inso_world.binocular.cli.exception.CliException
import com.inso_world.binocular.cli.exception.ServiceException
import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.index.GitIndexer
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import kotlin.io.path.Path

/**
 * Service for indexing VCS (Version Control System) data from Git repositories.
 *
 * This service coordinates between the Git indexer (FFI layer) and the repository
 * service (persistence layer) to efficiently index commits, diffs, and blame data.
 *
 * ## Incremental Re-indexing
 *
 * The service implements incremental re-indexing to avoid duplicate work:
 * 1. For existing branches, it detects the last indexed HEAD commit
 * 2. Traverses only from the current branch HEAD to the known HEAD
 * 3. Skips processing entirely if no new commits exist
 *
 * This optimization is critical for large repositories where full traversal
 * would be prohibitively expensive.
 *
 * ## Example Usage
 * ```kotlin
 * vcsService.indexRepository("/path/to/repo", "main", project)
 * // On re-index, only new commits since last index are processed
 * ```
 */
@Service
class VcsService(
    @Autowired private val repoService: RepositoryService,
    @Autowired private val lizardService: LizardService,
) {
    companion object {
        private val logger by logger()
    }

    @Autowired
    private lateinit var gitIndexer: GitIndexer

    @Autowired
    private lateinit var commitService: CommitService

    /**
     * Indexes a Git repository, fetching commits for the specified branch.
     *
     * This method implements incremental indexing:
     * - If the repository/branch was previously indexed, only new commits are fetched
     * - If this is a fresh index, all commits on the branch are fetched
     *
     * @param repoPath Path to the Git repository (can be worktree or .git directory)
     * @param branch Name of the branch to index
     * @param project The project this repository belongs to
     * @param lizardActive Boolean if lizard should be used or not
     * @param lizardInclude A string that contains which folders are checked by lizard
     * @param lizardThreads The number of threads used for lizard
     * @throws CliException if repository operations fail
     * @throws IllegalArgumentException if repoPath is null or branch doesn't exist
     */
    fun indexRepository(
        repoPath: String?,
        branch: String,
        project: Project,
        lizardActive: Boolean,
        lizardInclude: String?,
        lizardThreads: Int,
    ) {
        logger.trace(">>> indexRepository({}, {}, {})", repoPath, branch, project)

        val vcsRepo = findOrCreateRepository(repoPath, project)
        logger.info("Found repository: ${vcsRepo.localPath}")

        val gitBranch = repoService.findBranch(vcsRepo, branch)

        // Check for incremental indexing opportunity
        val existingHead = findExistingBranchHead(vcsRepo, branch)

        val (branchResult, commits) = if (existingHead != null && gitBranch != null) {
            // Incremental: traverse from current HEAD to existing HEAD
            performIncrementalTraversal(vcsRepo, gitBranch, existingHead)
        } else {
            // Full traversal: no existing commits for this branch
            performFullTraversal(vcsRepo, branch)
        }

        if (commits.isEmpty()) {
            logger.info("No new commits found for branch '$branch' - repository is up to date")
            return
        }

        logCommitStatistics(commits, branch)
        repoService.addCommits(vcsRepo, commits)

        if(lizardActive) {
            runLizardWithSettings(repoPath, lizardInclude, lizardThreads)
        }

        logger.trace("<<< indexRepository({}, {}, {})", repoPath, branch, project)
    }

    /**
     * First removes the paths that do not exist in the folder from the list for lizard
     * Afterwards runs lizard on the given paths that do exist in the project. Creates
     * CSV files, which after reading their information and storing it in a list are deleted.
     * A single list is returned containing all information regarding Lizard output. Which is processed
     * afterwards and then the information is stored in the database.
     *
     * @param repoPath The path of which is the root for the lizard pathing
     * @param lizardInclude The actual path for individual folders relative to the root path
     * @param lizardThreads the amount of threads used to run lizard
     */
    private fun runLizardWithSettings(repoPath: String?, lizardInclude: String?, lizardThreads: Int) {

        val lizardIncludeCleaned = lizardService.removeNonexistendPaths(repoPath,lizardInclude)

        if (lizardIncludeCleaned.isEmpty()) {
            logger.debug("No valid path for lizard was given. No given path exists. Return to main function.")
            return
        }

        lizardService.runLizard(repoPath,lizardIncludeCleaned,lizardThreads)

        val lizardFileData = lizardService.readLizardFiles(repoPath,lizardIncludeCleaned)

    }

    /**
     * Finds an existing repository or creates a new one.
     */
    private fun findOrCreateRepository(repoPath: String?, project: Project): Repository {
        return try {
            repoService.findRepo(
                requireNotNull(repoPath) { "Repository path is empty/null" },
            ) ?: run {
                logger.trace("Repository $repoPath not indexed, looking for .git path")
                val repo = gitIndexer.findRepo(Path(repoPath), project)
                repoService.create(repo)
            }
        } catch (e: ServiceException) {
            throw CliException(e)
        }
    }

    /**
     * Finds a branch by name in the repository.
     *
     * @throws IllegalArgumentException if branch doesn't exist
     */
    private fun findBranch(repo: Repository, branchName: String): Branch {
        return requireNotNull(
            gitIndexer.findAllBranches(repo).find { it.name == branchName },
        ) { "Branch not found: $branchName" }
    }

    /**
     * Finds the existing HEAD commit for a branch if it was previously indexed.
     *
     * @return The existing HEAD commit SHA, or null if branch was never indexed
     */
    private fun findExistingBranchHead(repo: Repository, branchName: String): Commit? {
        // Check if we have any commits for this branch
        val existingHead = repoService.getHeadCommits(repo, branchName)

        if (existingHead != null) {
            logger.debug("Found existing HEAD for branch '$branchName': ${existingHead.sha.take(8)}")
        } else {
            logger.debug("No existing commits found for branch '$branchName' - performing full traversal")
        }

        return existingHead
    }

    /**
     * Performs incremental traversal from current branch HEAD to the existing indexed HEAD.
     *
     * This optimization avoids re-traversing commits that are already indexed.
     * Only commits between the current HEAD and the last known HEAD are returned.
     *
     * @param repo The repository to traverse
     * @param branch The branch being indexed
     * @param existingHead The previously indexed HEAD commit
     * @return Pair of the branch and new commits (empty if no new commits)
     */
    private fun performIncrementalTraversal(
        repo: Repository,
        branch: Branch,
        existingHead: Commit,
    ): Pair<Branch, List<Commit>> {
        // Resolve current HEAD commit via CommitService
        val currentHead = commitService.findById(branch.headCommitId)
            ?: return Pair(branch, emptyList())

        // Quick check: if HEAD hasn't changed, no new commits
        if (currentHead.sha == existingHead.sha) {
            logger.debug("Branch HEAD unchanged (${currentHead.sha.take(8)}) - no new commits")
            return Pair(branch, emptyList())
        }

        logger.info("Incremental indexing: ${currentHead.sha.take(8)} → ${existingHead.sha.take(8)}")

        // Use traverse with stop point to get only new commits
        val newCommits = gitIndexer.traverse(repo, currentHead, existingHead)

        // Filter out the stop commit if it was included
        val filteredCommits = newCommits.filter { it.sha != existingHead.sha }

        logger.info("Found ${filteredCommits.size} new commit(s) on branch '${branch.name}'")

        return Pair(branch, filteredCommits)
    }

    /**
     * Performs full branch traversal when no existing commits are found.
     */
    private fun performFullTraversal(
        repo: Repository,
        branch: String,
    ): Pair<Branch, List<Commit>> {
        logger.info("Full traversal for branch '${branch}'")
        return gitIndexer.traverseBranch(repo, branch)
    }

    /**
     * Logs commit statistics for debugging and monitoring.
     */
    @OptIn(kotlin.uuid.ExperimentalUuidApi::class)
    private fun logCommitStatistics(commits: List<Commit>, branchName: String) {
        val shas = commits.map { it.sha }
        val parentShas = commits.flatMap { it.parentIds.map { p -> p.value.toString() } }

        logger.debug(
            "Commits to process: ${shas.count()}+${parentShas.count()}=${
                (shas + parentShas).distinct().count()
            } commit(s) found on branch $branchName",
        )
    }
}
