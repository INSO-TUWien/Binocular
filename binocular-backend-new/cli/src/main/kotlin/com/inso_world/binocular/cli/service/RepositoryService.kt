package com.inso_world.binocular.cli.service

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.service.RepositoryInfrastructurePort
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.nio.file.Paths

/**
 * Service for managing repository operations including commit canonicalization and persistence.
 *
 * This service handles the coordination between the Git indexer output (commits with their
 * signatures and developers already set) and the persistence layer. With the new domain model
 * using [Developer] and [com.inso_world.binocular.model.Signature], commits come pre-built
 * with immutable author/committer information.
 *
 * ## Key Responsibilities
 * - Canonicalize commits against existing repository state
 * - Wire parent-child relationships
 * - Deduplicate developers by git signature
 * - Persist repository changes
 *
 * ## Domain Model Integration
 * The new domain model auto-registers entities:
 * - [Commit] → [Repository.commits] and developer's authored/committed collections
 * - [Developer] → [Repository.developers]
 * - [Branch] → [Repository.branches]
 *
 * This means transformCommits focuses on deduplication and parent wiring rather than
 * establishing back-links.
 */
@Service
class RepositoryService {
    companion object {
        private val logger by logger()
    }

    @Autowired
    private lateinit var repositoryPort: RepositoryInfrastructurePort

    @Autowired
    private lateinit var commitService: CommitService

    fun findBranch(
        repo: Repository,
        name: String
    ): Branch? = this.repositoryPort.findBranch(repo, name)

    @Transactional
    fun save(repository: Repository): Repository = this.repositoryPort.create(repository)

    /**
     * Canonicalizes incoming commits against the repository's existing state.
     *
     * With the new domain model where [Commit]s use immutable [com.inso_world.binocular.model.Signature]s,
     * this method focuses on:
     * 1. Deduplicating commits by SHA (uniqueKey)
     * 2. Deduplicating developers by git signature
     * 3. Wiring parent-child relationships between commits
     *
     * Note: Since commits are created with their signatures already set, we cannot
     * "rewrite" author/committer. Instead, we ensure consistency by using canonical
     * developer instances from the repository.
     *
     * @param repo The repository to canonicalize commits into
     * @param commits The incoming commits (already with signatures set)
     * @return The canonicalized commits corresponding to input order
     */
    internal fun transformCommits(
        repo: Repository,
        commits: Iterable<Commit>,
    ): Collection<Commit> {
        // Build index of canonical commits from repository
        val commitsByKey = repo.commits.associateByTo(mutableMapOf()) { it.uniqueKey }

        // Build index of canonical developers by git signature
        val developersBySignature = repo.developers.associateByTo(mutableMapOf()) { it.gitSignature }

        // Also index by email for coalescing (case-insensitive)
        val developersByEmail =
            repo.developers
                .mapNotNull { dev -> normalizeEmail(dev.email)?.let { it to dev } }
                .toMap(mutableMapOf())

        // Build index of canonical branches
        val branchesByKey = repo.branches.associateByTo(mutableMapOf()) { it.uniqueKey }

        /**
         * Get or register the canonical commit for a given incoming commit.
         * If the commit already exists in the repo, returns the existing one.
         * Otherwise, registers the new commit.
         */
        fun canonicalizeCommit(incoming: Commit): Commit {
            val key = incoming.uniqueKey
            val existing = commitsByKey[key]
            if (existing != null) return existing

            // Commit is new - it should already be registered via its init block
            // when created by GitIndexer, but let's ensure it's in our index
            commitsByKey[key] = incoming
            return incoming
        }

        /**
         * Get or register the canonical developer for a given developer.
         * Uses git signature as primary key, with email as fallback for coalescing.
         */
        fun canonicalizeDeveloper(dev: Developer): Developer {
            // First check by git signature
            developersBySignature[dev.gitSignature]?.let { return it }

            // Then check by email (case-insensitive)
            normalizeEmail(dev.email)?.let { email ->
                developersByEmail[email]?.let { return it }
            }

            // New developer - register in indices
            developersBySignature[dev.gitSignature] = dev
            normalizeEmail(dev.email)?.let { developersByEmail[it] = dev }
            return dev
        }

        /**
         * Get or register the canonical branch.
         */
        fun canonicalizeBranch(branch: Branch?): Branch? {
            if (branch == null) return null
            return branchesByKey.getOrPut(branch.uniqueKey) { branch }
        }

        // --- Pass 1: Ensure every incoming commit has a canonical instance ---
        // We recreate commits if they use non-canonical developers to ensure deduplication.
        val canonicalInOrder =
            commits.map { incoming ->
                val key = incoming.uniqueKey
                val existing = commitsByKey[key]
                if (existing != null) return@map existing

                val authorDev = incoming.authorSignature.developer
                val committerDev = incoming.committerSignature.developer

                val canonicalAuthor = authorDev?.let { canonicalizeDeveloper(it) }
                val canonicalCommitter = committerDev?.let { canonicalizeDeveloper(it) }

                val finalCommit =
                    if (canonicalAuthor != authorDev || canonicalCommitter != committerDev) {
                        // Recreate commit with canonical developers because Signature is immutable
                        Commit(
                            sha = incoming.sha,
                            authorSignature =
                                incoming.authorSignature.copy(
                                    developer = canonicalAuthor,
                                    developerId = canonicalAuthor?.iid ?: incoming.authorSignature.developerId,
                                ),
                            committerSignature =
                                incoming.committerSignature.copy(
                                    developer = canonicalCommitter,
                                    developerId = canonicalCommitter?.iid ?: incoming.committerSignature.developerId,
                                ),
                            message = incoming.message,
                            repositoryId = incoming.repositoryId,
                            repository = repo,
                        ).apply {
                            this.id = incoming.id
                            this.webUrl = incoming.webUrl
                            this.parentShas.addAll(incoming.parentShas)
                            this.childShas.addAll(incoming.childShas)
                        }
                    } else {
                        incoming
                    }

                commitsByKey[key] = finalCommit
                finalCommit
            }

        // --- Pass 2: Canonicalize developers ---
        // (Handled in Pass 1 for new commits)
        commits.forEach { incoming ->
            incoming.authorSignature.developer?.let { canonicalizeDeveloper(it) }
            incoming.committerSignature.developer?.let { canonicalizeDeveloper(it) }
        }

        // --- Pass 3: Wire parent-child relationships ---
        commits.forEach { incoming ->
            val canonicalCommit = canonicalizeCommit(incoming)
            canonicalCommit.parentShas.addAll(incoming.parentShas)
            canonicalCommit.childShas.addAll(incoming.childShas)
        }

        return canonicalInOrder
    }

