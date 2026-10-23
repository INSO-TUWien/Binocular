package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import jakarta.persistence.QueryHint
import org.hibernate.jpa.AvailableHints
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.QueryHints
import org.springframework.stereotype.Repository
import java.util.stream.Stream

@Repository
internal interface DeveloperRepository :
    JpaRepository<DeveloperEntity, Long>,
    JpaSpecificationExecutor<DeveloperEntity> {
    @QueryHints(QueryHint(name = AvailableHints.HINT_FETCH_SIZE, value = "256"))
    fun findAllByEmailIn(emails: Collection<String>): Stream<DeveloperEntity>

    fun findAllByRepository_Id(id: Long): Stream<DeveloperEntity>

    fun findByIid(iid: kotlin.uuid.Uuid): DeveloperEntity?

    fun findAllByIidIn(iids: Collection<kotlin.uuid.Uuid>): List<DeveloperEntity>
}
