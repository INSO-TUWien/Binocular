@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Repository
internal interface ProjectRepository : JpaRepository<ProjectEntity, Long> {
    fun findByName(name: String): ProjectEntity?

    fun findByIid(iid: kotlin.uuid.Uuid): ProjectEntity?
}
