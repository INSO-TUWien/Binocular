package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.toArangoEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.ProjectRepository
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Mapper for Repository aggregate root.
 *
 * Converts between Repository domain objects and RepositoryEntity persistence entities for ArangoDB.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Repository structure
 * - **Aggregate Boundaries**: Uses IDs for cross-aggregate references
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports. Direct usage
 * is also supported for `refreshDomain` operations after persistence.
 */
@Component
internal class RepositoryMapper : EntityMapper<Repository, RepositoryEntity> {
    @Autowired
    private lateinit var projectRepository: ProjectRepository

    @Autowired
    private lateinit var commitMapper: CommitMapper

    @Autowired
    private lateinit var branchMapper: BranchMapper

    @Autowired
    private lateinit var developerMapper: DeveloperMapper

    @Autowired
    private lateinit var remoteMapper: RemoteMapper

    @Autowired
    private lateinit var fileMapper: FileMapper

    @Autowired
    private lateinit var revisionMapper: RevisionMapper

    companion object {
        private val logger by logger()
    }

    /**
     * Converts a Repository domain object to RepositoryEntity.
     *
     * @param domain The Repository domain object to convert
     * @return The RepositoryEntity
     */
    override fun toEntity(domain: Repository): RepositoryEntity {
        // Find project or create a placeholder if it doesn't exist yet
        val owner =
            domain.project?.let {
                ProjectEntity(
                    id = it.id,
                    name = it.name,
                    iid = it.iid.value
                )
            } ?: if (::projectRepository.isInitialized) {
                projectRepository.findByIid(domain.projectId.value)
            } else {
                null
            } ?: ProjectEntity(
                iid = domain.projectId.value,
                name = "Unknown Project"
            )

        val entity = domain.toArangoEntity(owner)

        return entity
    }

    /**
     * Converts a RepositoryEntity to Repository domain object.
     *
     * @param entity The RepositoryEntity to convert
     * @return The Repository domain object
     */
    override fun toDomain(entity: RepositoryEntity): Repository {
        val domain =
            Repository(
                localPath = entity.localPath,
                projectId = entity.project?.let { Project.Id(it.iid) } ?: Project.Id(entity.iid),
                iid = Repository.Id(entity.iid),
            ).apply {
                this.id = entity.id
            }

        return domain
    }

    /**
     * Refreshes a Repository domain object with data from the corresponding entity.
     *
     * This method updates the domain object's ID from the entity after persistence.
     * It does NOT update nested objects - only top-level Repository properties.
     *
     * @param target The Repository domain object to refresh
     * @param entity The RepositoryEntity with updated data
     * @return The refreshed Repository domain object
     */
    fun refreshDomain(
        target: Repository,
        entity: RepositoryEntity,
    ): Repository {
        target.id = entity.id

        return target
    }
}
