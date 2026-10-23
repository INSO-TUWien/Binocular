package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
internal interface RepositoryRepository :
    JpaRepository<RepositoryEntity, Long>,
    JpaSpecificationExecutor<RepositoryEntity> {
    fun findByLocalPath(path: String): RepositoryEntity?

//    @EntityGraph(
//        attributePaths = [
// //            "commits",
// //            "commits.parents",
// //            "commits.children",
//            "branches",
//            "user"
//        ]
//    )
    @Query("select r from RepositoryEntity r where r.id = :id")
    fun findByIdWithAllRelations(
        @Param("id") id: Long
    ): RepositoryEntity?

    fun findByIid(iid: Uuid): RepositoryEntity?

    fun findAllByIidIn(iids: Collection<Uuid>): List<RepositoryEntity>
}
