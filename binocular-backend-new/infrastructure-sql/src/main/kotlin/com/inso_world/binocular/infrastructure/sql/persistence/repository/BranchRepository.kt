package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.BranchEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import kotlin.uuid.Uuid

internal interface BranchRepository :
    JpaRepository<BranchEntity, Long>,
    JpaSpecificationExecutor<BranchEntity> {
    fun findByRepository_IdAndName(
        repositoryId: Long,
        name: String,
    ): BranchEntity?

    fun findByIid(iid: Uuid): BranchEntity?

    fun findAllByIidIn(iids: Collection<Uuid>): List<BranchEntity>
}
