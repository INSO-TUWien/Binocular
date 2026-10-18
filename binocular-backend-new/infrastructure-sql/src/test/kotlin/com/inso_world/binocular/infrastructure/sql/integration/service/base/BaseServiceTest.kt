package com.inso_world.binocular.infrastructure.sql.integration.service.base

import com.inso_world.binocular.core.integration.base.BaseIntegrationTest
import com.inso_world.binocular.infrastructure.sql.SqlInfrastructureDataSetup
import com.inso_world.binocular.infrastructure.sql.SqlTestConfig
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.transaction.support.TransactionTemplate

@SpringBootTest
@EnableAutoConfiguration
@ContextConfiguration(
    classes = [SqlTestConfig::class],
    initializers = [
        SqlTestConfig.Initializer::class,
    ]
)
@ExtendWith(SpringExtension::class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
internal class BaseServiceTest : BaseIntegrationTest() {
    @Autowired
    private lateinit var transactionTemplate: TransactionTemplate

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var testDataSetupService: SqlInfrastructureDataSetup
//    protected lateinit var project: Project
//    protected lateinit var repository: Repository

    internal fun setUp() {
        testDataSetupService.setup()
    }

    @AfterEach
    internal fun tearDown() {
        transactionTemplate.execute {
            entityManager.flush()
            entityManager.clear()
            testDataSetupService.teardown()
        }
    }
}
