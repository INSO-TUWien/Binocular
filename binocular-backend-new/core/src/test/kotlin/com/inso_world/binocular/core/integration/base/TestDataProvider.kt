package com.inso_world.binocular.core.integration.base

import com.inso_world.binocular.domain.data.MockTestDataProvider
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Build
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Job
import com.inso_world.binocular.model.Mention
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Module
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.Platform
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import com.inso_world.binocular.model.Stats
import com.inso_world.binocular.model.User
import com.inso_world.binocular.model.vcs.ReferenceCategory
import java.time.LocalDateTime

/**
 * Provides test data for web module tests.
 * This class contains all the test entities and their relationships,
 * making the web module tests independent of infrastructure-specific test data.
 */
@Deprecated(
    "Objects are singletons, every change is propagated over tests. Instead, use the MockTestDataProvider class and create a new object before each test rung to have a clean state",
    replaceWith = ReplaceWith("com.inso_world.binocular.core.data.MockTestDataProvider"),
)
object TestDataProvider {
    val project = Project(name = "proj-pg-0")
    val repository = Repository(localPath = "repo-pg-0", projectId = project.iid).apply { this.project = project }

    val developer1 = Developer(name = "Dev One", email = "dev1@test.com", repositoryId = repository.iid).apply {
        this.id = "1"
    }
    val developer2 = Developer(name = "Dev Two", email = "dev2@test.com", repositoryId = repository.iid).apply {
        this.id = "2"
    }
    val testDevelopers = listOf(developer1, developer2)

    val mainBranch = Branch(
        name = "main",
        fullName = "refs/heads/main",
        headSha = "abc1230000000000000000000000000000000000",
        repositoryId = repository.iid,
        category = com.inso_world.binocular.model.vcs.ReferenceCategory.LOCAL_BRANCH
    ).apply {
        active = true
        tracksFileRenames = true
        this.id = "1"
    }
    val newFeatureBranch = Branch(
        name = "feature/new-feature",
        fullName = "refs/heads/feature/new-feature",
        headSha = "def4560000000000000000000000000000000000",
        repositoryId = repository.iid,
        category = com.inso_world.binocular.model.vcs.ReferenceCategory.LOCAL_BRANCH
    ).apply {
        active = true
        tracksFileRenames = false
        this.id = "2"
    }
    val testBranches = listOf(mainBranch, newFeatureBranch)

    val commit1 = Commit(
        sha = "abc1230000000000000000000000000000000000",
        authorSignature = com.inso_world.binocular.model.Signature(developerId = developer1.iid, timestamp = LocalDateTime.now()),
        committerSignature = com.inso_world.binocular.model.Signature(developerId = developer1.iid, timestamp = LocalDateTime.now()),
        message = "First commit",
        repositoryId = repository.iid
    ).apply {
        this.id = "1"
        this.webUrl = "https://example.com/commit/abc1230000000000000000000000000000000000"
        this.branch = "main"
        this.stats = com.inso_world.binocular.model.Stats(10, 5)
    }
    val commit2 = Commit(
        sha = "def4560000000000000000000000000000000000",
        authorSignature = com.inso_world.binocular.model.Signature(developerId = developer2.iid, timestamp = LocalDateTime.now()),
        committerSignature = com.inso_world.binocular.model.Signature(developerId = developer2.iid, timestamp = LocalDateTime.now()),
        message = "Second commit",
        repositoryId = repository.iid
    ).apply {
        this.id = "2"
        this.webUrl = "https://example.com/commit/def4560000000000000000000000000000000000"
        this.branch = "main"
        this.stats = com.inso_world.binocular.model.Stats(7, 3)
    }
    val testCommits = listOf(commit1, commit2)

