package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.MergeRequestEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
internal interface MergeRequestRepository : JpaRepository<MergeRequestEntity, Long> {
    fun findByIid(iid: Uuid): MergeRequestEntity?
}
