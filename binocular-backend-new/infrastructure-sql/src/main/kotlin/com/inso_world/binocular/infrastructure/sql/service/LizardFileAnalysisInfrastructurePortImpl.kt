package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.service.LizardFileAnalysisInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.persistence.entity.LizardFileAnalysisEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.LizardFileAnalysisRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
internal class LizardFileAnalysisInfrastructurePortImpl(
    @Autowired private val lizardFileAnalysisRepository: LizardFileAnalysisRepository,
) : LizardFileAnalysisInfrastructurePort {

    @Transactional
    override fun saveAllRows(
        rows: Collection<List<String>>,
    ) {
        val entities =
            rows.map { columns ->
                LizardFileAnalysisEntity(
                    filePath = columns[0],
                ).apply {
                    maxNloc = columns[1].toDouble()
                    maxCcn = columns[2].toDouble()
                    maxTokens = columns[3].toDouble()
                    maxParameters = columns[4].toDouble()
                    maxLength = columns[5].toDouble()

                    avgNloc = columns[6].toDouble()
                    avgCcn = columns[7].toDouble()
                    avgTokens = columns[8].toDouble()
                    avgParameters = columns[9].toDouble()
                    avgLength = columns[10].toDouble()

                    functionCount = columns[11].toInt()

                    maxLizardScore = columns[12].toDouble()
                    avgLizardScore = columns[13].toDouble()

                    normalizedMaxLizardScore = columns[14].toDouble()
                    normalizedAvgLizardScore = columns[15].toDouble()
                }
            }

        lizardFileAnalysisRepository.saveAll(entities)
    }

}
