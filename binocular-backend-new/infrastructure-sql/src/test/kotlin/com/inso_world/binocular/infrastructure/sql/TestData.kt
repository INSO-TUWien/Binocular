package com.inso_world.binocular.infrastructure.sql

import com.inso_world.binocular.infrastructure.sql.TestData.Entity.testAccountEntity
import com.inso_world.binocular.infrastructure.sql.TestData.Entity.testProjectEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.BranchEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RemoteEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Platform
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Reference
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import com.inso_world.binocular.model.vcs.ReferenceCategory
import com.inso_world.binocular.model.vcs.Remote
import java.time.LocalDateTime
import kotlin.uuid.Uuid

internal object TestData {
    object Entity {
        /**
         * Creates a fresh ProjectEntity with standard test data.
         *
         * @param name Entity name (default: "test project")
         * @param id Database-specific id (default: 1L)
         * @param description Entity description (default: "this is a description")
         * @param iid Immutable identity (default: random UUID)
         * @return A new ProjectEntity instance
         */
        fun testProjectEntity(
            name: String = "test project",
            id: Long? = 1L,
            description: String? = "this is a description",
            iid: Project.Id = Project.Id(Uuid.random())
        ): ProjectEntity =
            ProjectEntity(
                name = name,
                iid = iid
            ).apply {
                this.description = description
                this.id = id
            }

        /**
         * Creates a test CommitEntity persistence entity with customizable parameters.
         *
         * @param sha The SHA hash of the commit. Must be 40 characters long.
         * @param authorDateTime The timestamp when the commit was authored.
         * @param commitDateTime The timestamp when the commit was committed.
         * @param message The commit message.
         * @param repository The RepositoryEntity this commit belongs to.
         * @param iid The internal immutable identifier.
         * @param id The Long database identifier, or null.
         * @return A CommitEntity configured with the specified values.
         */
        fun testCommitEntity(
            sha: String,
            authorDateTime: LocalDateTime,
            commitDateTime: LocalDateTime = authorDateTime,
            message: String?,
            repository: RepositoryEntity,
            author: DeveloperEntity =
                testDeveloperEntity(
                    name = "Author-${sha.take(6)}",
                    email = "author-${sha.take(6)}@example.com",
                    repository = repository,
                ),
            committer: DeveloperEntity? =
                testDeveloperEntity(
                    name = "Committer-${sha.take(6)}",
                    email = "${sha.take(6)}@example.com",
                    repository = repository,
                ),
            iid: Commit.Id = Commit.Id(Uuid.random()),
            id: Long? = null,
        ): CommitEntity =
            CommitEntity(
                sha = sha,
                authorDateTime = authorDateTime,
                commitDateTime = commitDateTime,
                message = message,
                repository = repository,
                iid = iid,
                author = author,
                committer = committer ?: author
            ).apply {
                this.id = id
            }

        /**
         * Creates a test DeveloperEntity persistence entity with customizable parameters.
         *
         * @param name The name of the developer.
         * @param email The email address of the developer.
         * @param repository The RepositoryEntity this developer belongs to.
         * @param iid The internal immutable identifier.
         * @param id The Long database identifier, or null.
         * @return A DeveloperEntity configured with the specified values.
         */
        fun testDeveloperEntity(
            name: String,
            email: String,
            repository: RepositoryEntity,
            iid: Developer.Id = Developer.Id(Uuid.random()),
            id: Long? = null
        ): DeveloperEntity =
            DeveloperEntity(
                name = name,
                email = email,
                repository = repository,
                iid = iid
            ).apply {
                this.id = id
            }

        @Deprecated("Use testDeveloperEntity", ReplaceWith("testDeveloperEntity(name,email,repository,iid,id)"))
        fun testUserEntity(
            name: String,
            email: String,
            repository: RepositoryEntity,
            iid: Developer.Id = Developer.Id(Uuid.random()),
            id: Long? = null
        ): DeveloperEntity = testDeveloperEntity(name, email, repository, iid, id)

