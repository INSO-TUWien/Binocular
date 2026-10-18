@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IProjectDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.ProjectRepository
import com.inso_world.binocular.model.Project
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi

@Repository
internal open class ProjectDao(
    @Autowired private val projectRepo: ProjectRepository,
    @Autowired @Lazy private val repositoryDao: RepositoryDao,
) : SqlDao<ProjectEntity, Long>(projectRepo),
    IProjectDao {
    init {
        this.clazz = ProjectEntity::class.java
    }

    override fun findByName(name: String): ProjectEntity? = projectRepo.findByName(name)

    @OptIn(kotlin.uuid.ExperimentalUuidApi::class)
    override fun findByIid(iid: Project.Id): ProjectEntity? = projectRepo.findByIid(iid.value)

    override fun findByIid(iid: Any): ProjectEntity? {
        val uIid: kotlin.uuid.Uuid =
            when (iid) {
                is Project.Id -> iid.value
                is kotlin.uuid.Uuid -> iid
                is String -> kotlin.uuid.Uuid.parse(iid)
                else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
            }
        return projectRepo.findByIid(uIid)
    }

    override fun findByIids(iids: Collection<Any>): List<ProjectEntity> = iids.mapNotNull { findByIid(it) }

//    @Transactional
//    override fun delete(entity: ProjectEntity) {
//        val toDelete =
//            getManagedEntity(entity) ?: throw IllegalArgumentException("ProjectEntity not found")
//        super.delete(toDelete)
//    }

//    private fun getManagedEntity(entity: ProjectEntity): ProjectEntity? {
//        val managed =
//            entity.id
//                ?.let {
//                    entityManager.find(ProjectEntity::class.java, it)
//                }?.let {
//                    findByName(it.name)
//                }
//
// //        managed?.repo = managed?.repo?.let { repo ->
// //            entityManager.find(Repo)
// //        }
//
//        return managed
//    }

//    @Transactional
//    override fun update(entity: ProjectEntity): ProjectEntity {
//        val toUpdate =
//            getManagedEntity(entity) ?: throw IllegalArgumentException("ProjectEntity not found")
//
//        toUpdate.repo = entity.repo?.let { repositoryDao.getManagedEntity(it) }
//
//        return super.update(toUpdate)
//    }

//    override fun create(entity: ProjectEntity): ProjectEntity = super.create(entity)
}
