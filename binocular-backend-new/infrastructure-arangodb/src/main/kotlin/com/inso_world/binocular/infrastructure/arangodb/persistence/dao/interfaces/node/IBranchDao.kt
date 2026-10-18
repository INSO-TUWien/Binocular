package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node

import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IDao
import com.inso_world.binocular.model.Branch

internal interface IBranchDao : IDao<Branch, String> {
    fun findByName(name: String): Branch?
}
