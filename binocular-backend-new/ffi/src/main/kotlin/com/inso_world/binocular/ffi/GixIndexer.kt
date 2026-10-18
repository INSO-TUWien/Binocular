package com.inso_world.binocular.ffi

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.index.GitIndexer
import com.inso_world.binocular.ffi.extensions.toDomain
import com.inso_world.binocular.ffi.pojos.toFfi
import com.inso_world.binocular.ffi.pojos.toModel
import com.inso_world.binocular.ffi.util.Utils
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.nio.file.Path

@Service
class GixIndexer : GitIndexer {
    @Autowired
    private lateinit var cfg: GixModuleConfig

    companion object Companion {
        private val logger by logger()
    }

    init {
        logger.info("Loading native library...")
        val rp = Utils.loadPlatformLibrary("gix_binocular")
        logger.debug("Loaded library: $rp")
        logger.info("Library loaded successfully.")
    }

    fun hello() {
        com.inso_world.binocular.ffi.internal
            .hello()
    }

    override fun findRepo(
        path: Path,
        project: Project,
    ): Repository {
        logger.trace("Searching repository... at '{}'", path)
        val repo =
            com.inso_world.binocular.ffi.internal
                .findRepo(path.toString().trim())
                .toModel(project.iid)
        return repo
    }

    override fun traverseBranch(
        repo: Repository,
        branchName: String,
    ): Pair<Branch, List<Commit>> {
        logger.trace("Traversing $branchName with skipMerges={}, useMailmap={}", cfg.vcs.skipMerges, cfg.vcs.useMailmap)
        val branchTraversalResult =
            com.inso_world.binocular.ffi.internal
                .traverseBranch(
                    repo.toFfi(),
                    branchName,
                    skipMerges = cfg.vcs.skipMerges,
                    useMailmap = cfg.vcs.useMailmap,
                )

        val commits: List<Commit> = branchTraversalResult.commits.toDomain(repo.iid)
        val headCommit = commits.associateBy { it.sha }.getValue(branchTraversalResult.branch.target)
        val branch: Branch =
            branchTraversalResult.branch.toDomain(
                repo.iid,
                headCommit,
            )

        return Pair(branch, commits)
    }

    override fun findAllBranches(repo: Repository): List<Branch> {
        val binocularRepo = repo.toFfi()
        return com.inso_world.binocular.ffi.internal
            .findAllBranches(binocularRepo)
            .map {
                val head =
                    com.inso_world.binocular.ffi.internal
                        .findCommit(
                            binocularRepo,
                            it.target,
                            useMailmap = cfg.vcs.useMailmap,
                        ).toDomain(repo.iid)
                val branch = it.toDomain(repo.iid, head)
                branch
            }
    }

    override fun findCommit(
        repo: Repository,
        hash: String,
    ): Commit =
        com.inso_world.binocular.ffi.internal
            .findCommit(
                repo.toFfi(),
                hash,
                useMailmap = cfg.vcs.useMailmap,
            ).toDomain(repo.iid)

    override fun traverse(
        repo: Repository,
        source: Commit,
        target: Commit?,
    ): List<Commit> =
        com.inso_world.binocular.ffi.internal
            .traverseHistory(
                repo.toFfi(),
                source.sha,
                target?.sha,
                useMailmap = cfg.vcs.useMailmap,
            ).toDomain(repo.iid)
}
