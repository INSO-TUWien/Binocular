@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.FileEntity
import com.inso_world.binocular.model.File
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Mapper for File domain objects.
 *
 * Converts between File domain objects and FileEntity persistence entities for ArangoDB.
 * This is a **simple mapper** - it only handles basic conversion without orchestrating
 * complex relationships.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts File structure
 * - **No Deep Traversal**: Does not map file states, commits, or branches
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. It supports
 * bidirectional conversion between domain and entity representations.
 */
@Component
internal class FileMapper : EntityMapper<File, FileEntity> {

    companion object {
        private val logger by logger()
    }

    /**
     * Converts a File domain object to FileEntity.
     *
     * Maps the file path, web URL, and maximum line length. Does not include
     * file states or relationships to commits/branches.
     *
     * @param domain The File domain object to convert
     * @return The FileEntity (structure only, without relationships)
     */
    override fun toEntity(domain: File): FileEntity {
        // Fast-path: if this File was already mapped in the current context, return it.

        val entity =
            FileEntity(
                id = domain.id,
                iid = domain.iid.value,
                path = domain.path,
                webUrl = domain.webUrl,
                maxLength = domain.maxLength,
            )

        return entity
    }

    /**
     * Converts a FileEntity to File domain object.
     *
     * Creates a new File domain object from the entity, setting the ID and web URL.
     * The maxLength property is stored in the entity but not restored to the domain
     * as it's typically recalculated during file processing.
     *
     * @param entity The FileEntity to convert
     * @return The File domain object (structure only, without relationships)
     */
    override fun toDomain(entity: FileEntity): File {
        // Fast-path: Check if already mapped

        val domain =
            File(
                path = entity.path,
                iid = File.Id(entity.iid),
            ).apply {
                id = entity.id
                webUrl = entity.webUrl
                maxLength = entity.maxLength ?: Int.MIN_VALUE.toLong()
            }

        return domain
    }

    override fun toDomainList(entities: Iterable<FileEntity>): List<File> = entities.map { toDomain(it) }
}
