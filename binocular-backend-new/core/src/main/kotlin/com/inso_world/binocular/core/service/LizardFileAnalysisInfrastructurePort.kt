package com.inso_world.binocular.core.service

interface LizardFileAnalysisInfrastructurePort {
    fun saveAllRows(repositoryId: Long, rows: Collection<List<String>>)

    fun findAllRows(): List<List<String>>
}
