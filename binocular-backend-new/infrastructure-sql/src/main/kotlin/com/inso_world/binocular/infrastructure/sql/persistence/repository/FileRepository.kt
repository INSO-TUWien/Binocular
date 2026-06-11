package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.FileEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
internal interface FileRepository : JpaRepository<FileEntity, Long> {
    fun findByPath(path: String): FileEntity?
}
