package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.BranchInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.mapper.BranchMapper
import com.inso_world.binocular.infrastructure.sql.mapper.ProjectMapper
import com.inso_world.binocular.infrastructure.sql.mapper.RepositoryMapper
import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IBranchDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.BranchEntity
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Reference
import com.inso_world.binocular.model.Repository
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
internal class BranchInfrastructurePortImpl(
    @Autowired private val branchMapper: BranchMapper,
) : AbstractInfrastructurePort<Branch, BranchEntity, Long>(Long::class),
    BranchInfrastructurePort {
    @Autowired
    private lateinit var branchDao: IBranchDao

    @Autowired
    private lateinit var repositoryDao: com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IRepositoryDao

    @Autowired
    private lateinit var commitDao: com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.ICommitDao

    @Autowired
    @Lazy
    private lateinit var repositoryMapper: RepositoryMapper

    @Autowired
    @Lazy
    private lateinit var projectMapper: ProjectMapper

    @PostConstruct
    fun init() {
        super.dao = branchDao
    }

    override fun findFilesByBranchId(branchId: String): List<File> {
        TODO("Not yet implemented")
    }

    override fun findFilesByBranchId(
        branchId: String,
        pageable: Pageable,
    ): Page<File> {
        TODO("Not yet implemented")
    }

    override fun findById(id: String): Branch? {
        TODO("Not yet implemented")
    }

    override fun findByIid(iid: Reference.Id): @Valid Branch? {
        val branch = super<AbstractInfrastructurePort>.findByIid(iid)

        return branch?.let { branchMapper.toDomain(it) }
    }

    override fun findByIids(iids: Collection<Reference.Id>): List<@Valid Branch> {
        val branches = super<AbstractInfrastructurePort>.findByIids(iids)
        return branches.map { branchMapper.toDomain(it) }
    }

    override fun update(value: Branch): Branch {
        TODO("Not yet implemented")
    }

    override fun delete(value: Branch) {
        TODO("Not yet implemented")
    }

    override fun create(value: Branch): Branch {
        val owner =
            repositoryDao.findByIid(value.repositoryId)
                ?: throw IllegalStateException("Repository not found: ${value.repositoryId}")
        val head =
            commitDao.findBySha(owner, value.headSha)
                ?: throw IllegalStateException("Head commit not found: ${value.headSha} in repository ${value.repositoryId}")

        val entity = branchMapper.toEntity(value, owner, head)
        val savedEntity = branchDao.create(entity)
        return branchMapper.toDomain(savedEntity)
    }

    override fun saveAll(values: Collection<Branch>): Iterable<Branch> = values.map { create(it) }

    @Transactional(readOnly = true)
    override fun findAll(): Iterable<Branch> {
        val branches = super<AbstractInfrastructurePort>.findAllEntities()

        return branches.map { branchMapper.toDomain(it) }
    }

    @Transactional(readOnly = true)
    override fun findAll(repository: Repository): Iterable<Branch> =
        branchDao.findAll(repository).map { b ->
            branchMapper.toDomain(b)
        }

    override fun findAll(pageable: Pageable): Page<Branch> {
        TODO("Not yet implemented")
    }

    override fun findByName(name: String): Branch? {
        TODO("Not yet implemented")
    }
}
