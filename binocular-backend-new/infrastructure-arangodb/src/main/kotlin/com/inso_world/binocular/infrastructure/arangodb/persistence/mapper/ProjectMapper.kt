@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.toArangoEntity
import com.inso_world.binocular.model.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Mapper for Project aggregate root.
 *
 * Converts between Project domain objects and ProjectEntity persistence entities for ArangoDB.
 * This is a **simple mapper** - it only handles basic conversion without orchestrating
 * child entity mapping. Use assemblers for complete aggregate assembly if needed.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Project structure (not children)
 * - **No Orchestration**: Child entities (Repository) are mapped by domain logic or ports
 * - **Identity Management**: Domain objects use immutable IIDs
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports. Direct usage
 * is also supported for `refreshDomain` operations after persistence.
 */
@Component
internal class ProjectMapper : EntityMapper<Project, ProjectEntity> {
    @Autowired
    private lateinit var issueMapper: IssueMapper

    @Autowired
    private lateinit var mergeRequestMapper: MergeRequestMapper

    @Autowired
    private lateinit var milestoneMapper: MilestoneMapper

    companion object {
        private val logger by logger()
    }

    /**
     * Converts a Project domain object to ProjectEntity.
     *
     * @param domain The Project domain object to convert
     * @return The ProjectEntity (structure only, without children)
     */
    override fun toEntity(domain: Project): ProjectEntity {
        val entity = domain.toArangoEntity()

        // Relationships are handled via IDs in domain,
        // persistence layer can populate @Ref fields if needed during save

        return entity
    }

    /**
     * Converts a ProjectEntity to Project domain object.
     *
     * @param entity The ProjectEntity to convert
     * @return The Project domain object (structure only, without children)
     */
    @OptIn(kotlin.uuid.ExperimentalUuidApi::class)
    override fun toDomain(entity: ProjectEntity): Project {
        val domain =
            Project(
                name = entity.name,
                iid = Project.Id(entity.iid),
            ).apply {
                this.id = entity.id
            }

        domain.issueIds.addAll(entity.issues.mapNotNull { it.iid?.let { iid -> Issue.Id(iid) } })
        domain.mergeRequestIds.addAll(entity.mergeRequests.mapNotNull { it.iid?.let { iid -> MergeRequest.Id(iid) } })
        domain.milestoneIds.addAll(entity.milestones.mapNotNull { it.iid?.let { iid -> Milestone.Id(iid) } })
        domain.accountIds.addAll(entity.accounts.mapNotNull { it.iid?.let { iid -> Account.Id(iid) } })

        return domain
    }

    /**
     * Refreshes a Project domain object with data from the corresponding entity.
     *
     * This method updates the domain object's ID from the entity after persistence.
     * It does NOT update nested objects - only top-level Project properties.
     *
     * @param target The Project domain object to refresh
     * @param entity The ProjectEntity with updated data
     */
    fun refreshDomain(
        target: Project,
        entity: ProjectEntity,
    ) {
        target.id = entity.id
    }
}
