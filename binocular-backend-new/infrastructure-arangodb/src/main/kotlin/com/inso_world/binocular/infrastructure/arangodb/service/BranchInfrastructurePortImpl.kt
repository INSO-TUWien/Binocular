package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.BranchInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IBranchFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IBranchDao
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Reference
import com.inso_world.binocular.model.Repository
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
internal class BranchInfrastructurePortImpl : BranchInfrastructurePort,
    AbstractInfrastructurePort<Branch, String>() {

    @PostConstruct
    fun init() {
        super.dao = branchDao
    }
    @Autowired private lateinit var branchDao: IBranchDao

    @Autowired private lateinit var branchFileConnectionRepository: IBranchFileConnectionDao

    companion object {
        private val logger by logger()
    }

    override fun findAll(pageable: Pageable): Page<Branch> {
        logger.trace("Getting all branches with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return branchDao.findAll(pageable)
    }

    override fun findById(id: String): Branch? {
        logger.trace("Getting branch by id: $id")
        return branchDao.findById(id)
    }

    override fun findByIid(iid: Reference.Id): @Valid Branch? {
        logger.trace("Getting branch by iid: $iid")
        return branchDao.findByIid(iid)
    }

    override fun findByIids(iids: Collection<Reference.Id>): List<@Valid Branch> {
        logger.trace("Getting branches by iids: $iids")
        return branchDao.findByIids(iids.toList())
    }

    override fun findFilesByBranchId(branchId: String): List<File> {
        logger.trace("Getting files for branch: $branchId")
        return branchFileConnectionRepository.findFilesByBranch(branchId)
    }

    override fun findFilesByBranchId(
        branchId: String,
        pageable: Pageable,
    ): Page<File> {
        logger.trace("Getting files for branch: $branchId with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return branchFileConnectionRepository.findFilesByBranch(branchId, pageable)
    }

    override fun findAll(): Iterable<Branch> = this.branchDao.findAll()

    override fun create(entity: Branch): Branch = this.branchDao.create(entity)

    override fun saveAll(entities: Collection<Branch>): Iterable<Branch> = entities.map { create(it) }

    override fun update(entity: Branch): Branch = this.branchDao.update(entity)

    override fun findAll(repository: Repository): Iterable<Branch> {
        TODO("Not yet implemented")
    }

    override fun findByName(name: String): Branch? {
        logger.trace("Getting branch by name: $name")
        return branchDao.findByName(name)
    }

    override fun deleteAll() {
        this.branchDao.deleteAll()
    }
}
