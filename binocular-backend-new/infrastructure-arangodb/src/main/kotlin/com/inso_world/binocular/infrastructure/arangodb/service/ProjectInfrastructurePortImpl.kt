@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.ProjectDao
import com.inso_world.binocular.model.Project
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
internal class ProjectInfrastructurePortImpl :
    AbstractInfrastructurePort<Project, String>(),
    ProjectInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = projectDao
    }

    companion object {
        val logger by logger()
    }

    @Autowired
    private lateinit var projectDao: ProjectDao

    override fun findAll(): Iterable<Project> = this.projectDao.findAll()

    override fun findAll(pageable: Pageable): Page<Project> = this.projectDao.findAll(pageable)

    override fun findById(id: String): Project? = this.projectDao.findById(id)

    override fun create(value: Project): Project = this.projectDao.create(value)

    override fun saveAll(values: Collection<Project>): Iterable<Project> = this.projectDao.saveAll(values)

    override fun findByName(name: String): Project? = this.projectDao.findByName(name)

    override fun update(value: Project): Project = this.projectDao.save(value)

    override fun findByIid(iid: Project.Id): Project? {
        logger.trace("Getting project by iid: $iid")
        return projectDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<Project.Id>): List<Project> {
        logger.trace("Getting projects by iids: $iids")
        return projectDao.findAll().filter { it.iid in iids }
    }
}
