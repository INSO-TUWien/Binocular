package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.connection

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.arangodb.model.edge.CommitFileConnection
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitFileConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.CommitMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.FileMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.UserMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.CommitRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.FileRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.UserRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.edges.CommitFileConnectionRepository
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.FileOwnership
import com.inso_world.binocular.model.OwnershipHunk
import com.inso_world.binocular.model.OwnershipLine
import com.inso_world.binocular.model.Stats
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of ICommitFileConnectionDao.
 *
 * This class adapts the existing CommitFileConnectionRepository to work with
 * the new domain model and entity structure.
 */

@Repository
internal class CommitFileConnectionDao
    @Autowired
    constructor(
        private val repository: CommitFileConnectionRepository,
        private val commitRepository: CommitRepository,
        private val fileRepository: FileRepository,
        private val fileMapper: FileMapper,
        private val userRepository: UserRepository,
        private val userMapper: UserMapper,
    ) : ICommitFileConnectionDao {
        @Autowired private lateinit var commitMapper: CommitMapper

        override fun findFileOwnershipByCommitAndFile(
            commitId: String,
            fileId: String
        ): List<FileOwnership> {
            val rows = repository.findOwnershipByCommitAndFile(commitId, fileId)
            if (rows.isEmpty()) return emptyList()

            // Group hunks by userId
            val byUser = mutableMapOf<String, MutableList<OwnershipHunk>>()
            rows.forEach { row ->
                val userId = row["userId"]?.toString() ?: return@forEach
                val hunksRaw = row["hunks"] as? List<*> ?: emptyList<Any?>()
                val hunks =
                    hunksRaw.mapNotNull { hunkAny ->
                        val hunkMap = hunkAny as? Map<*, *> ?: return@mapNotNull null
                        val originalCommit = hunkMap["originalCommit"]?.toString()
                        val linesRaw = hunkMap["lines"] as? List<*> ?: emptyList<Any?>()
                        val lines =
                            linesRaw.mapNotNull { lineAny ->
                                val lineMap = lineAny as? Map<*, *> ?: return@mapNotNull null
                                val from = (lineMap["from"] as? Number)?.toInt() ?: return@mapNotNull null
                                val to = (lineMap["to"] as? Number)?.toInt() ?: return@mapNotNull null
                                OwnershipLine(from = from, to = to)
                            }
                        OwnershipHunk(originalCommit = originalCommit, lines = lines)
                    }
                val list = byUser.getOrPut(userId) { mutableListOf() }
                list.addAll(hunks)
            }

            // Map to FileOwnership with gitSignature (String)
            return byUser.mapNotNull { (userId, hunks) ->
                val userEntityOpt = userRepository.findById(userId)
                if (!userEntityOpt.isPresent) return@mapNotNull null
                val user = userMapper.toDomain(userEntityOpt.get())
                val signature = user.gitSignature ?: user.id ?: userId
                FileOwnership(user = signature, hunks = hunks)
            }
        }

        /**
         * Find all files connected to a commit
         */
        override fun findFilesByCommit(commitId: String): List<File> {
            val fileEntities = repository.findFilesByCommit(commitId)
            return fileEntities.map { fileMapper.toDomain(it) }
        }

        /**
         * Find all files connected to a commit with pagination support.
         */
        override fun findFilesByCommitPaged(
            commitId: String,
            pageable: Pageable
        ): Page<File> {
            val offset = pageable.offset.toInt()
            val limit = pageable.pageSize
            val total = repository.countFilesByCommit(commitId).firstOrNull() ?: 0L
            val fileEntities = if (limit > 0) repository.findFilesByCommitOrdered(commitId, offset, limit) else emptyList()
            val content = fileEntities.map { fileMapper.toDomain(it) }
            return Page(content, total, pageable)
        }

        /**
         * Find all commits connected to a file
         */
        override fun findCommitsByFile(fileId: String): List<Commit> {
            val commitEntities = repository.findCommitsByFile(fileId)
            return commitEntities.map { commitMapper.toDomain(it) }
        }

        /**
         * Find all commits connected to a file with pagination support.
         */
        override fun findCommitsByFilePaged(
            fileId: String,
            pageable: Pageable
        ): Page<Commit> {
            val offset = pageable.offset.toInt()
            val limit = pageable.pageSize
            val total = repository.countCommitsByFile(fileId).firstOrNull() ?: 0L
            val commitEntities = if (limit > 0) repository.findCommitsByFileOrdered(fileId, offset, limit) else emptyList()
            val content = commitEntities.map { commitMapper.toDomain(it) }
            return Page(content, total, pageable)
        }

        /**
         * Find aggregated stats for a commit
         */
        override fun findCommitStatsByCommit(commitId: String): Stats {
            val row =
                repository.findCommitStats(commitId).firstOrNull()
                    ?: return Stats(additions = 0, deletions = 0)

            return Stats(
                additions = (row["additions"] as? Number)?.toLong() ?: 0L,
                deletions = (row["deletions"] as? Number)?.toLong() ?: 0L
            )
        }

        /**
         * Find stats per file for a commit
         */
        override fun findFileStatsByCommit(commitId: String): Map<String, Stats> {
            val rows = repository.findFileStatsByCommit(commitId)

            return rows.associate { row ->
                val fileId =
                    row["fileId"]?.toString()
                        ?: error("Missing fileId in commit file stats row: $row")

                val additions = (row["additions"] as? Number)?.toLong() ?: 0L
                val deletions = (row["deletions"] as? Number)?.toLong() ?: 0L

                fileId to Stats(additions = additions, deletions = deletions)
            }
        }

        override fun findFileActionsByCommit(commitId: String): Map<String, String?> {
            val rows = repository.findFileActionsByCommit(commitId)
            return rows.associate { row ->
                val fileId =
                    row["fileId"]?.toString()
                        ?: error("Missing fileId in commit file actions row: $row")
                val action = row["action"]?.toString()
                fileId to action
            }
        }

        /**
         * Save a commit-file connection
         */
        override fun save(connection: CommitFileConnection): CommitFileConnection {
            // Get the commit and file entities from their repositories
            val commitEntity =
                commitRepository.findById(connection.from.id!!).orElseThrow {
                    IllegalArgumentException("Commit with ID ${connection.from.id} not found")
                }
            val fileEntity =
                fileRepository.findById(connection.to.id!!).orElseThrow {
                    IllegalArgumentException("File with ID ${connection.to.id} not found")
                }

            // Convert domain model to the repository entity format
            val entity =
                CommitFileConnectionEntity(
                    id = connection.id,
                    from = commitEntity,
                    to = fileEntity,
                    lineCount = connection.lineCount,
                )

            // Save using the repository
            val savedEntity = repository.save(entity)

            // Convert back to domain model
            return CommitFileConnection(
                id = savedEntity.id,
                from = commitMapper.toDomain(savedEntity.from),
                to = fileMapper.toDomain(savedEntity.to),
                lineCount = savedEntity.lineCount,
            )
        }

        /**
         * Delete all commit-file connections
         */
        override fun deleteAll() {
            repository.deleteAll()
        }
    }
