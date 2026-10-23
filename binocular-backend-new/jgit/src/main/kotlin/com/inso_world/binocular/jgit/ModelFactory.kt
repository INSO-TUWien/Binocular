package com.inso_world.binocular.jgit

import com.inso_world.binocular.model.*
import com.inso_world.binocular.model.vcs.ReferenceCategory
import java.time.LocalDateTime

/**
 * Java-friendly factory for creating domain objects that use Kotlin-specific features 
 * (like value classes and ExperimentalUuidApi) which makes their constructors appear private in Java.
 */
class ModelFactory {

    companion object {
        @JvmStatic
        fun createProject(name: String): Project = Project(name)

        @JvmStatic
        fun createProject(name: String, iid: Project.Id): Project = Project(name, iid)

        @JvmStatic
        fun createRepository(localPath: String, projectId: Project.Id): Repository =
            Repository(localPath = localPath, projectId = projectId)

        @JvmStatic
        fun createRepository(localPath: String, project: Project): Repository =
            Repository(localPath = localPath, projectId = project.iid).apply { this.project = project }

        @JvmStatic
        fun createRepository(localPath: String, projectId: Project.Id, iid: Repository.Id): Repository =
            Repository(localPath = localPath, projectId = projectId, iid = iid)

        @JvmStatic
        fun createDeveloper(name: String, email: String, repositoryId: Repository.Id): Developer =
            Developer(name = name, email = email, repositoryId = repositoryId)

        @JvmStatic
        fun createDeveloper(name: String, email: String, repository: Repository): Developer =
            Developer(name = name, email = email, repositoryId = repository.iid).apply { this.repository = repository }

        @JvmStatic
        fun createDeveloper(name: String, email: String, repositoryId: Repository.Id, iid: Developer.Id): Developer =
            Developer(name = name, email = email, repositoryId = repositoryId, iid = iid)

        @JvmStatic
        fun createSignature(developerId: Developer.Id, timestamp: LocalDateTime): Signature =
            Signature(developerId = developerId, timestamp = timestamp)

        @JvmStatic
        fun createCommit(sha: String, authorSignature: Signature, committerSignature: Signature, message: String?, repositoryId: Repository.Id): Commit =
            Commit(sha = sha, authorSignature = authorSignature, committerSignature = committerSignature, message = message, repositoryId = repositoryId)

        @JvmStatic
        fun createCommit(sha: String, authorSignature: Signature, committerSignature: Signature, message: String?, repository: Repository): Commit =
            Commit(sha = sha, authorSignature = authorSignature, committerSignature = committerSignature, message = message, repositoryId = repository.iid).apply { this.repository = repository }

        @JvmStatic
        fun createCommit(sha: String, authorSignature: Signature, committerSignature: Signature, message: String?, repositoryId: Repository.Id, iid: Commit.Id): Commit =
            Commit(sha = sha, authorSignature = authorSignature, committerSignature = committerSignature, message = message, repositoryId = repositoryId, iid = iid)

        @JvmStatic
        fun createBranch(name: String, fullName: String, category: ReferenceCategory, repositoryId: Repository.Id, headSha: String): Branch =
            Branch(name = name, fullName = fullName, category = category, repositoryId = repositoryId, headSha = headSha)

        @JvmStatic
        fun createBranch(name: String, fullName: String, category: ReferenceCategory, repository: Repository, headSha: String): Branch =
            Branch(name = name, fullName = fullName, category = category, repositoryId = repository.iid, headSha = headSha).apply { this.repository = repository }

        @JvmStatic
        fun createBranch(name: String, fullName: String, category: ReferenceCategory, repositoryId: Repository.Id, headSha: String, iid: Reference.Id): Branch =
            Branch(name = name, fullName = fullName, category = category, repositoryId = repositoryId, headSha = headSha, iid = iid)

        @JvmStatic
        fun createCommit(repo: Repository, rc: org.eclipse.jgit.revwalk.RevCommit, developersByKey: java.util.Map<String, Developer>, mailmap: Mailmap?): Commit {
            val sha = rc.id.name
            val authorIdent = rc.authorIdent
            val committerIdent = rc.committerIdent

            val author = getOrCreateDeveloper(repo, authorIdent, developersByKey)
            val authorTime = toLocalDateTime(rc.authorIdent)

            val committer = getOrCreateDeveloper(repo, committerIdent, developersByKey)
            val commitTime = toLocalDateTime(rc.committerIdent)

            val authorSignature = createSignature(author.iid, authorTime)
            val committerSignature = createSignature(committer.iid, commitTime)

            return createCommit(sha, authorSignature, committerSignature, rc.fullMessage, repo)
        }

        private fun getOrCreateDeveloper(repo: Repository, ident: org.eclipse.jgit.lib.PersonIdent, cache: java.util.Map<String, Developer>): Developer {
            var name = ident.name
            var email = ident.emailAddress
            if (email == null || email.isBlank()) {
                email = "unknown@unknown.com"
            }
            if (name == null || name.isBlank()) {
                name = "Unknown"
            }

            val key = "${name.trim()} <${email.trim()}>"
            var developer = cache[key]
            if (developer == null) {
                developer = createDeveloper(name, email, repo.iid)
                cache.put(key, developer)
            }
            return developer
        }

        private fun toLocalDateTime(ident: org.eclipse.jgit.lib.PersonIdent): LocalDateTime {
            return LocalDateTime.ofInstant(ident.whenAsInstant, java.time.ZoneId.systemDefault())
        }
    }
}
