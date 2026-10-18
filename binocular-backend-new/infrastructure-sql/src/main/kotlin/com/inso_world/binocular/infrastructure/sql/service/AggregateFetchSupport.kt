package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IProjectDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity

/**
 * Helper utilities to respect aggregate boundaries when loading data.
 *
 * Projects act as the primary aggregate root and own exactly one Repository.
 * Repository-level data must therefore be obtained by traversing through
 * the Project aggregate to keep the graph consistent.
 */
internal object AggregateFetchSupport {
    fun loadProjectEntities(projectDao: IProjectDao): Iterable<ProjectEntity> = projectDao.findAll()

    fun loadRepositoryEntities(projectDao: IProjectDao): List<RepositoryEntity> =
        loadProjectEntities(projectDao).mapNotNull(ProjectEntity::repo)
}
