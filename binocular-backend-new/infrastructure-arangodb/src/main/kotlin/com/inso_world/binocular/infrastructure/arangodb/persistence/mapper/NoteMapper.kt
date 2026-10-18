@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.NoteEntity
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Note
import org.springframework.stereotype.Component
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Mapper for Note domain objects.
 *
 * Converts between Note domain objects and NoteEntity persistence entities for ArangoDB.
 * This mapper handles the conversion of note metadata and uses lazy loading for related
 * accounts, issues, and merge requests.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Note structure
 * - **Lazy Loading**: Uses RelationshipProxyFactory for lazy-loaded relationships
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. It uses lazy loading
 * for accounts, issues, and merge requests to optimize performance.
 */
@Component
internal class NoteMapper : EntityMapper<Note, NoteEntity> {
    /**
     * Converts a Note domain object to NoteEntity.
     *
     * Maps all note properties including body, timestamps, flags (system, resolvable, etc.),
     * and import metadata.
     *
     * @param domain The Note domain object to convert
     * @return The NoteEntity with note metadata
     */
    override fun toEntity(domain: Note): NoteEntity =
        NoteEntity(
            id = domain.id,
            iid = domain.iid.value,
            body = domain.body,
            createdAt = domain.createdAt,
            updatedAt = domain.updatedAt,
            system = domain.system,
            resolvable = domain.resolvable,
            confidential = domain.confidential,
            internal = domain.internal,
            imported = domain.imported,
            importedFrom = domain.importedFrom,
        )

    /**
     * Converts a NoteEntity to Note domain object.
     *
     * Extracts IDs for accounts, issues, and merge requests to avoid loading
     * unnecessary data when only note metadata is needed.
     *
     * @param entity The NoteEntity to convert
     * @return The Note domain object with IDs for relationships
     */
    @OptIn(ExperimentalUuidApi::class)
    override fun toDomain(entity: NoteEntity): Note {
        val domain =
            Note(
                id = entity.id,
                body = entity.body,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt,
                system = entity.system,
                resolvable = entity.resolvable,
                confidential = entity.confidential,
                internal = entity.internal,
                imported = entity.imported,
                importedFrom = entity.importedFrom,
                issueIds = entity.issues.mapNotNull { it.iid?.let { iid -> Issue.Id(iid) } }.toMutableSet(),
                mergeRequestIds = entity.mergeRequests.mapNotNull { it.iid?.let { iid -> MergeRequest.Id(iid) } }.toMutableSet(),
                iid = entity.iid?.let { Note.Id(it) } ?: Note.Id(Uuid.random()),
            )

        domain.accountIds.addAll(
            entity.accounts.mapNotNull { it.iid?.let { iid -> Account.Id(iid) } }
        )

        return domain
    }

    override fun toDomainList(entities: Iterable<NoteEntity>): List<Note> = entities.map { it -> this.toDomain(it) }
}
