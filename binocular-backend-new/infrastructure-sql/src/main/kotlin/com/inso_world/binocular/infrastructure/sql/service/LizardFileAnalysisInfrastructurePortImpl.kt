package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.service.LizardFileAnalysisInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.persistence.entity.LizardFileAnalysisEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.FileEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.LizardFileAnalysisRepository
import com.inso_world.binocular.infrastructure.sql.persistence.repository.FileRepository
import com.inso_world.binocular.infrastructure.sql.persistence.repository.RepositoryRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
internal class LizardFileAnalysisInfrastructurePortImpl(
    @Autowired private val lizardFileAnalysisRepository: LizardFileAnalysisRepository,
    @Autowired private val fileRepository: FileRepository,
    @Autowired private val repositoryRepository: RepositoryRepository,
) : LizardFileAnalysisInfrastructurePort {

    /**
     * IMPORTANT
     * currently also saves files if they are not already in the database, so that
     * there is a file_id to be referenced as the foreign key. Needs to be changed or removed in the future.
     *
     */

    @Transactional
    override fun saveAllRows(
        repositoryId: Long,
        rows: Collection<List<String>>,
    ) {

        val repository = repositoryRepository.findById(repositoryId)
            .orElseThrow { IllegalArgumentException("Repository not found: $repositoryId") }

        val entities =
            rows.map { columns ->
                val filePath = columns[0]

                val file = fileRepository.findByPath(filePath)
                    ?: fileRepository.save(
                        FileEntity(
                            path = filePath,
                            repository = repository,
                        ),
                    )

                LizardFileAnalysisEntity(
                    file = file,
                    filePath = filePath,
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
