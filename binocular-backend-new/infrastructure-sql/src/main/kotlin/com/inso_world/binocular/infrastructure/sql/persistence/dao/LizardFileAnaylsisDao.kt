package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.ILizardFileAnalysisDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.LizardFileAnalysisEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.LizardFileAnalysisRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository

@Repository
internal class LizardFileAnalysisDao(
    @Autowired private val repo: LizardFileAnalysisRepository,
) : SqlDao<LizardFileAnalysisEntity, Long>(),
    ILizardFileAnalysisDao {
    init {
        this.setClazz(LizardFileAnalysisEntity::class.java)
        this.setRepository(repo)
    }

}
