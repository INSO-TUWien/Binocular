package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.core.persistence.exception.PersistenceException
import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IBranchDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.BranchEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.BranchRepository
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Reference
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Repository

/**
 * SQL implementation of IBranchDao.
 */
@Repository
internal class BranchDao(
    @Autowired private val branchRepo: BranchRepository,
) : SqlDao<BranchEntity, Long>(),
    IBranchDao {
    init {
        this.clazz = BranchEntity::class.java
        this.repository = branchRepo
    }

    private object BranchSpecification {
        fun hasRepository(repository: com.inso_world.binocular.model.Repository): Specification<BranchEntity> =
            Specification { root, query, cb ->
                cb.equal(
                    root.get<RepositoryEntity>("repository").get<String>("local_path"),
                    repository.localPath,
                )
            }
    }

    fun findByName(
        repo: RepositoryEntity,
        name: String,
    ): BranchEntity? {
        val rId = repo.id ?: throw PersistenceException("Cannot search for repo without valid ID")
        return this.branchRepo.findByRepository_IdAndName(rId, name)
    }

    override fun findAll(repository: com.inso_world.binocular.model.Repository): Iterable<BranchEntity> =
        this.branchRepo.findAll(
            Specification.allOf(BranchSpecification.hasRepository(repository)),
        )

    override fun findByIid(iid: Branch.Id): BranchEntity? = findByIid(iid as Any)

    override fun findByIid(iid: Any): BranchEntity? {
        val uIid: kotlin.uuid.Uuid =
            when (iid) {
                is Branch.Id -> iid.value
                is Reference.Id -> iid.value
                is kotlin.uuid.Uuid -> iid
                is String -> kotlin.uuid.Uuid.parse(iid)
                else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
            }
        return this.branchRepo.findByIid(uIid)
    }

    override fun findByIids(iids: Collection<Any>): List<BranchEntity> {
        val uIids =
            iids.map { iid ->
                when (iid) {
                    is Branch.Id -> iid.value
                    is Reference.Id -> iid.value
                    is kotlin.uuid.Uuid -> iid
                    is String -> kotlin.uuid.Uuid.parse(iid)
                    else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
                }
            }
        return this.branchRepo.findAllByIidIn(uIids)
    }
}
