package com.inso_world.binocular.infrastructure.sql

import com.inso_world.binocular.core.data.MockTestDataProvider
import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.integration.base.InfrastructureDataSetup
import com.inso_world.binocular.infrastructure.sql.integration.service.base.deleteAllEntities
import com.inso_world.binocular.infrastructure.sql.service.BranchInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.sql.service.CommitInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.sql.service.ProjectInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.sql.service.RepositoryInfrastructurePortImpl
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionTemplate

@Component
internal class SqlInfrastructureDataSetup(
    private val entityManager: EntityManager,
    private val projectInfrastructurePort: ProjectInfrastructurePortImpl,
    private val commitInfrastructurePort: CommitInfrastructurePortImpl,
    private val repositoryInfrastructurePort: RepositoryInfrastructurePortImpl,
    private val branchInfrastructurePort: BranchInfrastructurePortImpl,
) : InfrastructureDataSetup {
    @Autowired
    private lateinit var transactionTemplate: TransactionTemplate

    private lateinit var mockTestData: MockTestDataProvider

    companion object {
        private val logger by logger()
    }

    override fun setup() {
        logger.info(">>> SqlInfrastructureDataSetup setup")
        this.mockTestData = MockTestDataProvider()

        projectInfrastructurePort.saveAll(mockTestData.testProjects)
//        repositoryInfrastructurePort.saveAll(mockTestData.testRepositories)

//        commitInfrastructurePort.saveAll(TestDataProvider.testCommits)

        logger.info("<<< SqlInfrastructureDataSetup setup")
    }

    override fun teardown() {
        logger.info(">>> SqlInfrastructureDataSetup teardown")

        transactionTemplate.execute {
            projectInfrastructurePort.deleteAllEntities()
            repositoryInfrastructurePort.deleteAllEntities()
//        branchInfrastructurePort.deleteAll()
//        commitInfrastructurePort.deleteAll()
//        userPort.deleteAll()
            entityManager.flush()
        }

        logger.info("<<< SqlInfrastructureDataSetup teardown")
    }
}
