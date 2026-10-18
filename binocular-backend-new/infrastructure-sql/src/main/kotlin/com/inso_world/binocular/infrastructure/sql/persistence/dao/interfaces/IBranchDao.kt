package com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces

import com.inso_world.binocular.infrastructure.sql.persistence.entity.BranchEntity
import com.inso_world.binocular.model.Repository

internal interface IBranchDao : IDao<BranchEntity, Long> {
    fun findByIid(iid: com.inso_world.binocular.model.Branch.Id): BranchEntity?

    fun findAll(repository: Repository): Iterable<BranchEntity>
}
