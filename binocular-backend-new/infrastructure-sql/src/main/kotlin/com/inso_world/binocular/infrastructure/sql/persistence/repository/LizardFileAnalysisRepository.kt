package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.LizardFileAnalysisEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
internal interface LizardFileAnalysisRepository : JpaRepository<LizardFileAnalysisEntity, Long> {

}
