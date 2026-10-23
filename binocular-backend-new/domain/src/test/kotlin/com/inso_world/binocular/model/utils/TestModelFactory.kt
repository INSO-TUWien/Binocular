package com.inso_world.binocular.model.utils

import com.inso_world.binocular.model.*
import com.inso_world.binocular.model.vcs.ReferenceCategory
import com.inso_world.binocular.model.vcs.Remote
import java.time.LocalDateTime
import kotlin.uuid.Uuid

object TestModelFactory {
    fun createProject(name: String, iid: Project.Id = Project.Id(Uuid.random())): Project = Project(name = name, iid = iid)

    fun createProjectWithRepo(name: String, iid: Project.Id = Project.Id(Uuid.random())): Project {
        val p = Project(name = name, iid = iid)
        val r = Repository(localPath = "test-path", projectId = p.iid)
        r.project = p
        return p
    }

    fun createRepository(localPath: String, projectId: Project.Id, iid: Repository.Id = Repository.Id(Uuid.random())): Repository = 
        Repository(localPath, projectId = projectId, iid = iid)

    fun createRepository(localPath: String, project: Project, iid: Repository.Id = Repository.Id(Uuid.random())): Repository =
        Repository(localPath, projectId = project.iid, iid = iid).apply { this.project = project }

    fun createDeveloper(name: String, email: String, repositoryId: Repository.Id, iid: Developer.Id = Developer.Id(Uuid.random())): Developer = 
        Developer(name = name, email = email, repositoryId = repositoryId, iid = iid)

    fun createDeveloper(name: String, email: String, repository: Repository, iid: Developer.Id = Developer.Id(Uuid.random())): Developer =
        Developer(name = name, email = email, repositoryId = repository.iid, iid = iid).apply { this.repository = repository }

    fun createSignature(developerId: Developer.Id, timestamp: LocalDateTime): Signature = 
        Signature(developerId = developerId, timestamp = timestamp)

    fun createSignature(developer: Developer, timestamp: LocalDateTime = LocalDateTime.now().minusSeconds(1)): Signature =
        Signature(developerId = developer.iid, timestamp = timestamp).apply { this.developer = developer }

    fun createCommit(sha: String, authorSignature: Signature, committerSignature: Signature, message: String?, repositoryId: Repository.Id, parentShas: Set<String> = emptySet(), iid: Commit.Id = Commit.Id(Uuid.random())): Commit {
        val c = Commit(sha = sha, authorSignature = authorSignature, committerSignature = committerSignature, message = message, repositoryId = repositoryId, iid = iid)
        c.parentShas.addAll(parentShas)
        return c
    }

    fun createCommit(sha: String, authorSignature: Signature, committerSignature: Signature, message: String?, repository: Repository, parentShas: Set<String> = emptySet(), iid: Commit.Id = Commit.Id(Uuid.random())): Commit {
        val c = Commit(sha = sha, authorSignature = authorSignature, committerSignature = committerSignature, message = message, repositoryId = repository.iid, iid = iid).apply { this.repository = repository }
        c.parentShas.addAll(parentShas)
        return c
    }

    fun createBranch(name: String, fullName: String, repositoryId: Repository.Id, headSha: String, category: ReferenceCategory = ReferenceCategory.LOCAL_BRANCH, iid: Reference.Id = Reference.Id(Uuid.random())): Branch =
        Branch(name = name, fullName = fullName, category = category, repositoryId = repositoryId, headSha = headSha, iid = iid)

    fun createBranch(name: String, fullName: String, repository: Repository, headSha: String, category: ReferenceCategory = ReferenceCategory.LOCAL_BRANCH, iid: Reference.Id = Reference.Id(Uuid.random())): Branch =
        Branch(name = name, fullName = fullName, category = category, repositoryId = repository.iid, headSha = headSha, iid = iid).apply { this.repository = repository }

    fun createRemote(name: String, url: String, repositoryId: Repository.Id, iid: Remote.Id = Remote.Id(Uuid.random())): Remote =
        Remote(name = name, url = url, repositoryId = repositoryId, iid = iid)

    fun createRemote(name: String, url: String, repository: Repository, iid: Remote.Id = Remote.Id(Uuid.random())): Remote =
        Remote(name = name, url = url, repositoryId = repository.iid, iid = iid).apply { this.repository = repository }
}