        /**
         * Creates a test RepositoryEntity persistence entity with default or customizable parameters.
         *
         * This factory method provides a convenient way to create RepositoryEntity instances for testing,
         * with sensible defaults that can be overridden for specific test cases.
         *
         * @param localPath The local file system path to the repository. Defaults to "TestRepository".
         * @param id The Long database identifier, or null. Defaults to 1L.
         * @param iid The internal immutable identifier. Defaults to a new random Repository.Id.
         * @param project The ProjectEntity that owns this repository. Defaults to a minimal test project entity.
         * @return A RepositoryEntity configured with the specified or default values.
         *
         */
        fun testRepositoryEntity(
            localPath: String = "TestRepository",
            id: Long? = 1L,
            iid: Repository.Id = Repository.Id(Uuid.random()),
            project: ProjectEntity =
                testProjectEntity(
                    name = "TestProject",
                    id = 1L,
                    description = "A test project"
                )
        ): RepositoryEntity =
            RepositoryEntity(
                iid = iid,
                localPath = localPath,
                project = project
            ).apply {
                this.id = id
            }

        /**
         * Creates a test BranchEntity persistence entity with customizable parameters.
         *
         * @param name The name of the branch.
         * @param repository The RepositoryEntity this branch belongs to.
         * @param head The CommitEntity that is the head of this branch.
         * @param iid The internal immutable identifier.
         * @param id The Long database identifier, or null.
         * @return A BranchEntity configured with the specified values.
         */
        fun testBranchEntity(
            name: String,
            repository: RepositoryEntity,
            head: CommitEntity,
            fullName: String = name,
            category: ReferenceCategory = ReferenceCategory.LOCAL_BRANCH,
            iid: Reference.Id = Reference.Id(Uuid.random()),
            id: Long? = null
        ): BranchEntity =
            BranchEntity(
                name = name,
                fullName = fullName,
                category = category,
                repository = repository,
                head = head,
                iid = iid
            ).apply {
                this.id = id
            }

        /**
         * Creates a test AccountEntity persistence entity with default or customizable parameters.
         *
         * @param gid The global platform-specific identifier (e.g., GitHub ID).
         * @param login The login or username on the external platform.
         * @param name The display name of the account (optional).
         * @param avatarUrl The URL to the user's avatar image (optional).
         * @param url The URL to the user's profile on the platform (optional).
         * @param platform The platform the account belongs to (default: com.inso_world.binocular.model.Platform#GitHub).
         * @param iid The internal immutable identifier.
         * @param id The Long database identifier, or null.
         * @param projects A mutable set of ProjectEntity instances this account is associated with.
         *
         * @return A new AccountEntity instance configured with the specified parameters.
         */
        fun testAccountEntity(
            gid: String = "MPJAODF29843jiwp98u293834ewsfcs",
            login: String = "testlogin",
            name: String? = null,
            avatarUrl: String? = null,
            url: String? = null,
            platform: Platform = Platform.GitHub,
            iid: Account.Id = Account.Id(Uuid.random()),
            id: Long? = null,
            projects: MutableSet<ProjectEntity> = mutableSetOf(testProjectEntity())
        ): AccountEntity =
            AccountEntity(
                gid = gid,
                login = login,
                name = name,
                avatarUrl = avatarUrl,
                url = url,
                platform = platform,
                iid = iid,
                projects = projects
            ).apply {
                this.id = id
            }

        /**
         * Creates a test IssueEntity persistence entity with default or customizable parameters.
         *
         * @param gid The global platform-specific identifier for the issue (e.g., GitHub ID).
         * @param iid The internal immutable identifier.
         * @param title The title of the issue.
         * @param description The description of the issue.
         * @param createdAt The creation timestamp.
         * @param closedAt The closing timestamp.
         * @param updatedAt The last update timestamp.
         * @param state The state of the issue, e.g., "open" or "closed".
         * @param webUrl The URL to the issue on the platform.
         * @param project The owning ProjectEntity.
         * @param accounts List of AccountEntity assigned to this issue.
         * @param users List of UserEntity involved in this issue.
         * @param author The author (AccountEntity) of the issue.
         * @param id The Long database identifier, or null.
         *
         * @return A new IssueEntity instance configured with the specified parameters.
         */
        fun testIssueEntity(
            gid: String = "MWERJKD2394750sf709a8s7f8970sa7df9",
            iid: Issue.Id = Issue.Id(Uuid.random()),
            title: String? = "Test Issue",
            description: String? = "This is a test issue.",
            createdAt: LocalDateTime? = LocalDateTime.now(),
            closedAt: LocalDateTime? = null,
            updatedAt: LocalDateTime? = LocalDateTime.now(),
            state: String? = "open",
            webUrl: String? = "https://example.com/issues/1000",
            project: ProjectEntity = testProjectEntity(),
            accounts: MutableSet<AccountEntity> = mutableSetOf(testAccountEntity()),
            developers: MutableList<DeveloperEntity> = mutableListOf(),
            author: AccountEntity? = testAccountEntity(),
            id: Long? = null
        ): IssueEntity =
            IssueEntity(
                gid = gid,
                iid = iid,
                title = title,
                description = description,
                createdAt = createdAt,
                closedAt = closedAt,
                updatedAt = updatedAt,
                state = state,
                webUrl = webUrl,
                project = project,
                accounts = accounts,
                developers = developers,
                author = author,
            ).apply {
                this.id = id
            }

