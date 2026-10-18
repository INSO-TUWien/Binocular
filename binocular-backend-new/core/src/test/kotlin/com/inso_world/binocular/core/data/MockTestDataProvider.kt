package com.inso_world.binocular.core.data

import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import com.inso_world.binocular.model.User
import com.inso_world.binocular.model.vcs.ReferenceCategory
import java.time.LocalDateTime

@Deprecated(message = "", replaceWith = ReplaceWith("com.inso_world.binocular.domain.data.MockTestDataProvider"))
class MockTestDataProvider {
    val testProjects =
        listOf(
            Project(name = "proj-pg-0"),
            Project(name = "proj-pg-1"),
            Project(name = "proj-pg-2"),
            Project(name = "proj-pg-3"),
            Project(name = "proj-pg-4"),
            Project(name = "proj-pg-5"),
            Project(name = "proj-for-repos"),
        )
    val projectsByName = testProjects.associateBy { requireNotNull(it.name) }

    val testRepositories: List<Repository> =
        listOf(
            run {
                val project = projectsByName.getValue("proj-pg-0")
                val repo = Repository(localPath = "repo-pg-0", projectId = project.iid).apply { this.project = project }
                repo
            },
            run {
                val project = projectsByName.getValue("proj-pg-1")
                val repo = Repository(localPath = "repo-pg-1", projectId = project.iid).apply { this.project = project }
                repo
            },
            run {
                val project = projectsByName.getValue("proj-pg-2")
                val repo = Repository(localPath = "repo-pg-2", projectId = project.iid).apply { this.project = project }
                repo
            },
            run {
                val project = projectsByName.getValue("proj-pg-3")
                val repo = Repository(localPath = "repo-pg-3", projectId = project.iid).apply { this.project = project }
                repo
            },
            run {
                val project = projectsByName.getValue("proj-pg-4")
                val repo = Repository(localPath = "repo-pg-4", projectId = project.iid).apply { this.project = project }
                repo
            },
            run {
                val project = projectsByName.getValue("proj-for-repos")
                val repo = Repository(localPath = "repo-pg-5", projectId = project.iid).apply { this.project = project }
                repo
            },
            run {
                val project = projectsByName.getValue("proj-pg-5")
                val repo = Repository(localPath = "repo-empty", projectId = project.iid).apply { this.project = project }
                repo
            },
        )
    val repositoriesByPath = testRepositories.associateBy { requireNotNull(it.localPath) }
    private val repository: Repository = repositoriesByPath.getValue("repo-pg-0")

    @Deprecated("Use developers instead")
    val users: List<User> =
        listOf(
            User(name = "User A", repositoryId = repository.iid).apply {
                this.repository = repository
                this.email = "a@test.com"
            },
            User(name = "User B", repositoryId = repository.iid).apply {
                this.repository = repository
                this.email = "b@test.com"
            },
            User(name = "Author Only", repositoryId = repository.iid).apply {
                this.repository = repository
                this.email = "author@test.com"
            },
        )

    @Deprecated("Use developerByEmail instead")
    val userByEmail = users.associateBy { requireNotNull(it.email) }

    val developers: List<Developer> =
        listOf(
            Developer(name = "User A", email = "a@test.com", repositoryId = repository.iid).apply { this.repository = repository },
            Developer(name = "User B", email = "b@test.com", repositoryId = repository.iid).apply { this.repository = repository },
            Developer(
                name = "Author Only",
                email = "author@test.com",
                repositoryId = repository.iid
            ).apply { this.repository = repository },
        )
    val developerByEmail = developers.associateBy { it.email }

    val commits: List<Commit> =
        listOf(
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature =
                    Signature(
                        developerId = developerByEmail.getValue("a@test.com").iid,
                        developer = developerByEmail.getValue("a@test.com"),
                        timestamp = LocalDateTime.now().minusSeconds(1),
                    ),
                repositoryId = repository.iid,
                repository = repository,
            ),
            Commit(
                sha = "b".repeat(40),
                message = "msg2",
                authorSignature =
                    Signature(
                        developerId = developerByEmail.getValue("b@test.com").iid,
                        developer = developerByEmail.getValue("b@test.com"),
                        timestamp = LocalDateTime.now().minusSeconds(1),
                    ),
                repositoryId = repository.iid,
                repository = repository,
            ),
            Commit(
                sha = "c".repeat(40),
                message = "msg1",
                authorSignature =
                    Signature(
                        developerId = developerByEmail.getValue("a@test.com").iid,
                        developer = developerByEmail.getValue("a@test.com"),
                        timestamp = LocalDateTime.now().minusSeconds(1),
                    ),
                repositoryId = repository.iid,
                repository = repository,
            ),
            Commit(
                sha = "d".repeat(40),
                message = "msg-d",
                authorSignature =
                    Signature(
                        developerId = developerByEmail.getValue("b@test.com").iid,
                        developer = developerByEmail.getValue("b@test.com"),
                        timestamp = LocalDateTime.now().minusSeconds(1),
                    ),
                repositoryId = repository.iid,
                repository = repository,
            ),
        )
    val commitBySha = commits.associateBy(Commit::sha)

    val branches =
        listOf(
            run {
                val branch =
                    Branch(
                        fullName = "refs/remotes/origin/feature/test",
                        name = "origin/feature/test",
                        repositoryId = repository.iid,
                        repository = repository,
                        headSha = commitBySha.getValue("a".repeat(40)).sha,
                        head = commitBySha.getValue("a".repeat(40)),
                        category = ReferenceCategory.REMOTE_BRANCH,
                    )
                return@run branch
            },
        )

    val branchByName = branches.associateBy(Branch::name)
}
