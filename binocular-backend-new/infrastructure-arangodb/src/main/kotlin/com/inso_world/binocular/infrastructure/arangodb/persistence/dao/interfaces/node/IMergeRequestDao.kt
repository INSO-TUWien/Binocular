package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IDao
import com.inso_world.binocular.model.MergeRequest
import org.springframework.data.domain.Pageable

internal interface IMergeRequestDao : IDao<MergeRequest, String> {
    fun findAll(
        pageable: Pageable,
        since: Long?,
        until: Long?
    ): Page<MergeRequest>
}
