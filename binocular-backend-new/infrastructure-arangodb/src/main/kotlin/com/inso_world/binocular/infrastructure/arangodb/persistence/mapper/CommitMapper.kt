package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.toArangoEntity
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Mapper for Commit domain objects.
 *
 * Converts between Commit domain objects and CommitEntity persistence entities for ArangoDB.
 * This is a **simple mapper** - it only handles basic conversion without orchestrating
 * complex relationships like full commit history graphs.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Commit structure
 * - **No Deep Traversal**: Does not automatically map entire parent/child commit graphs
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. Direct usage
 * is also supported for `refreshDomain` operations after persistence.
 */
@Component
internal class CommitMapper : EntityMapper<Commit, CommitEntity> {
    @Autowired
    private lateinit var developerMapper: DeveloperMapper

    /**
     * Converts a Commit domain object to CommitEntity.
     *
     * @param domain The Commit domain object to convert
     * @return The CommitEntity (structure only, without relationships)
     */
    @Deprecated("Use toEntity(domain, repository, author, committer) instead")
    override fun toEntity(domain: Commit): CommitEntity {
        val owner =
            RepositoryEntity(
                iid = domain.repositoryId.value,
                localPath = "",
                project = ProjectEntity(iid = domain.repositoryId.value, name = "") // Dummy project
            )

        // For author/committer, we construct dummy entities with correct iids
        val authorEntity =
            DeveloperEntity(
                iid = domain.authorSignature.developerId,
                gitSignature = "",
                repository = owner
            )
        val committerEntity =
            DeveloperEntity(
                iid = domain.committerSignature.developerId,
                gitSignature = "",
                repository = owner
            )

        val entity =
            domain.toArangoEntity(
                repository = owner,
                author = authorEntity,
                committer = committerEntity,
            )

        return entity
    }

    fun toEntity(
        domain: Commit,
        repository: RepositoryEntity,
        author: DeveloperEntity,
        committer: DeveloperEntity
    ): CommitEntity =
        domain.toArangoEntity(
            repository = repository,
            author = author,
            committer = committer,
        )

    /**
     * Converts a CommitEntity to Commit domain object.
     *
     * @param entity The CommitEntity to convert
     * @return The Commit domain object (structure only, without relationships)
     */
    override fun toDomain(entity: CommitEntity): Commit {
        val domain =
            Commit(
                sha = entity.sha,
                authorSignature =
                    Signature(
                        developerId = entity.author.iid,
                        timestamp = entity.authorDateTime
                    ),
                committerSignature =
                    Signature(
                        developerId = entity.committer.iid,
                        timestamp = entity.commitDateTime
                    ),
                message = entity.message,
                repositoryId = Repository.Id(entity.repository.iid),
                iid = Commit.Id(entity.iid)
            ).apply {
                this.id = entity.id
                this.webUrl = entity.webUrl
                this.branch = entity.branch
                this.stats =
                    entity.stats?.let {
                        com.inso_world.binocular.model.Stats(
                            additions = it.additions,
                            deletions = it.deletions,
                            kind = it.kind ?: com.inso_world.binocular.model.Stats.StatsKind.MODIFICATION
                        )
                    }
            }

        return domain
    }

    /**
     * Refreshes a Commit domain object with data from the corresponding entity.
     *
     * This method updates the domain object's ID from the entity after persistence.
     * It also recursively refreshes parent and child commits, as well as author/committer.
     *
     * **Note**: This method performs recursive updates on parent/child relationships.
     *
     * @param target The Commit domain object to refresh
     * @param entity The CommitEntity with updated data
     * @return The refreshed Commit domain object
     */
    fun refreshDomain(
        target: Commit,
        entity: CommitEntity,
    ): Commit {
        target.id = entity.id

        return target
    }
}