        fun testRemoteEntity(
            name: String,
            url: String,
            repository: RepositoryEntity,
            iid: Remote.Id = Remote.Id(Uuid.random()),
            id: Long? = null
        ): RemoteEntity =
            RemoteEntity(
                name = name,
                url = url,
                repository = repository,
                iid = iid
            ).apply {
                this.id = id
            }
    }

    object Domain {
        /**
         * Creates a fresh Project domain object with standard test data.
         *
         * @param name Project name (default: "test project")
         * @param id Database-specific id (default: null)
         * @param description Project description (default: "this is a description")
         * @return A new Project instance
         */
        fun testProject(
            name: String = "test project",
            id: String? = null,
            description: String? = "this is a description"
        ): Project =
            Project(name = name).apply {
                this.id = id
                this.description = description
            }

        /**
         * Creates a test Commit domain object with customizable parameters.
         *
         * @param sha The SHA hash of the commit. Must be 40 characters long.
         * @param authorDateTime The timestamp when the commit was authored.
         * @param commitDateTime The timestamp when the commit was committed.
         * @param message The commit message.
         * @param repository The Repository this commit belongs to.
         * @param committer The User who committed this change.
         * @param id The string identifier for the commit, or null.
         * @return A Commit domain object configured with the specified values.
         */
        fun testCommit(
            sha: String,
            authorDateTime: LocalDateTime,
            commitDateTime: LocalDateTime?,
            message: String?,
            repository: Repository,
            author: Developer =
                testDeveloper(
                    name = "Author-${sha.take(6)}",
                    email = "author-${sha.take(6)}@example.com",
                    repository = repository
                ),
            committer: Developer = author,
            id: String? = null,
        ): Commit {
            val authorSignature = Signature(developerId = author.iid, developer = author, timestamp = authorDateTime)
            val committerSignature =
                commitDateTime?.let { Signature(developerId = committer.iid, developer = committer, timestamp = it) } ?: authorSignature

            return Commit(
                sha = sha,
                authorSignature = authorSignature,
                committerSignature = committerSignature,
                message = message,
                repositoryId = repository.iid,
                repository = repository,
            ).apply {
                this.id = id
            }
        }

        /**
         * Creates a test Repository domain object with default or customizable parameters.
         *
         * This factory method provides a convenient way to create Repository instances for testing,
         * with sensible defaults that can be overridden for specific test cases.
         *
         * @param localPath The local file system path to the repository. Defaults to "TestRepo".
         * @param id The string identifier for the repository, or null. Defaults to "10".
         * @param project The Project that owns this repository. Defaults to a minimal test project.
         * @return A Repository domain object configured with the specified or default values.
         *
         */
        fun testRepository(
            localPath: String = "TestRepo",
            id: String? = "10",
            project: Project =
                testProject(
                    name = "TestProject",
                    id = "1",
                    description = "A test project"
                )
        ): Repository =
            Repository(
                localPath = localPath,
                projectId = project.iid,
                project = project
            ).apply {
                this.id = id
            }

        /**
         * Creates a test Developer domain object with customizable parameters.
         *
         * @param name The name of the developer.
         * @param email The email address of the developer.
         * @param repository The Repository this developer belongs to.
         * @param id The string identifier for the developer, or null.
         * @return A Developer domain object configured with the specified values.
         */
        fun testDeveloper(
            name: String,
            email: String,
            repository: Repository,
            id: String? = null
        ): Developer =
            Developer(
                name = name,
                email = email,
                repositoryId = repository.iid,
                repository = repository
            ).apply {
                this.id = id
            }

