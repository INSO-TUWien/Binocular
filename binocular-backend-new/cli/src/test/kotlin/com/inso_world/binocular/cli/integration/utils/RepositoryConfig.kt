package com.inso_world.binocular.cli.integration.utils

import com.inso_world.binocular.core.index.GitIndexer
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import kotlin.io.path.Path

internal data class RepositoryConfig(
    val repo: Repository,
    val startCommit: Commit,
    val hashes: List<Commit>,
    val project: Project,
)

internal fun setupRepoConfig(
    indexer: GitIndexer,
    path: String,
    startSha: String? = "HEAD",
    branchName: String,
    projectName: String,
): RepositoryConfig {
    val project =
        Project(
            name = projectName,
        )
    val repo =
        run {
            val p = Path(path)
            return@run indexer.findRepo(p, project)
        }
    val (branch, commits) = indexer.traverseBranch(repo, branchName)
    val cmt = indexer.findCommit(repo, startSha ?: "HEAD")
    return RepositoryConfig(
        repo = repo,
        startCommit = cmt,
        hashes = commits,
        project = project,
    )
}
