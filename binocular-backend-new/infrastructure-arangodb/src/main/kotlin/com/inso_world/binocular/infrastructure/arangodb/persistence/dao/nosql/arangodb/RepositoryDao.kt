package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IRepositoryDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.RepositoryMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.*
import com.inso_world.binocular.model.Repository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Repository as SpringRepository

@SpringRepository
internal class RepositoryDao
    @Autowired
    constructor(
        private val repositoryRepository: RepositoryRepository,
        private val repositoryMapper: RepositoryMapper,
    ) : MappedArangoDbDao<Repository, RepositoryEntity, String>(repositoryRepository, repositoryMapper),
        IRepositoryDao {
        companion object {
            val logger by logger()
        }

        @Autowired @Lazy
        private lateinit var projectDao: ProjectDao

        @Autowired
        private lateinit var commitRepository: CommitRepository

        @Autowired
        private lateinit var branchRepository: BranchRepository

        @Autowired
        private lateinit var developerRepository: DeveloperRepository

        @Autowired
        private lateinit var remoteRepository: RemoteRepository

        @Autowired
        private lateinit var fileRepository: FileRepository

        @Autowired
        private lateinit var revisionRepository: RevisionRepository

        override fun findByName(name: String): RepositoryEntity? = this.repositoryRepository.findByLocalPath(name)

        fun create(
            entity: RepositoryEntity,
            skipProjectCheck: Boolean = false
        ): RepositoryEntity {
            // Save Developers first (referenced by Commits)
            entity.developers.forEach { developerRepository.save(it) }

            // Save Repository root
            val savedEntity = repositoryRepository.save(entity)

            // Save Commits
            entity.commits.forEach { commitRepository.save(it) }

            // Save Branches
            entity.branches.forEach { branchRepository.save(it) }

            // Save Remotes
            entity.remotes.forEach { remoteRepository.save(it) }

            // Save Files and Revisions
            entity.files.forEach { fileRepository.save(it) }
            entity.revisions.forEach { revisionRepository.save(it) }

            if (!skipProjectCheck && entity.project != null) {
                val existingProject = this.projectDao.findByName(entity.project!!.name)
                if (existingProject == null) {
                    this.projectDao.create(entity.project!!.toDomain())
                }
            }

            return savedEntity
        }
    }