        @Deprecated("Use testDeveloper", ReplaceWith("testDeveloper(name,email,repository,id)"))
        fun testUser(
            name: String,
            email: String,
            repository: Repository,
            id: String? = null
        ): Developer = testDeveloper(name, email, repository, id)

        /**
         * Creates a test Branch domain object with customizable parameters.
         *
         * @param name The name of the branch.
         * @param repository The Repository this branch belongs to.
         * @param head The Commit that is the head of this branch.
         * @param id The string identifier for the branch, or null.
         * @return A Branch domain object configured with the specified values.
         */
        fun testBranch(
            name: String,
            repository: Repository,
            head: Commit,
            fullName: String = name,
            category: ReferenceCategory = ReferenceCategory.LOCAL_BRANCH,
            id: String? = null
        ): Branch =
            Branch(
                name = name,
                fullName = fullName,
                category = category,
                repositoryId = repository.iid,
                repository = repository,
                headSha = head.sha,
                head = head
            ).apply {
                this.id = id
            }

        /**
         * Creates a test Account domain object with default or customizable parameters.
         *
         * @param gid The global platform-specific identifier (e.g., GitHub ID).
         * @param login The login or username on the external platform.
         * @param name The display name of the account (optional).
         * @param avatarUrl The URL to the user's avatar image (optional).
         * @param url The URL to the user's profile on the platform (optional).
         * @param platform The platform the account belongs to (default: com.inso_world.binocular.model.Platform#GitHub).
         * @param id The Long database identifier, or null.
         * @param projects A mutable set of ProjectEntity instances this account is associated with.
         *
         * @return A new Account domain object configured with the specified parameters.
         */
        fun testAccount(
            gid: String = "MPJAODF29843jiwp98u293834ewsfcs",
            login: String = "testlogin",
            name: String? = null,
            avatarUrl: String? = null,
            url: String? = null,
            platform: Platform = Platform.GitHub,
            id: String? = null,
            projectIds: MutableSet<Project.Id> = mutableSetOf(testProject().iid)
        ): Account =
            Account(
                gid = gid,
                login = login,
                platform = platform,
                projectIds = projectIds
            ).apply {
                this.id = id
                this.name = name
                this.avatarUrl = avatarUrl
                this.url = url
            }

        /**
         * Creates a test Issue domain object with default or customizable parameters.
         *
         * @param gid The global platform-specific identifier for the issue (e.g., GitHub ID).
         * @param title The title of the issue.
         * @param description The description of the issue.
         * @param createdAt The creation timestamp.
         * @param closedAt The closing timestamp.
         * @param updatedAt The last update timestamp.
         * @param state The state of the issue, e.g., "open" or "closed".
         * @param webUrl The URL to the issue on the platform.
         * @param project The owning ProjectEntity.
         * @param accounts List of AccountEntity assigned to this issue.
         * @param developers List of Developer involved in this issue.
         * @param author The author (AccountEntity) of the issue.
         * @param id The Long database identifier, or null.
         *
         * @return A new Issue domain object configured with the specified parameters.
         */
        fun testIssue(
            gid: String = "MWERJKD2394750sf709a8s7f8970sa7df9",
            title: String? = "Test Issue",
            description: String? = "This is a test issue.",
            createdAt: LocalDateTime? = LocalDateTime.now(),
            closedAt: LocalDateTime? = null,
            updatedAt: LocalDateTime? = LocalDateTime.now(),
            state: String? = "open",
            webUrl: String? = "https://example.com/issues/1000",
            project: Project = testProject(),
            accounts: MutableSet<Account> = mutableSetOf(testAccount()),
            developers: MutableList<Developer> = mutableListOf(),
            author: Account? = null,
            id: String? = null
        ): Issue =
            Issue(
                gid = gid,
                title = title,
                description = description,
                createdAt = createdAt,
                closedAt = closedAt,
                updatedAt = updatedAt,
                state = state,
                webUrl = webUrl,
                project = project.iid,
            ).apply {
                this.id = id
                this.accountIds = accounts.map { it.iid }.toSet()
                this.developerIds = developers.map { it.iid }.toSet()
                this.authorId = author?.iid
            }

        fun testRemote(
            name: String = "origin",
            url: String = "https://example.com/repo.git",
            repository: Repository,
            id: String? = null
        ): Remote =
            Remote(
                name = name,
                url = url,
                repositoryId = repository.iid
            ).apply {
                this.repository = repository
                this.id = id
            }
    }
}
