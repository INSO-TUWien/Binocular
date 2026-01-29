package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.persistence.mapper.context.MappingSession
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.BranchInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.assembler.RepositoryAssembler
import com.inso_world.binocular.infrastructure.sql.mapper.BranchMapper
import com.inso_world.binocular.infrastructure.sql.mapper.ProjectMapper
import com.inso_world.binocular.infrastructure.sql.mapper.RepositoryMapper
import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IBranchDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.BranchEntity
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Reference
import com.inso_world.binocular.model.Repository
import kotlin.uuid.ExperimentalUuidApi
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
@OptIn(ExperimentalUuidApi::class)
internal class BranchInfrastructurePortImpl(
    @Autowired private val branchMapper: BranchMapper,
) : AbstractInfrastructurePort<Branch, BranchEntity, Long>(Long::class),
    BranchInfrastructurePort {

    @Autowired
    private lateinit var repositoryAssembler: RepositoryAssembler

    @Autowired
    private lateinit var branchDao: IBranchDao

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
        val branch = this.branchDao.findByIid(iid)
            ?: return null

        return repositoryAssembler
            .toDomain(branch.repository)
            .branchIds
            .find { it.value == iid.value }
            ?.let { branchId ->
                branchMapper.toDomain(branch)
            }
    }

    override fun update(value: Branch): Branch {
        TODO("Not yet implemented")
    }

    override fun delete(value: Branch) {
        TODO("Not yet implemented")
    }

    override fun create(value: Branch): Branch {
        TODO("Not yet implemented")
    }

    override fun saveAll(values: Collection<Branch>): Iterable<Branch> {
        TODO("Not yet implemented")
    }

    @MappingSession
    @Transactional(readOnly = true)
    override fun findAll(): Iterable<Branch> {
        val branches = super<AbstractInfrastructurePort>.findAllEntities()

        return branches
            .groupBy { it.repository }
            .flatMap { (repoEntity, branchEntities) ->
                val assembledRepo = repositoryAssembler.toDomain(repoEntity)
                assembledRepo.branchIds.map { branchId ->
                    val branchEntity = branchEntities.find { it.iid.value == branchId.value }
                        ?: throw IllegalStateException("BranchEntity for ${branchId} not found")
                    branchMapper.toDomain(branchEntity)
                }
            }
    }

    @MappingSession
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
