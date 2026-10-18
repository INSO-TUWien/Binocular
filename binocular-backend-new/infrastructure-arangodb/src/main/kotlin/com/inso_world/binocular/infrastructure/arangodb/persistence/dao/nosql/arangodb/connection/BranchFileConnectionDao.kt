package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.connection

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.arangodb.model.edge.BranchFileConnection
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IBranchFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.BranchFileConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.BranchMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.FileMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.BranchRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.FileRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.edges.BranchFileConnectionRepository
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.File
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of IBranchFileConnectionDao.
 *
 * This class adapts the existing BranchFileConnectionRepository to work with
 * the new domain model and entity structure.
 */

@Repository
internal class BranchFileConnectionDao
    @Autowired
    constructor(
        private val repository: BranchFileConnectionRepository,
        private val branchRepository: BranchRepository,
        private val fileRepository: FileRepository,
        private val branchMapper: BranchMapper,
        private val fileMapper: FileMapper,
    ) : IBranchFileConnectionDao {
        /**
         * Find all files connected to a branch
         */
        override fun findFilesByBranch(branchId: String): List<File> {
            val fileEntities = repository.findFilesByBranch(branchId)
            return fileEntities.map { fileMapper.toDomain(it) }
        }

        /**
         * Find all branches connected to a file
         */
        override fun findBranchesByFile(fileId: String): List<Branch> {
            val branchEntities = repository.findBranchesByFile(fileId)
            return branchEntities.map { branchMapper.toDomain(it) }
        }

        /**
         * Find all files by branch paginated
         */
        override fun findFilesByBranch(
            branchId: String,
            pageable: Pageable
        ): Page<File> {
            val offset = pageable.offset.toInt()
            val size = pageable.pageSize
            val firstOrder = pageable.sort.firstOrNull()
            val asc = firstOrder?.direction != Sort.Direction.DESC

            val entities =
                if (asc) {
                    repository.findFilesByBranchAsc(branchId, offset, size)
                } else {
                    repository.findFilesByBranchDesc(branchId, offset, size)
                }
            val content = entities.map { fileMapper.toDomain(it) }
            val total = repository.countFilesByBranch(branchId)
            return Page(content, total, pageable)
        }

        /**
         * Save a branch-file connection
         */
        override fun save(connection: BranchFileConnection): BranchFileConnection {
            // Get the branch and file entities from their repositories
            val branchEntity =
                branchRepository.findById(connection.from.id!!).orElseThrow {
                    IllegalArgumentException("Branch with ID ${connection.from.id} not found")
                }
            val fileEntity =
                fileRepository.findById(connection.to.id!!).orElseThrow {
                    IllegalArgumentException("File with ID ${connection.to.id} not found")
                }

            // Convert domain model to the edge entity format
            val edgeEntity =
                BranchFileConnectionEntity(
                    id = connection.id,
                    from = branchEntity,
                    to = fileEntity,
                )

            // Save using the repository
            val savedEntity = repository.save(edgeEntity)

            // Convert back to domain model
            return BranchFileConnection(
                id = savedEntity.id,
                from = branchMapper.toDomain(savedEntity.from),
                to = fileMapper.toDomain(savedEntity.to),
            )
        }

        /**
         * Delete all branch-file connections
         */
        override fun deleteAll() {
            repository.deleteAll()
        }
    }