    // ---------- Utilities ----------

    private fun normalizeEmail(email: String?): String? = email?.trim()?.lowercase()

    private fun sameEmail(
        a: Developer,
        b: Developer
    ): Boolean =
        normalizeEmail(a.email) != null &&
            normalizeEmail(a.email) == normalizeEmail(b.email)

    private fun normalizePath(path: String): String =
        (if (path.endsWith(".git")) path else "$path/.git").let {
            Paths.get(it).toRealPath().toString()
        }

    /**
     * Find a repository by its normalized git directory path.
     */
    fun findRepo(gitDir: String): Repository? = this.repositoryPort.findByName(normalizePath(gitDir))

    /**
     * Create a new repository in the persistence layer.
     *
     * @throws IllegalArgumentException if repository.id is not null (already persisted)
     * @throws IllegalArgumentException if repository.project is null
     * @throws IllegalArgumentException if project.repo doesn't match the repository
     */
    fun create(repository: Repository): Repository {
        require(repository.id == null) { "Repository.id must be null to create repository" }

        return this.repositoryPort.create(repository)
    }

    // this is a leftover from older version, unsure if needed and correct
    @Deprecated("Use create fun instead.")
    fun getOrCreate(
        gitDir: String,
        p: Project,
    ): Repository {
        val find = this.findRepo(gitDir)
        if (find == null) {
            logger.info("Repository does not exist, creating new repository")
            return this.repositoryPort.create(
                Repository(
                    localPath = normalizePath(gitDir),
                    projectId = p.iid,
                    project = p,
                ),
            )
        } else {
            logger.debug("Repository already exists, returning existing repository")
            return find
        }
    }

    /**
     * Get the HEAD commit for a specific branch.
     */
    fun getHeadCommits(
        repo: Repository,
        branch: String,
    ): Commit? = this.commitService.findHeadForBranch(repo, branch)

    /**
     * Add commits to a repository, checking for existing commits first.
     *
     * This method:
     * 1. Checks which commits already exist in the repository
     * 2. Canonicalizes new commits (wires relationships)
     * 3. Persists the updated repository
     *
     * @param repo The repository to add commits to
     * @param commits The commits to add
     * @return The updated repository
     */
    fun addCommits(
        repo: Repository,
        commits: Collection<Commit>,
    ): Repository {
        val existingCommitEntities = this.commitService.checkExisting(repo, commits)

        logger.debug("Existing commits: ${existingCommitEntities.first.count()}")
        logger.trace("New commits to add: ${existingCommitEntities.second.count()}")

//        if (existingCommitEntities.second.isNotEmpty()) {
        // Canonicalize new commits and wire relationships
        this.transformCommits(repo, existingCommitEntities.second)

        logger.debug("Commit transformation finished")
        logger.debug("${repo.commits.count { it.message?.isEmpty() == true }} Commits have empty messages")
        logger.trace(
            "Empty message commits: {}",
            repo.commits.filter { it.message?.isEmpty() == true }.map { it.sha },
        )

        val newRepo = this.repositoryPort.update(repo)

        logger.debug("Commits successfully added. New Commit count is ${repo.commits.count()} for project ${repo.projectId}")
        return newRepo
//        } else {
//            logger.info("No new commits were found, skipping update")
//            return repo
//        }
    }
}
