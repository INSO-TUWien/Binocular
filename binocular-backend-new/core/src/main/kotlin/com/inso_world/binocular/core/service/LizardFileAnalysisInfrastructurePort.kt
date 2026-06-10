package com.inso_world.binocular.core.service

interface LizardFileAnalysisInfrastructurePort {
    fun saveAllRows(rows: Collection<List<String>>)
}
