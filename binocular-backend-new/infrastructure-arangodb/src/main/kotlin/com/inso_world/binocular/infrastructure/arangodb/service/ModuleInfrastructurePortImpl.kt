package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.ModuleInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitModuleConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IModuleFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IModuleModuleConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IModuleDao
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Module
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

/**
 * Implementation of the ModuleService interface.
 * This service is database-agnostic and works with both ArangoDB and SQL implementations.
 */
@Service
internal class ModuleInfrastructurePortImpl :
    AbstractInfrastructurePort<Module, String>(),
    ModuleInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = moduleDao
    }

    @Autowired private lateinit var moduleDao: IModuleDao

    @Autowired private lateinit var commitModuleConnectionRepository: ICommitModuleConnectionDao

    @Autowired private lateinit var moduleFileConnectionRepository: IModuleFileConnectionDao

    @Autowired private lateinit var moduleModuleConnectionRepository: IModuleModuleConnectionDao
    var logger: Logger = LoggerFactory.getLogger(ModuleInfrastructurePortImpl::class.java)

    override fun findAll(pageable: Pageable): Page<com.inso_world.binocular.model.Module> {
        logger.trace("Getting all modules with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return moduleDao.findAll(pageable)
    }

    override fun findById(id: String): com.inso_world.binocular.model.Module? {
        logger.trace("Getting module by id: $id")
        return moduleDao.findById(id)
    }

    override fun findByIid(iid: Module.Id): @Valid Module? {
        logger.trace("Getting module by iid: $iid")
        return moduleDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<Module.Id>): List<@Valid Module> {
        logger.trace("Getting modules by iids: $iids")
        return moduleDao.findAll().filter { it.iid in iids }
    }

    override fun findCommitsByModuleId(moduleId: String): List<Commit> {
        logger.trace("Getting commits for module: $moduleId")
        return commitModuleConnectionRepository.findCommitsByModule(moduleId)
    }

    override fun findFilesByModuleId(moduleId: String): List<File> {
        logger.trace("Getting files for module: $moduleId")
        return moduleFileConnectionRepository.findFilesByModule(moduleId)
    }

    override fun findChildModulesByModuleId(moduleId: String): List<com.inso_world.binocular.model.Module> {
        logger.trace("Getting child modules for module: $moduleId")
        return moduleModuleConnectionRepository.findChildModules(moduleId)
    }

    override fun findParentModulesByModuleId(moduleId: String): List<com.inso_world.binocular.model.Module> {
        logger.trace("Getting parent modules for module: $moduleId")
        return moduleModuleConnectionRepository.findParentModules(moduleId)
    }

    override fun findAll(): Iterable<Module> = moduleDao.findAll()

    override fun create(entity: Module): Module = moduleDao.save(entity)

    override fun saveAll(entities: Collection<Module>): Iterable<Module> = moduleDao.saveAll(entities)

    override fun delete(entity: Module): Unit = moduleDao.delete(entity)

    override fun update(entity: Module): Module {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: String) {
        TODO("Not yet implemented")
    }

    override fun deleteAll() {
        this.moduleDao.deleteAll()
    }
}
