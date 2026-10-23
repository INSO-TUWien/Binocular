package com.inso_world.binocular.infrastructure.sql.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.toSqlEntity
import com.inso_world.binocular.model.Repository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Mapper for Repository aggregate root.
 *
 * Converts between Repository domain objects and RepositoryEntity persistence entities.
 * This is a **simple mapper** - it only handles basic conversion without orchestrating
 * child entity mapping. Use [RepositoryAssembler] for complete aggregate assembly.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Repository structure (not children)
 * - **Aggregate Boundaries**: Expects Project already in MappingContext (cross-aggregate reference)
 * - **No Orchestration**: Child entities (Commits, Branches) are mapped by assembler
 *
 * ## Usage
 * Prefer using [RepositoryAssembler] at the service layer. This mapper is called by the assembler
 * and is also used for `refreshDomain` operations after persistence.
 *
 * @see com.inso_world.binocular.infrastructure.sql.assembler.RepositoryAssembler
 */
@Component
internal class RepositoryMapper : EntityMapper<Repository, RepositoryEntity> {
    @Autowired
    private lateinit var projectRepository: com.inso_world.binocular.infrastructure.sql.persistence.repository.ProjectRepository

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
        val owner =
            projectRepository.findByIid(domain.projectId.value)
                ?: throw IllegalStateException("ProjectEntity with iid ${domain.projectId} not found")

        val entity = domain.toSqlEntity(owner)
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
                localPath = entity.localPath.trim(),
                projectId = entity.project.iid,
                iid = entity.iid
            ).apply {
                this.id = entity.id?.toString()
            }

        return domain
    }

    fun refreshDomain(
        target: Repository,
        entity: RepositoryEntity,
    ): Repository {
        target.id = entity.id?.toString()

        return target
    }
}