    val testAccounts =
        listOf(
            Account(
                "MDQ9JXMlcjY5MoB7Nah4",
                Platform.GitHub,
                "user1",
                projectIds = mutableSetOf(project.iid)
            ).apply {
                this.id = "1"
                this.name = "User One"
                this.avatarUrl = "https://example.com/avatars/user1.png"
                this.url = "https://github.com/user1"
            },
            Account(
                "MDQ9JXjIMjY5MoB7Nah4",
                Platform.GitLab,
                "user2",
                projectIds = mutableSetOf(project.iid)
            ).apply {
                this.id = "2"
                this.name = "User Two"
                this.avatarUrl = "https://example.com/avatars/user2.png"
                this.url = "https://github.com/user2"
            },
        )

    val testBuilds =
        listOf(
            Build(
                "1",
                "abc1230000000000000000000000000000000000",
                "main",
                "success",
                "v0.0.1-rc",
                "user1",
                "User One",
                LocalDateTime.now(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                120,
                listOf(
                    Job(
                        "job1",
                        "test",
                        "success",
                        "test",
                        LocalDateTime.now(),
                        LocalDateTime.now(),
                        "https://example.com/jobs/job1",
                    ),
                ),
                "https://example.com/builds/1",
            ),
            Build(
                "2",
                "def4560000000000000000000000000000000000",
                "feature/new-feature",
                "failed",
                "v1.0.0",
                "user2",
                "User Two",
                LocalDateTime.now(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                180,
                listOf(
                    Job(
                        "job2",
                        "build",
                        "failed",
                        "build",
                        LocalDateTime.now(),
                        LocalDateTime.now(),
                        "https://example.com/jobs/job2",
                    ),
                ),
                "https://example.com/builds/2",
            ),
        )

    val testFiles =
        listOf(
            run {
                val file =
                    File(
                        "src/main/kotlin/com/example/Main.kt",
                    ).apply {
                        this.id = "1"
                        this.webUrl = "https://example.com/files/Main.kt"
                    }
                return@run file
            },
            run {
                val file =
                    File(
                        "src/main/kotlin/com/example/Utils.kt",
                    ).apply {
                        this.id = "2"
                        this.webUrl = "https://example.com/files/Utils.kt"
                    }
                return@run file
            },
        )

    val testIssues =
        listOf(
            Issue(
                "1",
                101,
                "asdfasdf293487",
                "Fix bug in login flow",
                "Users are unable to log in...",
                LocalDateTime.now(),
                LocalDateTime.now(),
                null,
                listOf("bug", "high-priority"),
                "open",
                "https://example.com/issues/101",
                listOf(
                    Mention(
                        "abc123",
                        LocalDateTime.now(),
                        false,
                    ),
                ),
                project = project.iid
            ),
            Issue(
                "2",
                102,
                "ölkjo342",
                "Add new feature",
                "Implement profile customization",
                LocalDateTime.now(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                listOf("enhancement", "feature"),
                "closed",
                "https://example.com/issues/102",
                listOf(
                    Mention(
                        "def456",
                        LocalDateTime.now(),
                        true,
                    ),
                ),
                project = project.iid
            ),
        )

    val testMergeRequests =
        listOf(
            MergeRequest(
                project = project.iid,
                id = "1",
                platformIid = 201,
                title = "Implement user authentication",
                description = "Add JWT auth",
                createdAt = LocalDateTime.now().toString(),
                closedAt = LocalDateTime.now().toString(),
                updatedAt = null,
                labels = listOf("feature", "security"),
                state = "open",
                webUrl = "https://example.com/merge_requests/201",
                mentions = listOf(
                    Mention(
                        "abc123",
                        LocalDateTime.now(),
                        false,
                    ),
                ),
            ),
            MergeRequest(
                project = project.iid,
                id = "2",
                platformIid = 202,
                title = "Fix CSS",
                description = "Fix responsive design",
                createdAt = LocalDateTime.now().toString(),
                closedAt = LocalDateTime.now().toString(),
                updatedAt = LocalDateTime.now().toString(),
                labels = listOf("bug", "ui"),
                state = "merged",
                webUrl = "https://example.com/merge_requests/202",
                mentions = listOf(
                    Mention(
                        "def456",
                        LocalDateTime.now(),
                        true,
                    ),
                ),
            ),
        )

    val testModules =
        listOf(
            Module("1", "src/main/kotlin/com/example/core"),
            Module("2", "src/main/kotlin/com/example/api"),
        )

    val testProjects =
        listOf(
            Project(name = "proj-pg-0").apply { this.id = "1" },
            Project(name = "proj-pg-1").apply { this.id = "2" },
            Project(name = "proj-pg-2").apply { this.id = "3" },
            Project(name = "proj-pg-3").apply { this.id = "4" },
            Project(name = "proj-pg-4").apply { this.id = "5" },
            Project(name = "proj-pg-7").apply { this.id = "7" },
            Project(name = "proj-for-repos").apply { this.id = "6" },
        )
    private val testProjectsByName = testProjects.associateBy { it.name }

    val testRepositories =
        listOf(
            Repository(localPath = "repo-pg-0", projectId = testProjectsByName.getValue("proj-for-repos").iid).apply {
                this.project = testProjectsByName.getValue("proj-for-repos")
                this.id = "r1"
            },
            Repository(localPath = "repo-pg-1", projectId = testProjectsByName.getValue("proj-pg-4").iid).apply {
                this.project = testProjectsByName.getValue("proj-pg-4")
                this.id = "r2"
            },
            Repository(localPath = "repo-pg-2", projectId = testProjectsByName.getValue("proj-pg-3").iid).apply {
                this.project = testProjectsByName.getValue("proj-pg-3")
                this.id = "r3"
            },
            Repository(localPath = "repo-pg-3", projectId = testProjectsByName.getValue("proj-pg-2").iid).apply {
                this.project = testProjectsByName.getValue("proj-pg-2")
                this.id = "r4"
            },
            Repository(localPath = "repo-pg-4", projectId = testProjectsByName.getValue("proj-pg-1").iid).apply {
                this.project = testProjectsByName.getValue("proj-pg-1")
                this.id = "r5"
            },
            Repository(localPath = "repo-pg-5", projectId = testProjectsByName.getValue("proj-pg-0").iid).apply {
                this.project = testProjectsByName.getValue("proj-pg-0")
                this.id = "r6"
            },
            Repository(localPath = "repo-pg-6", projectId = testProjectsByName.getValue("proj-pg-7").iid).apply {
                this.project = testProjectsByName.getValue("proj-pg-7")
                this.id = "r7"
            },
        )

    val testNotes =
        listOf(
            Note(
                "1",
                "This is a comment",
                "2023-01-01T10:00:00Z",
                "2023-01-01T10:00:00Z",
                false,
                true,
                false,
                false,
                false,
                "gitlab",
            ),
            Note(
                "2",
                "This is a system note",
                "2023-01-02T11:00:00Z",
                "2023-01-02T11:00:00Z",
                true,
                false,
                false,
                true,
                false,
                "github",
            ),
        )

    val testUsers =
        listOf(
            User("John Doe", repositoryId = repository.iid).apply {
                this.repository = repository
                this.id = "1"
                this.email = "john.doe@example.com"
            },
            User("Jane Smith", repositoryId = repository.iid).apply {
                this.repository = repository
                this.id = "2"
                this.email = "jane.smith@example.com"
            },
        )

    val testMilestones =
        listOf(
            Milestone(
                project = project.iid,
                id = "1",
                platformIid = 201,
                title = "Release 1.0",
                description = "First stable release",
                createdAt = "2023-01-01T10:00:00Z",
                updatedAt = "2023-01-10T15:30:00Z",
                startDate = "2023-01-15T00:00:00Z",
                dueDate = "2023-02-15T00:00:00Z",
                state = "active",
                expired = false,
                webUrl = "https://example.com/milestones/1",
            ),
            Milestone(
                project = project.iid,
                id = "2",
                platformIid = 202,
                title = "Release 2.0",
                description = "Second major release",
                createdAt = "2023-02-01T10:00:00Z",
                updatedAt = "2023-02-10T15:30:00Z",
                startDate = "2023-02-15T00:00:00Z",
                dueDate = "2023-03-15T00:00:00Z",
                state = "active",
                expired = false,
                webUrl = "https://example.com/milestones/2",
            ),
        )
}
