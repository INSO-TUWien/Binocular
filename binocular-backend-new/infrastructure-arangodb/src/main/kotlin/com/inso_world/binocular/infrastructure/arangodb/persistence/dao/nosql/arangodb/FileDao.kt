package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb

import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IFileDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.FileEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.FileMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.FileRepository
import com.inso_world.binocular.model.File
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of IFileDao using the MappedArangoDbDao approach.
 *
 * This class extends MappedArangoDbDao to leverage the entity mapping pattern,
 * which provides a clean separation between domain models (File) and
 * database-specific entities (FileEntity).
 */

@Repository
internal class FileDao(
    @Autowired private val fileRepository: FileRepository,
    @Autowired private val fileMapper: FileMapper,
) : MappedArangoDbDao<File, FileEntity, String>(fileRepository, fileMapper),
    IFileDao {
    override fun findByPath(path: String): File? {
        val entity = fileRepository.findByPath(path) ?: return null
        return fileMapper.toDomain(entity)
    }
}
