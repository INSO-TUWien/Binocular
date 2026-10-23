package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.stream.Stream
import kotlin.uuid.Uuid

@Repository
internal interface IssueRepository :
    JpaRepository<IssueEntity, Long>,
    JpaSpecificationExecutor<IssueEntity> {
    fun findByIid(iid: Uuid): IssueEntity?

    fun findAllByIidIn(iids: Collection<Uuid>): List<IssueEntity>

    fun findAllByDevelopersContaining(user: DeveloperEntity): Stream<IssueEntity>
}
