@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.BranchEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.toArangoEntity
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Reference
import com.inso_world.binocular.model.vcs.ReferenceCategory
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDateTime
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import org.springframework.stereotype.Component

/**
 * Mapper for Branch domain objects.
 *
 * Converts between Branch domain objects and BranchEntity persistence entities for ArangoDB.
 * This is a **simple mapper** - it only handles basic conversion without orchestrating
 * complex relationships.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Branch structure
 * - **No Deep Traversal**: Does not map entire commit history or file structures
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. Direct usage
 * is also supported for `refreshDomain` operations after persistence.
 */
@Component
internal class BranchMapper : EntityMapper<Branch, BranchEntity> {

    @OptIn(kotlin.uuid.ExperimentalUuidApi::class)
    @Deprecated("Use toEntity(domain, owner, head) instead", ReplaceWith("toEntity(domain, owner, head)"))
    override fun toEntity(domain: Branch): BranchEntity {
        val owner = RepositoryEntity(
            iid = domain.repositoryId.value,
            localPath = "",
            project = ProjectEntity(iid = domain.repositoryId.value, name = "")
        )
        val head = CommitEntity(
            iid = kotlin.uuid.Uuid.random(),
            sha = domain.headSha,
            authorDateTime = java.time.LocalDateTime.now(),
            commitDateTime = java.time.LocalDateTime.now(),
            repository = owner,
            author = DeveloperEntity(iid = Developer.Id(kotlin.uuid.Uuid.random()), gitSignature = "", repository = owner),
            committer = DeveloperEntity(iid = Developer.Id(kotlin.uuid.Uuid.random()), gitSignature = "", repository = owner)
        )
        return domain.toArangoEntity(owner, head)
    }

    fun toEntity(domain: Branch, owner: RepositoryEntity, head: CommitEntity): BranchEntity =
        domain.toArangoEntity(owner, head)

    @OptIn(kotlin.uuid.ExperimentalUuidApi::class)
    override fun toDomain(entity: BranchEntity): Branch {
        val domain = Branch(
            name = entity.name,
            fullName = entity.fullName,
            category = ReferenceCategory.valueOf(entity.category),
            repositoryId = Repository.Id(entity.repository.iid),
            headSha = entity.head.sha,
            iid = Reference.Id(entity.iid)
        ).apply {
            this.id = entity.id
            this.active = entity.active
            this.tracksFileRenames = entity.tracksFileRenames
        }
        return domain
    }

    fun refreshDomain(target: Branch, entity: BranchEntity): Branch {
        target.id = entity.id
        return target
    }
}
